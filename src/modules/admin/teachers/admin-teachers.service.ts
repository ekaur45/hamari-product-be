import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from 'src/database/entities/teacher.entity';
import User from 'src/database/entities/user.entity';
import TeacherListDto from './dto/teacher-list.dti';

@Injectable()
export class AdminTeachersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Teacher)
        private readonly teacherRepository: Repository<Teacher>,
    ) {}

    async getTeachers(filters: {
        page: number;
        limit: number;
        search?: string;
        isActive?: boolean;
    }): Promise<TeacherListDto> {
        const { page, limit, search, isActive } = filters;

        
        const query = this.teacherRepository.createQueryBuilder('teacher');
        query.leftJoinAndSelect('teacher.user', 'user');
        // query.where('teacher.isActive = :isActive', { isActive: isActive });
        // if (search) {
        //     query.andWhere('user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search', { search: `%${search}%` });
        // }
        query.orderBy('teacher.createdAt', 'DESC');
        query.skip((page - 1) * limit);
        query.take(limit);

        const [teachers, total] = await query.getManyAndCount();
        const result = new TeacherListDto();
        result.teachers = teachers;
        result.totalTeachers = total;
        result.activeTeachers = teachers.filter(teacher => teacher.isActive).length;
        result.pendingVerificationTeachers = teachers.filter(teacher => !teacher.isVerified).length;
        result.rejectedTeachers = teachers.filter(teacher => teacher.isDeleted).length;
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
