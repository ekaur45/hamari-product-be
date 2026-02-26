import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Teacher } from "./teacher.entity";
import { Student } from "./student.entity";
import TeacherSubject from "./teacher-subject.entity";
import { BookingStatus } from "../../modules/shared/enums";
import Availability from "./availablility.entity";
import Review from "./review.entity";
import Assignment from "./assignment.entity";
@Entity('teacher_bookings')
export default class TeacherBooking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    teacherId: string;
    @ManyToOne(() => Teacher, (teacher) => teacher.teacherBookings)
    @JoinColumn()
    teacher: Teacher;

    @Column({ type: 'uuid' })
    studentId: string;
    @ManyToOne(() => Student, (student) => student.teacherBookings)
    @JoinColumn()
    student: Student;

    @Column({ type: 'uuid' })
    teacherSubjectId: string;
    @ManyToOne(() => TeacherSubject, (teacherSubject) => teacherSubject.teacherBookings)
    @JoinColumn()
    teacherSubject: TeacherSubject;

    @Column({ type: 'uuid' })
    availabilityId: string;
    @ManyToOne(() => Availability, (availability) => availability.teacherBookings)
    @JoinColumn()
    availability: Availability;


    @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
    status: BookingStatus;

    @Column({ type: 'datetime' })
    bookingDate: Date;


    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    totalAmount: number | null;
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    paidAmount: number | null;
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    dueAmount: number | null;
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    discountAmount: number | null;


    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
    @Column({ default: false })
    isDeleted: boolean;

    @OneToMany(() => Review, (review) => review.teacherBooking)
    reviews: Review[] | null;
    

    @OneToMany(() => Assignment, assignment => assignment.teacherBooking)
    assignments: Assignment[];

}