import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './user.entity';
import { InvitationStatus } from '../../modules/shared/enums';

@Entity('academy_invitations')
export default class AcademyInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  academyId: string;

  @ManyToOne('Academy', 'invitations')
  academy: any;

  @Column({ type: 'uuid' })
  invitedTeacherId: string;

  @ManyToOne(() => User, (user) => user.receivedInvitations)
  invitedTeacher: User;

  @Column({ type: 'uuid' })
  invitedByUserId: string;

  @ManyToOne('User', 'sentInvitations')
  invitedBy: User;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'datetime', nullable: true })
  respondedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
