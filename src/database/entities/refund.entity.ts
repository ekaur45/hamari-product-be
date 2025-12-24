import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import ClassBooking from "./class-booking.entity";
import TeacherBooking from "./teacher-booking.entity";
import User from "./user.entity";

export enum RefundStatus {
    REQUESTED = 'requested',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PROCESSED = 'processed',
}

@Entity('refunds')
export default class Refund {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    classBookingId: string | null;

    @ManyToOne(() => ClassBooking, { nullable: true })
    @JoinColumn({ name: 'classBookingId' })
    classBooking: ClassBooking | null;

    @Column({ type: 'uuid', nullable: true })
    teacherBookingId: string | null;

    @ManyToOne(() => TeacherBooking, { nullable: true })
    @JoinColumn({ name: 'teacherBookingId' })
    teacherBooking: TeacherBooking | null;

    @Column({ type: 'uuid' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: RefundStatus, default: RefundStatus.REQUESTED })
    status: RefundStatus;

    @Column({ type: 'text', nullable: true })
    reason: string | null;

    @Column({ default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

