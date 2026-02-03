import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, In, Repository } from "typeorm";
import Notification from "src/database/entities/notification.entity";
import User from "src/database/entities/user.entity";
import { NotificationType, UserRole } from "../enums";
import { Pagination } from "../models/api-response.model";
import { MainGateway } from "src/modules/websockets/main.gateway";

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


    async getNotifications(userId: string, page: number, limit: number, type?: NotificationType): Promise< { data: Notification[], total: number, pagination: Pagination }> {
        const where: FindOptionsWhere<Notification> = { user: { id: userId } };
        if (type) {
            where.type = type;
        }
        const [notifications, total] = await this.notificationRepository.findAndCount({ where, order: { createdAt: 'DESC' } });
        return {
            data: notifications,
            total,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
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