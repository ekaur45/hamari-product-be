import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Teacher } from './teacher.entity';
import ClassEntity from './classes.entity';
import TeacherBooking from './teacher-booking.entity';
import AssignmentSubmission from './assignment-submission.entity';
import User from './user.entity';

export enum AssignmentType {
  HOMEWORK = 'homework',
  PROJECT = 'project',
  QUIZ = 'quiz',
  EXAM = 'exam',
}

export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  GRADED = 'graded',
}

@Entity('assignments')
export default class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true })
  classId: string | null;

  @ManyToOne(() => ClassEntity, { nullable: true })
  @JoinColumn({ name: 'classId' })
  class: ClassEntity | null;

  @Column({ type: 'uuid', nullable: true })
  teacherBookingId: string | null;

  @ManyToOne(() => TeacherBooking, { nullable: true })
  @JoinColumn({ name: 'teacherBookingId' })
  teacherBooking: TeacherBooking | null;

  @Column({ type: 'uuid' })
  teacherId: string;

  @ManyToOne(() => Teacher)
  @JoinColumn()
  teacher: Teacher;

  @Column({ type: 'enum', enum: AssignmentType, default: AssignmentType.HOMEWORK })
  type: AssignmentType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 100 })
  maxScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  weight: number;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  submissionDate: Date | null;

  @Column({ default: false })
  allowLateSubmission: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  latePenalty: number;

  @Column({ type: 'text', nullable: true })
  instructions: string | null;

  @Column({ type: 'json', nullable: true })
  attachments: string[] | null;

  @Column({ type: 'json', nullable: true })
  rubric: any | null;

  @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.DRAFT })
  status: AssignmentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => AssignmentSubmission, (submission) => submission.assignment)
  submissions: AssignmentSubmission[];

  @Column({ type: 'uuid', nullable: true })
  studentUserId: string | null;

  @ManyToOne(() => User, (user) => user.assignments)
  @JoinColumn({ name: 'studentUserId' })
  studentUser: User | null;
}

