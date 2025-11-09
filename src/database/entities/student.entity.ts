import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import User from './user.entity';
import { Parent } from './parent.entity';
import TeacherBooking from './teacher-booking.entity';
import ClassBooking from './class-booking.entity';
import StudentClassAttendance from './student-class-attendance.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;
 


  @Column({ nullable: true })
  tagline: string;

  @OneToOne(() => User, (user) => user.student)
  @JoinColumn()
  user: User;

  @Column({ type: 'uuid', nullable: true })
  parentId?: string;

  @ManyToOne(() => Parent, (parent) => parent.id)
  @JoinColumn()
  parent?: Parent;

  // Array of course IDs

  // Array of class IDs

  // Array of performance IDs

  // Array of enrollment IDs

  // Array of payment IDs

  // Array of attendance IDs

  @OneToMany(() => TeacherBooking, (teacherBooking) => teacherBooking.student)
  teacherBookings: TeacherBooking[];


  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => ClassBooking, (classBooking) => classBooking.student)
  classBookings: ClassBooking[];

  @OneToMany(() => StudentClassAttendance, (studentClassAttendance) => studentClassAttendance.student)
  studentClassAttendances: StudentClassAttendance[];
}
