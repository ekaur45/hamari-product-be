import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import User from './user.entity';



@Entity('user_education')
export default class UserEducation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.educations)
  @JoinColumn()
  user: User;
  
  @Column({ type: 'varchar', length: 255 })
  instituteName: string;

  @Column({ type: 'varchar', length: 255 })
  degreeName: string;
  @Column({ type: 'int' })
  startedYear: number;
  @Column({ type: 'int', nullable: true })
  endedYear?: number;
  @Column({ type: 'boolean', default: false })
  isStillStudying: boolean;
  @Column({ type: 'text', nullable: true })
  remarks?: string;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}


