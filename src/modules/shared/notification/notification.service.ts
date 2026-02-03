import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, In, Repository } from "typeorm";
import Notification from "src/database/entities/notification.entity";
import User from "src/database/entities/user.entity";
import { NotificationType, UserRole } from "../enums";
import { Pagination } from "../models/api-response.model";
import { MainGateway } from "src/modules/websockets/main.gateway";
import { NotificationSearchDto } from "./dto/notification-search.dto";

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly mainGateway: MainGateway,
    ) {}

    async createNotification(user: User, notification: Partial<Notification>): Promise<Notification> {
        /*if([
            NotificationType.NEW_REGISTER,
            NotificationType.BOOKING_CONFIRMED,
            NotificationType.PAYMENT_CONFIRMED,
            NotificationType.PAYMENT_FAILED,
            NotificationType.PAYMENT_REFUNDED,
            NotificationType.PAYMENT_PENDING,
            NotificationType.PAYMENT_PARTIAL_REFUNDED,
            NotificationType.PAYMENT_PARTIAL_REFUNDED,
        ].includes(notification.type as NotificationType)) {
            this.createNotificationForAdmin(notification);
        }*/
        const newNotification = this.notificationRepository.create({
            type: notification.type || NotificationType.OTHER,
            title: notification.title || 'Notification',
            message: notification.message || 'You have a new notification',
            redirectPath: notification.redirectPath || '',
            redirectParams: notification.redirectParams || {},
            user,
        });
        const savedNotification = await this.notificationRepository.save(newNotification);
        this.mainGateway.server.emit(`notification_${user.id}`, { notification: savedNotification });
        return savedNotification;
    }


    async getNotifications(userId: string, filters: NotificationSearchDto): Promise< { data: Notification[], total: number, pagination: Pagination }> {
        
        let query = this.notificationRepository.createQueryBuilder('notification')
        .leftJoinAndSelect('notification.user', 'user')
        .leftJoinAndSelect('user.details', 'userDetails')
        .where('notification.user.id = :userId', { userId })
        if (filters.types && filters.types.length > 0) {
            query.andWhere('notification.type IN (:...types)', { types: filters.types });
        }
        if (filters.search) {
            query.andWhere('notification.title LIKE :search OR notification.message LIKE :search', { search: `%${filters.search}%` });
        }
        if (filters.isRead === true || filters.isRead === false) {
            query.andWhere('notification.isRead = :isRead', { isRead: filters.isRead });
        }
        query.orderBy('notification.createdAt', 'DESC');
        query.skip((filters.page - 1) * filters.limit);
        query.take(filters.limit);
        const [notifications, total] = await query.getManyAndCount();
        return {
            data: notifications,
            total,
            pagination: {
                page: filters.page,
                limit: filters.limit,
                total,
                totalPages: Math.ceil(total / filters.limit),
                hasNext: filters.page < Math.ceil(total / filters.limit),
                hasPrev: filters.page > 1,
            },
        };
    }

    async markAsReadAll(userId: string): Promise<void> {
        await this.notificationRepository.update({ user: { id: userId } }, { isRead: true });
    }
    async markAsRead(userId: string, id: string): Promise<void> {
        await this.notificationRepository.update({ id, user: { id: userId } }, { isRead: true });
    }


    async createNotificationForAdmin(notification: Partial<Notification>): Promise<void> {
        const admins = await this.userRepository.find({
            where: {
                role: In([UserRole.ADMIN]),
            },
        });
        if(admins.length > 0) {
            if(!notification.redirectPath?.includes('/admin')) {
                notification.redirectPath = '';
            }
            admins.forEach(async admin => {
                const newNotification = this.notificationRepository.create({
                    type: notification.type || NotificationType.OTHER,
                    title: notification.title || 'Notification',
                    message: notification.message || 'You have a new notification',
                    redirectPath: notification.redirectPath || '',
                    redirectParams: notification.redirectParams || {},
                    user: admin,
                });
                await this.notificationRepository.save(newNotification);
            });
        }
    }
}