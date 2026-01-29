import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Notification from "src/database/entities/notification.entity";
import User from "src/database/entities/user.entity";
import { NotificationType } from "../enums";
import { Pagination } from "../models/api-response.model";

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) {}

    async createNotification(user: User, notification: Partial<Notification>): Promise<Notification> {
        const newNotification = this.notificationRepository.create({
            type: notification.type || NotificationType.OTHER,
            title: notification.title || 'Notification',
            message: notification.message || 'You have a new notification',
            redirectPath: notification.redirectPath || '',
            redirectParams: notification.redirectParams || {},
            user,
        });
        return this.notificationRepository.save(newNotification);
    }


    async getNotifications(userId: string, page: number, limit: number): Promise< { data: Notification[], total: number, pagination: Pagination }> {
        const [notifications, total] = await this.notificationRepository.findAndCount({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
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
}