import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import User from "./user.entity";

export enum SupportTicketStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
}

export enum SupportTicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

@Entity('support_tickets')
export default class SupportTicket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ length: 200 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'enum', enum: SupportTicketStatus, default: SupportTicketStatus.OPEN })
    status: SupportTicketStatus;

    @Column({ type: 'enum', enum: SupportTicketPriority, default: SupportTicketPriority.MEDIUM })
    priority: SupportTicketPriority;

    @Column({ type: 'uuid', nullable: true })
    assigneeId: string | null;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'assigneeId' })
    assignee: User | null;

    @Column({ default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

