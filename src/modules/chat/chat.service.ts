import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Chat from "src/database/entities/chat.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import User from "src/database/entities/user.entity";
import { InitiateChatDto } from "./dto/iniate-chat.dto";
import { Teacher } from "src/database/entities/teacher.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {

  }

  async initiateChat(initiateChatDto: InitiateChatDto, user: User) {
    const { receiverId, message } = initiateChatDto;
    const receiver = await this.teacherRepository.findOne({ where: { id: receiverId } });
    if (!receiver) {
      throw new NotFoundException('Receiver not found or is not a teacher');
    }
    const chat = this.chatRepository.create({
      senderId: user.id,
      receiverId: receiver.userId,
      message,
    });
    return this.chatRepository.save(chat);
  }

  async getChatUsers(user: User) {
    const chats = await this.chatRepository.find({
      where: [
        { senderId: user.id },
        { receiverId: user.id },
      ],
      relations: ['sender', 'sender.details', 'receiver', 'receiver.details'],
      order: { createdAt: 'DESC' },
    });
  
    const map = new Map<string, any>();
  
    for (const chat of chats) {
      const otherUser =
        chat.senderId === user.id ? chat.receiver : chat.sender;
  
      if (!map.has(otherUser.id)) {
        map.set(otherUser.id, {
          user: otherUser,
          lastMessage: chat.message,
          createdAt: chat.createdAt,
          isRead: chat.isRead,
        });
      }
    }
  
    return Array.from(map.values());
  }

  async getChats(page: number, limit: number, sender: User,receiver: string) {
    const [chats, total] = await this.chatRepository.findAndCount({ where: [{ senderId: sender.id, receiverId: receiver }, { senderId: receiver, receiverId: sender.id }], order: { createdAt: 'DESC' }, relations: ['sender', 'receiver'] });
    return {
      data: chats,
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
}