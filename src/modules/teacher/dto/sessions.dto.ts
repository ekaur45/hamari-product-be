import TeacherBooking from "src/database/entities/teacher-booking.entity";
import { Pagination } from "src/modules/shared/models/api-response.model";

export class TeacherSessionsDto {
    sessions: TeacherBooking[];
    pagination: Pagination;
}