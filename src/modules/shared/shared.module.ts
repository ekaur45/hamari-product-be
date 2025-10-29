import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserDetail from 'src/database/entities/user-details.entity';
import User from 'src/database/entities/user.entity';
import UserEducation from 'src/database/entities/user-education.entity';
import UserAvailability from 'src/database/entities/user-availability.entity';
import Academy from 'src/database/entities/academy.entity';
import Class from 'src/database/entities/class.entity';
import ClassEnrollment from 'src/database/entities/class-enrollment.entity';
import Payment from 'src/database/entities/payment.entity';
import Performance from 'src/database/entities/performance.entity';
import AcademyTeacher from 'src/database/entities/academy-teacher.entity';
import ParentChild from 'src/database/entities/parent-child.entity';
import AcademyInvitation from 'src/database/entities/academy-invitation.entity';
import Subject from 'src/database/entities/subject.entity';
import TeacherSubject from 'src/database/entities/teacher-subject.entity';

const ENTITIES = [
  User,
  UserDetail,
  UserEducation,
  UserAvailability,
  Academy,
  Class,
  ClassEnrollment,
  Payment,
  Performance,
  AcademyTeacher,
  ParentChild,
  AcademyInvitation,
  Subject,
  TeacherSubject,
];

@Module({
  imports: [TypeOrmModule.forFeature([...ENTITIES])],
  exports: [TypeOrmModule.forFeature([...ENTITIES])],
})
export default class SharedModule {}
