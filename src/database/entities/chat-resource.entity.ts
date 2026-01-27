import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Chat from "./chat.entity";

@Entity('chat_resources')
export default class ChatResource {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ type: 'uuid' })
    chatId: string;
    @ManyToOne(() => Chat, (chat) => chat.id)
    @JoinColumn()
    chat: Chat;

    @Column({type:'varchar',length:255})
    mimeType: string;

    @Column({type:'varchar',length:1000})
    fileName: string;

    @Column({type:'varchar',length:255})
    filePath: string;

    @Column({type:'varchar',length:255})
    fileSize: string;
}