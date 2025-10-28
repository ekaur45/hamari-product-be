import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import User from './user.entity';
import { TeacherRole, TeacherStatus } from '../../modules/shared/enums';

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

  @ManyToOne(() => User, (user) => user.academyRoles)
  teacher: User;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
