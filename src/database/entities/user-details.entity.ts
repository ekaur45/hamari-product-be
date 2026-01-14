import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import User from './user.entity';
import Nationality from './nationality.entity';

@Entity('user_details')
export default class UserDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ nullable: true })
  phone?: string;

  @Column('uuid', { nullable: true })
  nationalityId?: string;
  @OneToOne(() => Nationality, (nationality) => nationality.id)
  @JoinColumn({ name: 'nationalityId' })
  nationality?: Nationality;

  @Column({ type: 'timestamp', nullable: true })
  dateOfBirth?: Date;

  @Column({ length: 255, nullable: true })
  gender?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ length: 255, nullable: true })
  city?: string;

  @Column({ length: 255, nullable: true })
  state?: string;

  @Column({ length: 255, nullable: true })
  country?: string;

  @Column({ length: 255, nullable: true })
  zipCode?: string;

  @Column({ nullable: true })
  profileImage?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'text', nullable: true })
  skills?: string; // comma-separated optional skills for teachers

  // Relations moved to dedicated tables

  @OneToOne(() => User, (user) => user.details)
  @JoinColumn({ name: 'userId' })
  user: User;
}
