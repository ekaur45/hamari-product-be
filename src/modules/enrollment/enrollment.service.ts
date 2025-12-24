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

    const teacherBookings = await this.teacherBookingRepository.find({
      where: { studentId: student.id },
      relations: ['teacher', 'teacher.user', 'teacherSubject', 'teacherSubject.subject'],
    });

    return { classBookings, teacherBookings };
  }

  async browseClasses() {
    return await this.classRepository.find({
      relations: ['teacher', 'teacher.user', 'academy'],
      where: { isDeleted: false },
    });
  }

  async browseTeachers() {
    return await this.teacherRepository.find({
      relations: ['user', 'user.details', 'teacherSubjects', 'teacherSubjects.subject'],
      where: { isDeleted: false, isActive: true }
    });
  }
}
