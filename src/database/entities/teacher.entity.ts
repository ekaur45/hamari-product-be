import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, UpdateDateColumn, CreateDateColumn, OneToMany } from 'typeorm';
import User from './user.entity';
import TeacherSubject from './teacher-subject.entity';
import Availability from './availablility.entity';
import ClassEntity from './classes.entity';
import TeacherBooking from './teacher-booking.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  tagline: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  yearsOfExperience: string;

  @Column({ nullable: true })
  preferredSubject: string;

  @Column({ nullable: true })
  introduction: string;

  @Column({ nullable: true })
  introductionVideoUrl: string;

  @Column({ nullable: true })
  introductionVideoThumbnailUrl: string;

  @Column({ nullable: true })
  introductionVideoTitle: string;

  @Column({ nullable: true })
  introductionVideoDescription: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  hourlyRate: number;

  @OneToMany(() => TeacherSubject, (teacherSubject) => teacherSubject.teacher)
  teacherSubjects: TeacherSubject[];

  // Array of Availability objects
  @OneToMany(() => Availability, (availability) => availability.teacher)
  availabilities: Availability[];

  @Column({ default: true })
  isVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verificationNote: string | null;


  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;


  @Column({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;

  @Column({ default: false })
  isDeleted: boolean;
  
  @OneToMany(() => ClassEntity, (classEntity) => classEntity.teacher)
  classes: ClassEntity[];

  @OneToMany(() => TeacherBooking, (teacherBooking) => teacherBooking.teacher)
  teacherBookings: TeacherBooking[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyRate: number | null;
}
