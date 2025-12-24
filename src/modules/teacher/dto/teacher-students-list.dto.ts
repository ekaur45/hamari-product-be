import { Student } from 'src/database/entities/student.entity';
import ClassBooking from 'src/database/entities/class-booking.entity';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';

export default class TeacherStudentsListDto {
  classStudents: {
    classId: string;
    className: string;
    students: Student[];
  }[];
  oneOnOneStudents: {
    booking: TeacherBooking;
    student: Student;
  }[];
  totalStudents: number;
}

