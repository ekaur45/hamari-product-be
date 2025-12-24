import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import SharedModule from '../shared/shared.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import ClassBooking from 'src/database/entities/class-booking.entity';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';
import { Student } from 'src/database/entities/student.entity';
import ClassEntity from 'src/database/entities/classes.entity';
import { Teacher } from 'src/database/entities/teacher.entity';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([ClassBooking, TeacherBooking, Student, ClassEntity, Teacher])],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule { }
