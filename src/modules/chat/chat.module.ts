import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import SharedModule from "../shared/shared.module";
import { WebsocketsModule } from "../websockets/websockets.modules";
import { NotificationModule } from "../shared/notification/notification.module";

@Module({
  imports: [SharedModule, WebsocketsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}