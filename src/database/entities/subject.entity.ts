import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import TeacherSubject from './teacher-subject.entity';
import ClassEntity from './classes.entity';

@Entity('subjects')
export default class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;


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


  @OneToMany(() => ClassEntity, (classEntity) => classEntity.subject)
  classEntities: ClassEntity[];

  @OneToMany(() => TeacherSubject, (teacherSubject) => teacherSubject.subject)
  teacherSubjects: TeacherSubject[];

}


