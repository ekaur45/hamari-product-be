import ClassBooking from "src/database/entities/class-booking.entity";
import TeacherBooking from "src/database/entities/teacher-booking.entity";

export class StudentScheduleDto {
    courseBooking: TeacherBooking[];
    classBooking: ClassBooking[];
}