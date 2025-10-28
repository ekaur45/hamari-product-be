import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import UserDetail from './user-details.entity';
import { UserRole } from '../../modules/shared/enums';
import AcademyInvitation from './academy-invitation.entity';

@Entity('users')
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;
  @Column({ unique: false })
  username: string;

  @Column({ select: true })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.OTHER })
  role: UserRole;

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

  @OneToOne(() => UserDetail, (userDetail) => userDetail.user)
  details: UserDetail;

  // Academy relationships
  @OneToMany('Academy', 'owner')
  ownedAcademies: any[];

  @OneToMany('AcademyTeacher', 'teacher')
  academyRoles: any[];

  // Class relationships
  @OneToMany('Class', 'teacher')
  taughtClasses: any[];

  @OneToMany('ClassEnrollment', 'student')
  enrollments: any[];

  // Payment relationships
  @OneToMany('Payment', 'payer')
  payments: any[];

  // Performance relationships
  @OneToMany('Performance', 'student')
  performances: any[];

  // Parent-Child relationships
  @OneToMany('ParentChild', 'parent')
  children: any[];

  @OneToMany('ParentChild', 'child')
  parents: any[];

  // Invitation relationships
  @OneToMany('AcademyInvitation', 'invitedTeacher')
  receivedInvitations: AcademyInvitation[];

  @OneToMany('AcademyInvitation', 'invitedBy')
  sentInvitations: any[];
}
