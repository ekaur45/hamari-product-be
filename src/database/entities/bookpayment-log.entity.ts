import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import TeacherBooking from "./teacher-booking.entity";

@Entity('bookpayment_logs')
export default class BookPaymentLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    bookingId: string;

    @ManyToOne(() => TeacherBooking)
    @JoinColumn({ name: 'bookingId' })
    booking: TeacherBooking;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    currency: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    paymentMethod: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    transactionId: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    status: string;

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