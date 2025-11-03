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
import { TeacherRole, TeacherStatus } from '../../modules/shared/enums';
import { Teacher } from './teacher.entity';

@Entity('academy_teachers')
@Unique(['academyId', 'teacherId'])
export default class AcademyTeacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  academyId: string;

  @ManyToOne('Academy', 'teachers')
  academy: any;

  @Column({ type: 'uuid' })
  teacherId: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.id)
  @JoinColumn()
  teacher: Teacher;

  @Column({
    type: 'enum',
    enum: TeacherRole,
    default: TeacherRole.TEACHER,
  })
  role: TeacherRole;

  @Column({
    type: 'enum',
    enum: TeacherStatus,
    default: TeacherStatus.ACTIVE,
  })
  status: TeacherStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
