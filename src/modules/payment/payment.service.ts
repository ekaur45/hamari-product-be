import {
  BadRequestException,
  Injectable,
  Logger
} from '@nestjs/common';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';
import { PaymentIntentDto } from './dto/payment-intent.dto';
import User from 'src/database/entities/user.entity';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingStatus } from '../shared/enums';
import { Student } from 'src/database/entities/student.entity';
import TeacherSubject from 'src/database/entities/teacher-subject.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @InjectRepository(TeacherBooking)
    private readonly teacherBookingRepository: Repository<TeacherBooking>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(TeacherSubject)
    private readonly teacherSubjectRepository: Repository<TeacherSubject>,
  ) { }

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto, user: User): Promise<PaymentIntentDto> {
    this.logger.log(`Creating payment intent for user ${user.id}`);
    this.logger.log(`Payment intent data: ${JSON.stringify(createPaymentIntentDto)}`);
    // get student id from user
    const student = await this.studentRepository.findOne({
      where: {
        userId: user.id,
      },
    });
    if (!student) {
      throw new BadRequestException('Student not found');
    }
    // get teacher subject id from subject id and teacher id
    const teacherSubject = await this.teacherSubjectRepository.findOne({
      where: {
        subjectId: createPaymentIntentDto.subjectId,
        teacherId: createPaymentIntentDto.teacherId,
      },
    });
    if (!teacherSubject) {
      throw new BadRequestException('Teacher subject not found');
    }
    this.logger.log(`Teacher subject: ${JSON.stringify({
      teacherId: createPaymentIntentDto.teacherId,
      studentId: student.id.toString(),
      status: BookingStatus.PENDING,
      bookingDate: createPaymentIntentDto.selectedDate,
      subjectId: createPaymentIntentDto.subjectId,
      teacherSubjectId: createPaymentIntentDto.subjectId,
      availabilityId: createPaymentIntentDto.slotId,
    })}`);
   const teacherBooking = await this.teacherBookingRepository.save({
      teacherId: createPaymentIntentDto.teacherId,
      studentId: student.id.toString(),
      status: BookingStatus.PENDING,
      bookingDate: createPaymentIntentDto.selectedDate,
      subjectId: createPaymentIntentDto.subjectId,
      teacherSubjectId: teacherSubject.id.toString(),
      availabilityId: createPaymentIntentDto.slotId,
    });
    return {
      id: teacherBooking.id,
      amount: teacherBooking.totalAmount || 0,
      currency: 'USD',
      status: teacherBooking.status,
      bookingDate: teacherBooking.bookingDate,
      teacherId: teacherBooking.teacherId,
      studentId: teacherBooking.studentId,
      teacherSubjectId: teacherBooking.teacherSubjectId,
      availabilityId: teacherBooking.availabilityId,
      url: 'http://localhost:4200/'+teacherBooking.id+'/test-payment',
    };
  }

}
