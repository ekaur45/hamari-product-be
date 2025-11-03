import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import User from './user.entity';
import Subject from './subject.entity';
import { Teacher } from './teacher.entity';
import TeacherBooking from './teacher-booking.entity';

export enum SubjectSkillLevel {
  Started = 'Started',
  Medium = 'Medium',
  Expert = 'Expert',
}
@Entity('teacher_subjects')
@Unique(['teacherId', 'subjectId'])
export default class TeacherSubject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  teacherId: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.id)
  @JoinColumn()
  teacher: Teacher;

  @Column({ type: 'uuid' })
  subjectId: string;

  @ManyToOne(() => Subject, (subject) => subject.id)
  @JoinColumn()
  subject: Subject;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fee: number | null;

  @Column({ type: 'enum', enum: SubjectSkillLevel, default: SubjectSkillLevel.Started })
  skillLevel: SubjectSkillLevel;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

@OneToMany(() => TeacherBooking, (teacherBooking) => teacherBooking.teacherSubject)
  teacherBookings: TeacherBooking[];


  // @ManyToOne(() => User, (user) => user.subjects)
  // @JoinColumn({ name: 'teacherId' })
  // user: User;


}


