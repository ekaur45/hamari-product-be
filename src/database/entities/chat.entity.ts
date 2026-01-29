import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import User from "./user.entity";
import ChatResource from "./chat-resource.entity";
import Conversation from "./conversation.entity";

@Entity('chats')
export default class Chat {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    senderId: string;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn()
    sender: User;

    @Column({ type: 'uuid' })
    receiverId: string;
    
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn()
    receiver: User;

    @Column({ type: 'text', nullable: true})
    message: string | null;

    @OneToMany(() => ChatResource, (chatResource) => chatResource.chat,{cascade: true,nullable: true})
    resources: ChatResource[];

    @Column({ default: false })
    isUnsent: boolean;

    @Column({ default: false })
    isRead: boolean;

    @Column({ default: false })
    isDeleted: boolean;

    @ManyToOne(() => Conversation, (conversation) => conversation.id,{onDelete: 'CASCADE'})
    @JoinColumn()
    conversation: Conversation;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}