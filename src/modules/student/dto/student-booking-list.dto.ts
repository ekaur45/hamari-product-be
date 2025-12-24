import TeacherBooking from 'src/database/entities/teacher-booking.entity';
import { Pagination } from '../../shared/models/api-response.model';

export default class StudentBookingListDto {
  bookings: TeacherBooking[];
  total: number;
  pagination: Pagination;
}

