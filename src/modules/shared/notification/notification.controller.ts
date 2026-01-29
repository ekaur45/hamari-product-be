import { Controller, Get, Param, Put, Query, Request, UseGuards } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import User from "src/database/entities/user.entity";
import { ApiResponseModel } from "../models/api-response.model";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { NotificationType } from "../enums";

@Controller('notifications')
@ApiTags('Notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    async getNotifications(@Request() req: { user: User }, @Query('page') page: number = 1, @Query('limit') limit: number = 10, @Query('type') type?: NotificationType) {
        const notifications = await this.notificationService.getNotifications(req.user.id, page, limit, type);
        return ApiResponseModel.success(notifications, 'Notifications retrieved successfully');
    }
    @Put('read')
    async readAllNotifications(@Request() req: { user: User }) {
        return this.notificationService.markAsReadAll(req.user.id);
    }
    @Put(':id/read')
    async readNotification(@Request() req: { user: User }, @Param('id') id: string) {
        return this.notificationService.markAsRead(req.user.id, id);
    }
}