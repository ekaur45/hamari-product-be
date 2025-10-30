import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import User from './user.entity';

@Entity('user_availability')
export default class UserAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'int' })
  dayOfWeek: number; // 0..6

  @Column({ type: 'varchar', length: 5 })
  startTime: string; // HH:mm

  @Column({ type: 'varchar', length: 5 })
  endTime: string; // HH:mm

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.availability)
  @JoinColumn({ name: 'userId' })
  user: User;
}


