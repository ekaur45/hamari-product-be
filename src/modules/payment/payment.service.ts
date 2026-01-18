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
import Stripe from 'stripe';
import BookPaymentLog from 'src/database/entities/bookpayment-log.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly stripe: Stripe;
  constructor(
    @InjectRepository(TeacherBooking)
    private readonly teacherBookingRepository: Repository<TeacherBooking>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(TeacherSubject)
    private readonly teacherSubjectRepository: Repository<TeacherSubject>,
    @InjectRepository(BookPaymentLog)
    private readonly bookPaymentLogRepository: Repository<BookPaymentLog>,

    private readonly configService: ConfigService,
  ) {

    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-12-15.clover',
    });

  }

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
      relations: ['subject']
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
      totalAmount: teacherSubject.hourlyRate,
    });
    if (teacherBooking) {
      const paymentIntent = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'pkr',
              unit_amount: Math.round((teacherBooking.totalAmount || 0) * 100),
              product_data: {
                name: 'Teacher Booking',
                description: 'Payment for teacher booking',
              }
            },
            quantity: 1,
          }
        ],
        mode: 'payment',
        success_url: this.configService.get<string>('FRONTEND_URL') + '/payment/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: this.configService.get<string>('FRONTEND_URL') + '/payment/cancel?session_id={CHECKOUT_SESSION_ID}',
      });

      this.logger.log(`Payment intent: ${JSON.stringify(paymentIntent)}`);
      this.bookPaymentLogRepository.save({
        bookingId: teacherBooking.id,
        amount: teacherBooking.totalAmount || 0,
        currency: 'pkr',
        paymentMethod: 'card',
        transactionId: paymentIntent.id,
        status: 'pending',
        processedAt: new Date(),
        failureReason: null,
      });
      return {
        id: teacherBooking.id,
        amount: teacherBooking.totalAmount || 0,
        currency: 'pkr',
        status: teacherBooking.status,
        bookingDate: teacherBooking.bookingDate,
        teacherId: teacherBooking.teacherId,
        studentId: teacherBooking.studentId,
        teacherSubjectId: teacherBooking.teacherSubjectId,
        availabilityId: teacherBooking.availabilityId,
        url: paymentIntent.url || '',
      };
    }
    throw new BadRequestException('Payment intent creation failed');
  }

}
