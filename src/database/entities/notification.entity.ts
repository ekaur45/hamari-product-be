import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "./user.entity";
import { NotificationType } from "src/modules/shared/enums";

// notification.entity.ts
@Entity("notifications")
export default class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: NotificationType;

  @Column()
  title: string;

  @Column({ nullable: true })
  message?: string;

  @Column({ default: false })
  isRead: boolean;

  // 👇 THIS is the important part
  @Column({ nullable: true })
  redirectPath?: string; 
  // e.g. "/chats/123", "/orders/55", "/profile"

  @Column({ type: 'json', nullable: true })
  redirectParams?: Record<string, any>;

  @ManyToOne(() => User, user => user.notifications, {
    onDelete: 'CASCADE',
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
