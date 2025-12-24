import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import Assignment from './assignment.entity';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';

export enum SubmissionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  RETURNED = 'returned',
}

@Entity('assignment_submissions')
export default class AssignmentSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  assignmentId: string;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions)
  @JoinColumn()
  assignment: Assignment;

  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student)
  @JoinColumn()
  student: Student;

  @Column({ type: 'json', nullable: true })
  files: string[] | null;

  @Column({ type: 'text', nullable: true })
  submissionText: string | null;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @Column({ default: false })
  isLate: boolean;

  @Column({ type: 'enum', enum: SubmissionStatus, default: SubmissionStatus.PENDING })
  status: SubmissionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  score: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxScore: number | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ type: 'timestamp', nullable: true })
  gradedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  gradedBy: string | null;

  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'gradedBy' })
  grader: Teacher | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}

