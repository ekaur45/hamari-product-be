import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import User from "./user.entity";
import { Teacher } from "./teacher.entity";
import ChatResource from "./chat-resource.entity";

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

    @OneToMany(() => ChatResource, (chatResource) => chatResource.chat,{cascade: true})
    resources: ChatResource[];

    @Column({ default: false })
    isUnsent: boolean;

    @Column({ default: false })
    isRead: boolean;

    @Column({ default: false })
    isDeleted: boolean;

    @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}