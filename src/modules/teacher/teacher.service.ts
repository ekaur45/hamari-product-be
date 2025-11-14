import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Teacher } from 'src/database/entities/teacher.entity';
import { Pagination } from '../shared/models/api-response.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UpdateTeacherRatesDto from './dto/update-rates.dto';
import User from 'src/database/entities/user.entity';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';
@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(TeacherBooking)
    private readonly teacherBookingRepository: Repository<TeacherBooking>,
  ) {}

  async getTeachersWithPagination(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ teachers: Teacher[], pagination: Pagination }> {
    const query = this.teacherRepository.createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .leftJoinAndSelect('user.details', 'details')
      .leftJoinAndSelect('teacher.availabilities', 'availabilities')
      .leftJoinAndSelect('teacher.teacherSubjects', 'teacherSubjects')
      .leftJoinAndSelect('teacherSubjects.subject', 'subject')
      .where('teacher.isDeleted = false');
    if (search) {
      query.andWhere('user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search', { search: `%${search}%` });
    }
    query.orderBy('teacher.createdAt', 'DESC');
    query.skip((page - 1) * limit);
    query.take(limit);
    const [teachers, total] = await query.getManyAndCount();
    return { teachers, pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    } };
  }

  async getTeacherById(id: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['user', 'user.details', 'availabilities', 'teacherSubjects', 'teacherSubjects.subject'],
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher;
  }

  async updateTeacherRates(teacherId: string, updateTeacherRatesDto: UpdateTeacherRatesDto, user: User): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId, isDeleted: false },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    if (teacher.userId !== user.id) {
        throw new ForbiddenException('You can only update your own rates');
      }
    teacher.hourlyRate = updateTeacherRatesDto.hourlyRate;
    teacher.monthlyRate = updateTeacherRatesDto.monthlyRate;
    await this.teacherRepository.save(teacher);
    return teacher;
  }
  async getTeacherBookings(user: User): Promise<TeacherBooking[]> {
    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, isDeleted: false },
      relations: ['teacherBookings','teacherBookings.teacher', 'teacherBookings.student','teacherBookings.student.user', 'teacherBookings.teacherSubject', 'teacherBookings.availability', 'teacherBookings.teacherSubject.subject'],
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher.teacherBookings;
  }

  async getTeacherBookingById(bookingId: string): Promise<TeacherBooking> {
    const booking = await this.teacherBookingRepository.findOne({ where: { id: bookingId, isDeleted: false }, relations: ['teacher', 'student', 'student.user', 'teacherSubject', 'availability', 'teacherSubject.subject'] });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }
}
