import { Body, Controller, Get, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../shared/guards/jwt-auth.guard";
import { ChatService } from "./chat.service";
import { InitiateChatDto } from "./dto/iniate-chat.dto";
import User from "src/database/entities/user.entity";

@Controller('chats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('initiate')
  async initiateChat(@Body() initiateChatDto: InitiateChatDto,

    @Request() req: { user: User },
  ) {
    return this.chatService.initiateChat(initiateChatDto, req.user);
  }

  @Get('users')
  async getChatUsers(@Request() req: { user: User }) {
    return this.chatService.getChatUsers(req.user);
  }

  @Get()
  async getChats(@Query('page') page: number = 1, @Query('limit') limit: number = 10, @Query('receiverId') receiverId: string, @Request() req: { user: User }) {
    return this.chatService.getChats(page, limit, req.user, receiverId);
  }
}