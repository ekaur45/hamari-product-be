import { Module } from "@nestjs/common";
import { CallGateway } from "./call-gateway/call.gateway";
import { ChatGateway } from "./chat-gateway/chat.gateway";
import SharedModule from "../shared/shared.module";
import { ClassRoomGateway } from "./class-room-gateway/class-room-gateway";

@Module({
  imports: [
    SharedModule,
  ],
  exports: [ClassRoomGateway, ChatGateway],
  providers: [ChatGateway, CallGateway, ClassRoomGateway],
})
export class WebsocketsModule {}