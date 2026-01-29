import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import Chat from "src/database/entities/chat.entity";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import User from "src/database/entities/user.entity";
import { InitiateChatDto } from "./dto/iniate-chat.dto";
import { Teacher } from "src/database/entities/teacher.entity";
import Conversation from "src/database/entities/conversation.entity";
import { LoggerService } from "../logger/logger.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { ChatGateway } from "../websockets/chat-gateway/chat.gateway";
import ChatResource from "src/database/entities/chat-resource.entity";

@Injectable()
export class ChatService {
  constructor(


    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    private readonly logger: LoggerService,
    private readonly chatGateway: ChatGateway,
    @InjectRepository(ChatResource)
    private readonly chatResourceRepository: Repository<ChatResource>,
  ) {

  }

  async initiateChat(initiateChatDto: InitiateChatDto, user: User) {
    const { receiverId, message } = initiateChatDto;
  
    const receiver = await this.teacherRepository.findOne({
      where: { id: receiverId },
      relations: ['user'],
    });
  
    if (!receiver) {
      throw new NotFoundException('Receiver not found or is not a teacher');
    }
  
    const receiverUser = receiver.user;
    let conversation = await this.conversationRepository
      .createQueryBuilder('conversations')
      .innerJoin('conversations.participants', 'p')
      .where('p.id IN (:...ids)', {
        ids: [user.id, receiverUser.id],
      })
      .groupBy('conversations.id')
      .having('COUNT(DISTINCT p.id) = 2')
      .getOne();
  
    if (!conversation) {
      conversation = await this.conversationRepository.save(
        this.conversationRepository.create({
          participants: [user, receiverUser],
          name: `${user.firstName} ${user.lastName} and ${receiverUser.firstName} ${receiverUser.lastName}`,
        }),
      );
    }
    const chat = this.chatRepository.create({
      conversation,
      sender: user,
      receiver: receiverUser,
      message,
    });
  
    await this.chatRepository.save(chat);
  
    return conversation;
  }

  async getChatUsers(user: User) {
    // const conversations = await this.conversationRepository
    // .createQueryBuilder('conversations')
    // .innerJoin('conversations.participants', 'me', 'me.id = :userId', {
    //   userId: user.id,
    // })
    // .leftJoinAndSelect('conversations.participants', 'participant')
    // //.leftJoinAndSelect('participant.user', 'user')
    // .leftJoinAndSelect('participant.details', 'details')
    // .leftJoin('conversations.chats', 'chat')
    // .addOrderBy(
    //   `(SELECT MAX(chat.createdAt) FROM chats chat WHERE chat.conversationId = conversations.id)`,
    //   'DESC',
    // )
    // .getMany();

    const conversations = await this.conversationRepository
    .createQueryBuilder('conversations')
    .innerJoin('conversations.participants', 'me', 'me.id = :userId', { userId: user.id })
    .leftJoinAndSelect('conversations.participants', 'participant')
    .leftJoinAndSelect('participant.details', 'details')
    .leftJoinAndMapOne(
      "conversations.lastMessageChat",
      "conversations.chats",
      "lastChat",
      `lastChat.id = (
        SELECT c.id 
        FROM chats c 
        WHERE c.conversationId = conversations.id        
        ORDER BY c.createdAt DESC
        LIMIT 1
      )`)
    .orderBy('lastChat.createdAt', 'DESC')
    .getMany();
    this.logger.log(JSON.stringify(conversations), 'conversations - getChatUsers');
    return conversations;
  }

  async getChats(page: number, limit: number, sender: User,conversationId: string) {
    const [chats, total] = await this.chatRepository
    .createQueryBuilder('chats')
    .leftJoinAndSelect('chats.resources', 'resources')
    .innerJoinAndSelect('chats.sender', 'sender')
    .innerJoinAndSelect('chats.receiver', 'receiver')
    .innerJoinAndSelect('chats.conversation', 'conversation', 'conversation.id = :conversationId', { conversationId })
    .orderBy('chats.createdAt', 'ASC')
    .getManyAndCount();
    //const [chats, total] = await this.chatRepository.findAndCount({ where: { conversation: { id: conversationId } }, order: { createdAt: 'ASC' }, relations: ['sender', 'receiver'] });
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

  async sendMessage(sendMessageDto: SendMessageDto, user: User) {
    const { conversationId, message, resources, receiverId } = sendMessageDto;
    const conversation = await this.conversationRepository.findOne({ where: { id: conversationId } });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    const chat = await this.chatRepository.save(this.chatRepository.create({
      conversation,
      sender: user,
      receiverId: receiverId,
      message
    }));
    if(sendMessageDto.resources && sendMessageDto.resources.length > 0) {
      const newResources = sendMessageDto.resources.map(resource =>
        this.chatResourceRepository.create({ ...resource,chat, })
      );
      chat.resources = [...(chat.resources || []), ...newResources];
      await this.chatResourceRepository.save(newResources);
    }
    this.chatGateway.sendMessage(chat.conversation.id, { message: chat.message! ?? '' });
    return chat;
  }
}