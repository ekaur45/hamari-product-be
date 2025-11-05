import User from "src/database/entities/user.entity";
import { Pagination } from "src/modules/shared/models/api-response.model";

export default class AdminUsersListDto {
    users: User[];
    totalUsers: number;
    totalTeachers: number;
    totalStudents: number;
    totalParents: number;
    totalAcademyOwners: number;
    pagination: Pagination;
}