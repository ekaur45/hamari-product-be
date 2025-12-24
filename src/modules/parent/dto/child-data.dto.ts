import ClassBooking from 'src/database/entities/class-booking.entity';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';
import Assignment from 'src/database/entities/assignment.entity';
import AssignmentSubmission from 'src/database/entities/assignment-submission.entity';
import StudentPerformanceDto from '../../teacher/dto/student-performance.dto';

export class ChildClassesDto {
  classes: ClassBooking[];
  total: number;
}

export class ChildAssignmentsDto {
  assignments: Assignment[];
  total: number;
}

export class ChildScheduleDto {
  courseBooking: TeacherBooking[];
  classBooking: ClassBooking[];
}

export class ChildBookingsDto {
  bookings: TeacherBooking[];
  total: number;
}

export class ChildPerformanceDto extends StudentPerformanceDto {}

