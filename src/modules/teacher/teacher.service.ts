import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Teacher } from 'src/database/entities/teacher.entity';
import { Pagination } from '../shared/models/api-response.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UpdateTeacherRatesDto from './dto/update-rates.dto';
import User from 'src/database/entities/user.entity';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';
import ClassEntity from 'src/database/entities/classes.entity';
import Subject from 'src/database/entities/subject.entity';
import { CreateClassDto } from './dto/create-class.dto';
@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(TeacherBooking)
    private readonly teacherBookingRepository: Repository<TeacherBooking>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
  ) { }

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
    return {
      teachers, pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    };
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
      relations: ['teacherBookings', 'teacherBookings.teacher', 'teacherBookings.student', 'teacherBookings.student.user', 'teacherBookings.teacherSubject', 'teacherBookings.availability', 'teacherBookings.teacherSubject.subject'],
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
  async getTeacherClasses(user: User): Promise<ClassEntity[]> {
    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, isDeleted: false, classes: { isDeleted: false } },
      relations: ['classes', 'classes.teacher', 'classes.teacher.user', 'classes.subject', 'classes.classBookings', 'classes.classBookings.student', 'classes.classBookings.student.user'],
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher.classes;
  }
  async getTeacherSubjects(user: User): Promise<Subject[]> {
    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, isDeleted: false },
      relations: ['teacherSubjects', 'teacherSubjects.subject'],
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher.teacherSubjects.map(subject => subject.subject);
  }
  async createClass(teacherId: string, createClassDto: CreateClassDto): Promise<ClassEntity> {
    const teacher = await this.teacherRepository.findOne({ where: { userId: teacherId, isDeleted: false }, relations: ['teacherSubjects', 'teacherSubjects.subject'] });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // check if subject exists and exists in the teacher's subjects
    const subject = await this.subjectRepository.findOne({ where: { id: createClassDto.subjectId, isDeleted: false } });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    if (!teacher.teacherSubjects.some(subject => subject.subjectId === createClassDto.subjectId)) {
      throw new ForbiddenException('You can only create classes for your own subjects');
    }
    createClassDto.teacherId = teacher.id;
    const classEntity = this.classRepository.create({
      ...createClassDto,
      scheduleDays: createClassDto.schedule ?? [],
    });
    await this.classRepository.save(classEntity);
    return classEntity;
  }
  async deleteClass(teacherId: string, classId: string): Promise<ClassEntity> {
    const classEntity = await this.classRepository.findOne({ where: { id: classId, teacherId, isDeleted: false } });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }
    await this.classRepository.update(classId, { isDeleted: true });
    return classEntity;
  }
}
