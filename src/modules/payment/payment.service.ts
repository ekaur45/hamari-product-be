import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Payment from '../../database/entities/payment.entity';
import User from '../../database/entities/user.entity';
import Class from '../../database/entities/class.entity';
import ClassEnrollment from '../../database/entities/class-enrollment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, PaymentMethod } from '../shared/enums';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(ClassEnrollment)
    private readonly enrollmentRepository: Repository<ClassEnrollment>,
  ) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
    payerId: string,
  ): Promise<Payment> {
    const payer = await this.userRepository.findOne({
      where: { id: payerId },
    });

    if (!payer) {
      throw new NotFoundException('Payer not found');
    }

    // Validate class if provided
    if (createPaymentDto.classId) {
      const classEntity = await this.classRepository.findOne({
        where: { id: createPaymentDto.classId, isDeleted: false },
      });

      if (!classEntity) {
        throw new NotFoundException('Class not found');
      }
    }

    // Validate enrollment if provided
    if (createPaymentDto.enrollmentId) {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { id: createPaymentDto.enrollmentId, isDeleted: false },
      });

      if (!enrollment) {
        throw new NotFoundException('Enrollment not found');
      }
      if (enrollment.studentId !== payerId) {
        throw new ForbiddenException(
          'You can only pay for your own enrollments',
        );
      }
    }

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      payerId,
      status: PaymentStatus.PENDING,
    });

    return await this.paymentRepository.save(payment);
  }

  async getPayments(filters: {
    status?: PaymentStatus;
    method?: PaymentMethod;
    classId?: string;
    enrollmentId?: string;
  }): Promise<Payment[]> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.payer', 'payer')
      .leftJoinAndSelect('payment.class', 'class')
      .leftJoinAndSelect('payment.enrollment', 'enrollment')
      .where('payment.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters.method) {
      query.andWhere('payment.method = :method', { method: filters.method });
    }

    if (filters.classId) {
      query.andWhere('payment.classId = :classId', {
        classId: filters.classId,
      });
    }

    if (filters.enrollmentId) {
      query.andWhere('payment.enrollmentId = :enrollmentId', {
        enrollmentId: filters.enrollmentId,
      });
    }

    return await query.getMany();
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { payerId: userId, isDeleted: false },
      relations: ['class', 'enrollment'],
    });
  }

  async getPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['payer', 'class', 'enrollment'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async completePayment(id: string, userId: string): Promise<Payment> {
    const payment = await this.getPaymentById(id);

    if (payment.payerId !== userId) {
      throw new ForbiddenException('You can only complete your own payments');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be completed');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.paidAt = new Date();

    // Update enrollment paid amount if this is an enrollment payment
    if (payment.enrollmentId) {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { id: payment.enrollmentId },
      });

      if (enrollment) {
        enrollment.paidAmount += payment.amount;
        await this.enrollmentRepository.save(enrollment);
      }
    }

    return await this.paymentRepository.save(payment);
  }

  async refundPayment(id: string, userId: string): Promise<Payment> {
    const payment = await this.getPaymentById(id);

    if (payment.payerId !== userId) {
      throw new ForbiddenException('You can only refund your own payments');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    payment.status = PaymentStatus.REFUNDED;

    // Update enrollment paid amount if this is an enrollment payment
    if (payment.enrollmentId) {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { id: payment.enrollmentId },
      });

      if (enrollment) {
        enrollment.paidAmount -= payment.amount;
        await this.enrollmentRepository.save(enrollment);
      }
    }

    return await this.paymentRepository.save(payment);
  }

  async getPaymentStatistics(userId: string): Promise<any> {
    const payments = await this.paymentRepository.find({
      where: { payerId: userId, isDeleted: false },
    });

    const totalAmount = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );
    const completedAmount = payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const pendingAmount = payments
      .filter((p) => p.status === PaymentStatus.PENDING)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    return {
      totalPayments: payments.length,
      totalAmount,
      completedAmount,
      pendingAmount,
      refundedAmount: payments
        .filter((p) => p.status === PaymentStatus.REFUNDED)
        .reduce((sum, payment) => sum + Number(payment.amount), 0),
    };
  }
}
