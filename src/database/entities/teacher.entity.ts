import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import User from './user.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  name: string;

  @Column()
  subject: string;

  @Column()
  email: string;

  @Column({ default: true })
  isActive: boolean;
  
  @OneToOne(() => User, (user) => user.teacher)
  @JoinColumn({ name: 'userId' })
  user: User;
}
