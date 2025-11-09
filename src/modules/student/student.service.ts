import { Injectable, NotFoundException
 } from '@nestjs/common';
import { StudentScheduleDto } from './dto/student-schedule.dto';
import User from 'src/database/entities/user.entity';
import { Student } from 'src/database/entities/student.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';


@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(TeacherBooking)
    private readonly teacherBookingRepository: Repository<TeacherBooking>,
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
}
