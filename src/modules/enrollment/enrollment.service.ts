import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from 'src/database/entities/user.entity';
import { Student } from 'src/database/entities/student.entity';
import ClassEntity from 'src/database/entities/classes.entity';
import ClassBooking from 'src/database/entities/class-booking.entity';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';
import { Teacher } from 'src/database/entities/teacher.entity';
import { BookingStatus, UserRole } from '../shared/enums';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    @InjectRepository(ClassBooking)
    private readonly classBookingRepository: Repository<ClassBooking>,
    @InjectRepository(TeacherBooking)
    private readonly teacherBookingRepository: Repository<TeacherBooking>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) { }

  async enrollInClass(user: User, classId: string, month: any) {
    if (user.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Only students can enroll in classes');
    }

    let student = await this.studentRepository.findOne({
      where: { userId: user.id },
    });

    if (!student) {
      student = this.studentRepository.create({ userId: user.id });
      await this.studentRepository.save(student);
    }

    const classEntity = await this.classRepository.findOne({ where: { id: classId } });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    const existingBooking = await this.classBookingRepository.findOne({
      where: { studentId: student.id, classId: classId, month: month },
    });

    if (existingBooking) {
      throw new BadRequestException('You are already enrolled in this class for this month');
    }

    const booking = this.classBookingRepository.create({
      studentId: student.id,
      classId: classId,
      month: month,
      status: BookingStatus.PENDING,
    });

    return await this.classBookingRepository.save(booking);
  }

  async getStudentEnrollments(user: User) {
    const student = await this.studentRepository.findOne({
      where: { userId: user.id },
    });

    if (!student) return [];

    const classBookings = await this.classBookingRepository.find({
      where: { studentId: student.id },
      relations: ['class', 'class.teacher', 'class.teacher.user'],
    });
    const teacherBookingQuery = this.teacherBookingRepository.createQueryBuilder('teacherBooking');
    teacherBookingQuery.leftJoinAndSelect('teacherBooking.teacher', 'teacher')
    teacherBookingQuery.leftJoinAndSelect('teacher.user', 'user')
    teacherBookingQuery.leftJoinAndSelect('teacherBooking.teacherSubject', 'teacherSubject')
    teacherBookingQuery.leftJoinAndSelect('teacherSubject.subject', 'subject')
    teacherBookingQuery.where('teacherBooking.studentId = :studentId', { studentId: student.id })
    teacherBookingQuery.andWhere('teacherBooking.status not in (:...statuses)', { statuses: [BookingStatus.PENDING, BookingStatus.CANCELLED] })
    teacherBookingQuery.andWhere('teacherBooking.isDeleted = false')
    teacherBookingQuery.andWhere('teacherBooking.bookingDate >= CURRENT_TIMESTAMP')
    teacherBookingQuery.orderBy('teacherBooking.bookingDate', 'DESC');
    const teacherBookings = await teacherBookingQuery.getMany();
    return { classBookings, teacherBookings };
  }

  async browseClasses(page: number = 1, limit: number = 10, filters: { search?: string, subject?: string, maxPrice?: number } = {}) {
    const query = this.classRepository.createQueryBuilder('class')
      .leftJoinAndSelect('class.teacher', 'teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .leftJoinAndSelect('class.subject', 'subject')
      .where('class.isDeleted = false');

    if (filters.search) {
      query.andWhere('(user.firstName LIKE :search OR user.lastName LIKE :search OR subject.name LIKE :search)', { search: `%${filters.search}%` });
    }

    if (filters.subject) {
      query.andWhere('subject.name = :subjectName', { subjectName: filters.subject });
    }

    if (filters.maxPrice && filters.maxPrice < 50000) {
      query.andWhere('class.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async browseTeachers(page: number = 1, limit: number = 10, filters: { search?: string, subject?: string, maxPrice?: number } = {}) {
    const query = this.teacherRepository.createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .leftJoinAndSelect('user.details', 'details')
      .leftJoinAndSelect('teacher.availabilities', 'availabilities')
      .leftJoinAndSelect('teacher.teacherSubjects', 'teacherSubjects')
      .leftJoinAndSelect('teacherSubjects.subject', 'subject')
      .where('teacher.isDeleted = false AND teacher.isActive = true');

    if (filters.search) {
      query.andWhere('(user.firstName LIKE :search OR user.lastName LIKE :search)', { search: `%${filters.search}%` });
    }

    if (filters.subject) {
      query.andWhere('subject.name = :subjectName', { subjectName: filters.subject });
    }

    if (filters.maxPrice && filters.maxPrice < 50000) {
      query.andWhere('(teacher.monthlyRate <= :maxPrice OR teacher.monthlyRate IS NULL)', { maxPrice: filters.maxPrice });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
