import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Teacher } from "./teacher.entity";

export enum PayoutStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    PAID = 'paid',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

@Entity('payouts')
export default class Payout {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    teacherId: string;

    @ManyToOne(() => Teacher)
    @JoinColumn({ name: 'teacherId' })
    teacher: Teacher;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    currency: string;

    @Column({ type: 'enum', enum: PayoutStatus, default: PayoutStatus.PENDING })
    status: PayoutStatus;

    @Column({ type: 'timestamp', nullable: true })
    processedAt: Date | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    failureReason: string | null;

    @Column({ default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

