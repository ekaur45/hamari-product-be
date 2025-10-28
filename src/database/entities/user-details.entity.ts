import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import User from './user.entity';

@Entity('userdetails')
export default class UserDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'timestamp', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  profileImage?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  // Relations moved to dedicated tables

  @OneToOne(() => User, (user) => user.details)
  @JoinColumn()
  user: User;
}
