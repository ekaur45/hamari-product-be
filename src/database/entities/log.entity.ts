import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('logs')
@Index(['level'])
@Index(['timestamp'])
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['error', 'warn', 'info', 'debug', 'verbose'],
    default: 'info',
  })
  level: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  context: string;

  @Column({ type: 'text', nullable: true })
  trace: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;
}
