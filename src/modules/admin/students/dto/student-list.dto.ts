import { Student } from "src/database/entities/student.entity";
import { Pagination } from "src/modules/shared/models/api-response.model";

export default class StudentListDto {
    students: Student[];
    totalStudents: number;
    totalActiveStudents: number;
    newEnrollments: number;
    suspendedStudents: number;
    pagination: Pagination;
}