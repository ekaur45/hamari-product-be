import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import UserDetail from './user-details.entity';
import { UserRole } from '../../modules/shared/enums';
import Academy from './academy.entity';
import UserEducation from './user-education.entity';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { Parent } from './parent.entity';


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

  @Column({ select: false })
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

  @OneToOne(() => UserDetail, (userDetail) => userDetail.user,{cascade: true})
  @JoinColumn({ name: 'id' })
  details?: UserDetail;

  @OneToMany(() => UserEducation, (userEducation) => userEducation.user,{cascade: true})
  educations?: UserEducation[] | null;


  @OneToMany(() => Academy, (academy) => academy.owner,{cascade: true})
  ownedAcademies?: Academy[] | null;

  @OneToOne(() => Student, (student) => student.user,{cascade: true})
  student?: Student | null;

  @OneToOne(() => Teacher, (teacher) => teacher.user,{cascade: true})
  teacher?: Teacher | null;

  @OneToOne(() => Parent, (parent) => parent.user,{cascade: true})
  parent?: Parent | null;
}
