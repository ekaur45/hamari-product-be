import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './user.entity';
import { PaymentStatus, PaymentMethod } from '../../modules/shared/enums';

@Entity('payments')
export default class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({ length: 200, nullable: true })
  transactionId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid' })
  payerId: string;

  @ManyToOne(() => User, (user) => user.payments)
  payer: User;

  @Column({ type: 'uuid', nullable: true })
  classId: string;

  @ManyToOne('Class', 'payments', { nullable: true })
  class: any;

  @Column({ type: 'uuid', nullable: true })
  enrollmentId: string;

  @ManyToOne('ClassEnrollment', 'payments', { nullable: true })
  enrollment: any;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
