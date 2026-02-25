import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import User from "./user.entity";
import { UserRole } from "src/modules/shared/enums";
import TeacherBooking from "./teacher-booking.entity";

@Entity('reviews')
export default class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    reviewerId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'reviewerId' })
    reviewer: User;

    @Column({ type: 'uuid' })
    revieweeId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'revieweeId' })
    reviewee: User;

    @Column({ type: 'enum', enum: UserRole })
    reviewerRole: UserRole;

    @Column({ type: 'enum', enum: UserRole })
    revieweeRole: UserRole;

    @Column({ type: 'int' })
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment: string | null;

    @Column({ default: true })
    isVisible: boolean;

    @Column({ default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;


    @Column({ type: 'uuid', nullable: true })
    teacherBookingId: string;
    @ManyToOne(() => TeacherBooking, (teacherBooking) => teacherBooking.reviews)
    @JoinColumn({ name: 'teacherBookingId' })
    teacherBooking: TeacherBooking | null;
}

