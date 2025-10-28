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
import { AcademyStatus } from '../../modules/shared/enums';

@Entity('academies')
export default class Academy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 200, nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 200, nullable: true })
  website: string;

  @Column({ type: 'text', nullable: true })
  logo: string;

  @Column({
    type: 'enum',
    enum: AcademyStatus,
    default: AcademyStatus.ACTIVE,
  })
  status: AcademyStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  individualClassFee: number;

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.ownedAcademies)
  owner: User;

  @OneToMany('Class', 'academy')
  classes: any[];

  @OneToMany('AcademyTeacher', 'academy')
  teachers: any[];

  @OneToMany('AcademyInvitation', 'academy')
  invitations: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
