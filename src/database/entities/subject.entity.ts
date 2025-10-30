import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import Academy from './academy.entity';
import TeacherSubject from './teacher-subject.entity';

@Entity('subjects')
export default class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;


  @Column({ type: 'uuid', nullable: true })
  academyId: string;

  @ManyToOne(() => Academy, (academy) => academy.id, { nullable: true })
  academy: Academy;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;


  @OneToMany(() => TeacherSubject, (teacherSubject) => teacherSubject.subject)
  @JoinColumn({ name: 'id' })
  teacherSubjects: TeacherSubject[];
}


