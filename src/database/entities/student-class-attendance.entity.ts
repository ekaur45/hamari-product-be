import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Student } from "./student.entity";
import ClassBooking from "./class-booking.entity";
import { AttendanceStatus } from "src/modules/shared/enums";

@Entity('student_class_attendances')
export default class StudentClassAttendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ type: 'uuid' })
    studentId: string;
    @ManyToOne(() => Student, (student) => student.studentClassAttendances)
    @JoinColumn()
    student: Student;
    
    @Column({ type: 'uuid' })
    classBookingId: string;
    @ManyToOne(() => ClassBooking, (classBooking) => classBooking.studentClassAttendances)
    @JoinColumn()
    classBooking: ClassBooking;

    @Column({type:'date'})
    date: Date;


    @Column({type:'enum',enum:AttendanceStatus})
    status: AttendanceStatus;
}