import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import ClassEntity from 'src/database/entities/classes.entity';
import User from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { BookClassDto } from './dto/book-class.dto';
import { Student } from 'src/database/entities/student.entity';
import ClassBooking from 'src/database/entities/class-booking.entity';
import { BookingStatus } from '../shared/enums';


@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(ClassBooking)
    private readonly classBookingRepository: Repository<ClassBooking>,
  ) {}

  async getClasses(user: User): Promise<ClassEntity[]> {
    const classes = await this.classRepository.find({ where: { isDeleted: false }, relations: ['teacher', 'teacher.user', 'subject', 'classBookings', 'classBookings.student', 'classBookings.student.user'] });
    return classes;
  }

  async getClass(classId: string): Promise<ClassEntity> {
    const classEntity = await this.classRepository.findOne({ where: { id: classId, isDeleted: false }, relations: ['teacher', 'teacher.user', 'subject', 'classBookings', 'classBookings.student', 'classBookings.student.user'] });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }
    return classEntity;
  }
  async bookClass(classId: string, bookClassDto: BookClassDto, user: User): Promise<ClassEntity> {
    const classEntity = await this.getClass(classId);
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }
    const student = await this.studentRepository.findOne({ where: { userId: user.id, isDeleted: false } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const classBooking = await this.classBookingRepository.save({
      classId: classEntity.id,
      studentId: student.id,
      month: bookClassDto.month,
      year: bookClassDto.year,
      status: BookingStatus.CONFIRMED,
    });
    return classEntity;
  }
}
