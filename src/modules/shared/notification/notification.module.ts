import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import Notification from "src/database/entities/notification.entity";
import { NotificationController } from "./notification.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {
    
}