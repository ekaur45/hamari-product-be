import { Injectable, NotFoundException
 } from '@nestjs/common';
import { StudentScheduleDto } from './dto/student-schedule.dto';
import User from 'src/database/entities/user.entity';
import { Student } from 'src/database/entities/student.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';
import ClassEntity from 'src/database/entities/classes.entity';
import ClassBooking from 'src/database/entities/class-booking.entity';


@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(TeacherBooking)
    private readonly teacherBookingRepository: Repository<TeacherBooking>,

    @InjectRepository(ClassBooking)
    private readonly classBookingRepository: Repository<ClassBooking>,
  ) {}

  async getSchedule(user: User): Promise<StudentScheduleDto[]> {
    const student = await this.studentRepository.findOne({
      where: {
        userId: user.id,
      },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const teacherBookings = await this.teacherBookingRepository.find({
      where: {
        studentId: student.id,
      },
      relations: ['teacher', 'teacherSubject', 'availability', 'teacherSubject.subject','teacher.user'],
    });
    
    return teacherBookings;
  }
  async getClasses(user: User): Promise<ClassBooking[]> {
    const student = await this.studentRepository.findOne({
      where: {
        userId: user.id,
      },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const classBookings = await this.classBookingRepository.find({
      where: {
        studentId: student.id,
      },
      relations: ['class', 'class.teacher', 'class.teacher.user', 'class.subject', 'student', 'student.user','class.classBookings'],
    });
    return classBookings;
  }
}
