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
import { Teacher } from 'src/database/entities/teacher.entity';
import { Student } from 'src/database/entities/student.entity';
import { Parent } from 'src/database/entities/parent.entity';
import Availability from 'src/database/entities/availablility.entity';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';
import ClassBooking from 'src/database/entities/class-booking.entity';
import ClassEntity from 'src/database/entities/classes.entity';
import { Log } from 'src/database/entities/log.entity';
import { AdminActionLoggerInterceptor } from './interceptors/admin-action-logger.interceptor';
import Review from 'src/database/entities/review.entity';
import SupportTicket from 'src/database/entities/support-ticket.entity';
import Payout from 'src/database/entities/payout.entity';
import Refund from 'src/database/entities/refund.entity';
import Assignment from 'src/database/entities/assignment.entity';
import AssignmentSubmission from 'src/database/entities/assignment-submission.entity';
import BookPaymentLog from 'src/database/entities/bookpayment-log.entity';
import { CurrencyService } from './currency/currency.service';
import Currency from 'src/database/entities/currency.entity';
import { EmailModule } from './email/email.module';
import Otp from 'src/database/entities/otp.entity';
import Chat from 'src/database/entities/chat.entity';
import Conversation from 'src/database/entities/conversation.entity';
import ChatResource from 'src/database/entities/chat-resource.entity';

const ENTITIES = [
  User,
  UserDetail,
  UserEducation,
  Academy,
  AcademyTeacher,
  ParentChild,
  Subject,
  TeacherSubject,
  Teacher,
  Student,
  Parent,
  Availability,
  TeacherBooking,
  ClassBooking,
  ClassEntity,
  Log,
  Review,
  SupportTicket,
  Payout,
  Refund,
  Assignment,
  AssignmentSubmission,
  BookPaymentLog,
  Currency,
  Otp,
  Chat,
  Conversation,
  ChatResource
];

@Module({
  imports: [TypeOrmModule.forFeature([...ENTITIES]), EmailModule],
  providers: [AdminActionLoggerInterceptor, CurrencyService],
  exports: [TypeOrmModule.forFeature([...ENTITIES]), AdminActionLoggerInterceptor, CurrencyService, EmailModule],
})
export default class SharedModule { }
