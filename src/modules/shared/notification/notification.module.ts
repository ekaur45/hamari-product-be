import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import Notification from "src/database/entities/notification.entity";
import { NotificationController } from "./notification.controller";
import User from "src/database/entities/user.entity";
import { MainGateway } from "src/modules/websockets/main.gateway";
import { JwtModule, JwtService } from "@nestjs/jwt";

@Module({
    imports: [TypeOrmModule.forFeature([Notification, User]), JwtModule],
    controllers: [NotificationController],
    providers: [NotificationService, MainGateway],
    exports: [NotificationService],
})
export class NotificationModule {
    
}