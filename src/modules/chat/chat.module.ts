import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import SharedModule from "../shared/shared.module";

@Module({
  imports: [SharedModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}