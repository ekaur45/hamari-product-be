import { AfterLoad, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import User from "./user.entity";
import Chat from "./chat.entity";
import { Expose } from "class-transformer";

@Entity('conversations')
export default class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'conversation_participants', // join table name
  })
  participants: User[];

  @OneToMany(() => Chat, (chat) => chat.conversation)
  chats: Chat[];
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
  @Column({ default: false })
  isDeleted: boolean;
  @Expose()
  lastMessage: string;

  @Expose()
  lastMessageCreatedAt: Date;

  lastMessageChat?: Chat;

  @AfterLoad()
  afterLoad() {
    if (this.lastMessageChat) {
      this.lastMessage = this.lastMessageChat.message ?? '';
      this.lastMessageCreatedAt = this.lastMessageChat.createdAt;
    }
  }
}