import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './user.entity';
import { ClassType, ClassStatus } from '../../modules/shared/enums';

@Entity('classes')
export default class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ClassType,
  })
  type: ClassType;

  @Column({
    type: 'enum',
    enum: ClassStatus,
    default: ClassStatus.SCHEDULED,
  })
  status: ClassStatus;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column({ type: 'int', default: 1 })
  maxStudents: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fee: number;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  meetingLink: string;

  @Column({ type: 'uuid' })
  teacherId: string;

  @ManyToOne(() => User, (user) => user.taughtClasses)
  teacher: User;

  @Column({ type: 'uuid', nullable: true })
  academyId: string;

  @ManyToOne('Academy', 'classes', { nullable: true })
  academy: any;

  @OneToMany('ClassEnrollment', 'class')
  enrollments: any[];

  @OneToMany('Payment', 'class')
  payments: any[];

  @OneToMany('Performance', 'class')
  performances: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
