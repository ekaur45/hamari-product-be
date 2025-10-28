import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '../../database/entities/user.entity';
import Class from '../../database/entities/class.entity';
import ClassEnrollment from '../../database/entities/class-enrollment.entity';
import Performance from '../../database/entities/performance.entity';
import Payment from '../../database/entities/payment.entity';
import { ClassType, ClassStatus, EnrollmentStatus, UserRole } from '../shared/enums';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(ClassEnrollment)
    private readonly enrollmentRepository: Repository<ClassEnrollment>,
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getStudentClasses(
    studentId: string,
    filters: {
      type?: ClassType;
      status?: ClassStatus;
    } = {},
  ): Promise<any[]> {
    const query = this.classRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.teacher', 'teacher')
      .leftJoinAndSelect('class.academy', 'academy')
      .leftJoin('class.enrollments', 'enrollment')
      .where('enrollment.studentId = :studentId', { studentId })
      .andWhere('enrollment.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('class.isDeleted = :classDeleted', { classDeleted: false });

    if (filters.type) {
      query.andWhere('class.type = :type', { type: filters.type });
    }

    if (filters.status) {
      query.andWhere('class.status = :status', { status: filters.status });
    }

    const classes = await query.getMany();

    return classes.map((classEntity) => ({
      id: classEntity.id,
      title: classEntity.title,
      description: classEntity.description,
      type: classEntity.type,
      status: classEntity.status,
      startTime: classEntity.startTime,
      endTime: classEntity.endTime,
      maxStudents: classEntity.maxStudents,
      fee: classEntity.fee,
      location: classEntity.location,
      meetingLink: classEntity.meetingLink,
      teacher: {
        id: classEntity.teacher.id,
        firstName: classEntity.teacher.firstName,
        lastName: classEntity.teacher.lastName,
        email: classEntity.teacher.email,
      },
      academy: classEntity.academy ? {
        id: classEntity.academy.id,
        name: classEntity.academy.name,
      } : null,
    }));
  }

  async getStudentEnrollments(studentId: string): Promise<any[]> {
    const enrollments = await this.enrollmentRepository.find({
      where: { studentId, isDeleted: false },
      relations: ['class', 'class.teacher', 'class.academy'],
    });

    return enrollments.map((enrollment) => ({
      id: enrollment.id,
      status: enrollment.status,
      paidAmount: enrollment.paidAmount,
      notes: enrollment.notes,
      createdAt: enrollment.createdAt,
      class: {
        id: enrollment.class.id,
        title: enrollment.class.title,
        type: enrollment.class.type,
        status: enrollment.class.status,
        startTime: enrollment.class.startTime,
        endTime: enrollment.class.endTime,
        fee: enrollment.class.fee,
        teacher: {
          id: enrollment.class.teacher.id,
          firstName: enrollment.class.teacher.firstName,
          lastName: enrollment.class.teacher.lastName,
        },
        academy: enrollment.class.academy ? {
          id: enrollment.class.academy.id,
          name: enrollment.class.academy.name,
        } : null,
      },
    }));
  }

  async getStudentPerformance(studentId: string, classId?: string): Promise<any[]> {
    const query = this.performanceRepository
      .createQueryBuilder('performance')
      .leftJoinAndSelect('performance.class', 'class')
      .leftJoinAndSelect('class.teacher', 'teacher')
      .where('performance.studentId = :studentId', { studentId })
      .andWhere('performance.isDeleted = :isDeleted', { isDeleted: false });

    if (classId) {
      query.andWhere('performance.classId = :classId', { classId });
    }

    const performances = await query.getMany();

    return performances.map((performance) => ({
      id: performance.id,
      type: performance.type,
      title: performance.title,
      description: performance.description,
      score: performance.score,
      maxScore: performance.maxScore,
      feedback: performance.feedback,
      date: performance.date,
      class: {
        id: performance.class.id,
        title: performance.class.title,
        teacher: {
          id: performance.class.teacher.id,
          firstName: performance.class.teacher.firstName,
          lastName: performance.class.teacher.lastName,
        },
      },
    }));
  }

  async getStudentPayments(studentId: string): Promise<any[]> {
    const payments = await this.paymentRepository.find({
      where: { payerId: studentId, isDeleted: false },
      relations: ['class', 'enrollment'],
    });

    return payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      transactionId: payment.transactionId,
      notes: payment.notes,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      class: payment.class ? {
        id: payment.class.id,
        title: payment.class.title,
      } : null,
    }));
  }

  async getStudentDashboard(studentId: string): Promise<any> {
    const [classes, enrollments, recentPerformance, payments] = await Promise.all([
      this.getStudentClasses(studentId),
      this.getStudentEnrollments(studentId),
      this.performanceRepository.find({
        where: { studentId, isDeleted: false },
        relations: ['class'],
        order: { date: 'DESC' },
        take: 5,
      }),
      this.paymentRepository.find({
        where: { payerId: studentId, isDeleted: false },
        order: { createdAt: 'DESC' },
        take: 5,
      }),
    ]);

    const activeClasses = classes.filter(c => c.status === ClassStatus.ONGOING).length;
    const completedClasses = classes.filter(c => c.status === ClassStatus.COMPLETED).length;
    const pendingEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.PENDING).length;

    return {
      summary: {
        totalClasses: classes.length,
        activeClasses,
        completedClasses,
        pendingEnrollments,
      },
      recentClasses: classes.slice(0, 5),
      recentPerformance: recentPerformance.map(p => ({
        id: p.id,
        type: p.type,
        title: p.title,
        score: p.score,
        maxScore: p.maxScore,
        date: p.date,
        class: {
          id: p.class.id,
          title: p.class.title,
        },
      })),
      recentPayments: payments.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        method: p.method,
        createdAt: p.createdAt,
      })),
    };
  }

  async getStudentStatistics(studentId: string): Promise<any> {
    const [classes, performances, payments] = await Promise.all([
      this.getStudentClasses(studentId),
      this.getStudentPerformance(studentId),
      this.getStudentPayments(studentId),
    ]);

    const totalClasses = classes.length;
    const completedClasses = classes.filter(c => c.status === ClassStatus.COMPLETED).length;
    const averageScore = performances.length > 0
      ? performances
          .filter(p => p.score !== null && p.maxScore !== null)
          .reduce((sum, p) => sum + (p.score / p.maxScore), 0) / performances.length
      : 0;

    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalClasses,
      completedClasses,
      completionRate: totalClasses > 0 ? (completedClasses / totalClasses) * 100 : 0,
      averageScore: Math.round(averageScore * 100) / 100,
      totalPaid,
      performanceByType: performances.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  async enrollInClass(studentId: string, classId: string): Promise<any> {
    // Verify student exists
    const student = await this.userRepository.findOne({
      where: { id: studentId, role: UserRole.STUDENT },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if class exists
    const classEntity = await this.classRepository.findOne({
      where: { id: classId, isDeleted: false },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    // Check if already enrolled
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { studentId, classId, isDeleted: false },
    });

    if (existingEnrollment) {
      throw new BadRequestException('Student is already enrolled in this class');
    }

    // Check class capacity
    const currentEnrollments = await this.enrollmentRepository.count({
      where: { classId, isDeleted: false },
    });

    if (currentEnrollments >= classEntity.maxStudents) {
      throw new BadRequestException('Class is full');
    }

    const enrollment = this.enrollmentRepository.create({
      studentId,
      classId,
      status: EnrollmentStatus.PENDING,
      paidAmount: 0,
    });

    return await this.enrollmentRepository.save(enrollment);
  }

  async unenrollFromClass(studentId: string, enrollmentId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId, studentId, isDeleted: false },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot unenroll from completed classes');
    }

    enrollment.isDeleted = true;
    await this.enrollmentRepository.save(enrollment);
  }
}
