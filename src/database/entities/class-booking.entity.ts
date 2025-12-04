import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import ClassEntity from "./classes.entity";
import { Student } from "./student.entity";
import { BookingStatus, MonthOfYear } from "src/modules/shared/enums";
import StudentClassAttendance from "./student-class-attendance.entity";

@Entity('class_bookings')
export default class ClassBooking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    studentId: string;
    @ManyToOne(() => Student, (student) => student.classBookings)
    @JoinColumn()
    student: Student;

    @Column({ type: 'uuid' })
    classId: string;
    @ManyToOne(() => ClassEntity, (classEntity) => classEntity.classBookings)
    @JoinColumn()
    class: ClassEntity;


    @Column({type:'enum',enum:MonthOfYear})
    month: MonthOfYear;


    @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
    status: BookingStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
    @Column({ default: false })
    isDeleted: boolean;


    @OneToMany(() => StudentClassAttendance, (studentClassAttendance) => studentClassAttendance.classBooking)
    studentClassAttendances: StudentClassAttendance[];

}