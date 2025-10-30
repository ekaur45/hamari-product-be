import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import User from './user.entity';
import Subject from './subject.entity';
import { Teacher } from './teacher.entity';

@Entity('teacher_subjects')
@Unique(['teacherId', 'subjectId'])
export default class TeacherSubject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  teacherId: string;

  @ManyToOne(() => User, (user) => user.id)
  teacher: User;

  @Column({ type: 'uuid' })
  subjectId: string;

  @ManyToOne(() => Subject, (subject) => subject.id)
  subject: Subject;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fee: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne(() => User, (user) => user.subjects)
  @JoinColumn({ name: 'teacherId' })
  user: User;

  @ManyToOne(() => Subject, (subject) => subject.teacherSubjects)
  @JoinColumn({ name: 'subjectId' })
  teacherSubjects: Subject;
}


