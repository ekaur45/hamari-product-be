import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from 'src/database/entities/student.entity';
import StudentListDto from './dto/student-list.dto';

@Injectable()
export class AdminStudentsService {
    constructor(
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
    ) {}

    async getStudents(filters: {
        page: number;
        limit: number;
        search?: string;
        isActive?: boolean;
    }): Promise<StudentListDto> {
        const { page, limit, search, isActive } = filters;
        const query = this.studentRepository.createQueryBuilder('student');
        query.leftJoinAndSelect('student.user', 'user');
        // query.where('student.isActive = :isActive', { isActive: isActive });
        // if (search) {
        //     query.andWhere('user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search', { search: `%${search}%` });
        // }
        query.orderBy('student.createdAt', 'DESC');
        query.skip((page - 1) * limit);
        query.take(limit);
        const [students, total] = await query.getManyAndCount();
        const result = new StudentListDto();
        result.students = students;
        result.totalStudents = total;
        result.totalActiveStudents = 0;//students.filter(student => student.isActive).length;
        result.newEnrollments = 0;//students.filter(student => student.isNewEnrollment).length;
        result.suspendedStudents = 0;//students.filter(student => student.isSuspended).length;
        result.pagination = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
        };
        return result;
    }
}
