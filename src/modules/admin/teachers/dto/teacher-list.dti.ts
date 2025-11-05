import { Pagination } from "src/modules/shared/models/api-response.model";
import { Teacher } from "src/database/entities/teacher.entity";

export default class TeacherListDto {
    teachers: Teacher[];
    totalTeachers: number;
    activeTeachers: number;
    pendingVerificationTeachers: number;
    rejectedTeachers: number;
    pagination: Pagination;
}