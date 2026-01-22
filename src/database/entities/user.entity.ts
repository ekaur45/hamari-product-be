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
import { Expose } from 'class-transformer';
import Otp from './otp.entity';


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

  @Column({ default: false })
  isEmailVerified: boolean;

  @OneToMany(() => Otp, (otp) => otp.user,{cascade: true})
  otps?: Otp[] | null;

  @Column({ type: 'boolean', default: false })
  hasCompletedProfile: boolean;

  @Expose()
  public get isProfileComplete(): boolean {
    if(this.role === UserRole.ADMIN){
      return true;
    }
    const hasBaseInfo =
      !!this.firstName &&
      !!this.lastName &&
      !!this.details?.phone &&
      !!this.details?.nationalityId &&
      !!this.details?.dateOfBirth &&
      !!this.details?.gender &&
      !!this.details?.address &&
      !!this.details?.city &&
      !!this.details?.state &&
      !!this.details?.country &&
      !!this.details?.zipCode;
  
    if (this.role === UserRole.TEACHER) {
      return (
        hasBaseInfo &&
        !!this.teacher?.tagline &&
        this.teacher?.yearsOfExperience !== null &&
        this.teacher?.yearsOfExperience !== undefined &&
        !!this.teacher?.preferredSubject &&
        !!this.teacher?.introduction &&
        !!this.teacher?.introductionVideoUrl &&
        !!this.teacher?.introductionVideoThumbnailUrl &&
        !!this.teacher?.introductionVideoTitle &&
        !!this.teacher?.introductionVideoDescription &&
        this.teacher?.hourlyRate !== null &&
        this.teacher?.hourlyRate !== undefined &&
        this.teacher?.monthlyRate !== null &&
        this.teacher?.monthlyRate !== undefined &&
        (this.educations?.length ?? 0) > 0 &&
        (this.teacher?.teacherSubjects?.length ?? 0) > 0 &&
        (this.teacher?.availabilities?.length ?? 0) > 0
      );
    }
  
    if (this.role === UserRole.STUDENT) {
      return (
        hasBaseInfo
      );
    }
  
    if (this.role === UserRole.PARENT) {
      return hasBaseInfo;
    }
  
    return false;
  }
  
}
