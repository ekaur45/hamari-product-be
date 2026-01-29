import { Module } from "@nestjs/common";
import { CallGateway } from "./call-gateway/call.gateway";
import { ChatGateway } from "./chat-gateway/chat.gateway";
import SharedModule from "../shared/shared.module";
import { ClassRoomGateway } from "./class-room-gateway/class-room-gateway";
import { MainGateway } from "./main.gateway";
import { WsCookieGuard } from "../shared/guards/ws-auth.guard";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    SharedModule,
    JwtModule,
  ],
  exports: [ClassRoomGateway, ChatGateway, MainGateway],
  providers: [ChatGateway, CallGateway, ClassRoomGateway, MainGateway, WsCookieGuard],
})
export class WebsocketsModule {}