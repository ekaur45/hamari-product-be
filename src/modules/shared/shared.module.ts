import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserDetail from 'src/database/entities/user-details.entity';
import User from 'src/database/entities/user.entity';
import UserEducation from 'src/database/entities/user-education.entity';
import Academy from 'src/database/entities/academy.entity';
import AcademyTeacher from 'src/database/entities/academy-teacher.entity';
import ParentChild from 'src/database/entities/parent-child.entity';
import Subject from 'src/database/entities/subject.entity';
import TeacherSubject from 'src/database/entities/teacher-subject.entity';

const ENTITIES = [
  User,
  UserDetail,
  UserEducation,
  Academy,
  Performance,
  AcademyTeacher,
  ParentChild,
  Subject,
  TeacherSubject,
];

@Module({
  imports: [TypeOrmModule.forFeature([...ENTITIES])],
  exports: [TypeOrmModule.forFeature([...ENTITIES])],
})
export default class SharedModule {}
