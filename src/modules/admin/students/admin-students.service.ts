import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from 'src/database/entities/student.entity';
import StudentListDto from './dto/student-list.dto';
import User from 'src/database/entities/user.entity';
import StudentUpdateStatusDto from './dto/student-update-status.dto';
import StudentUpdateDeletionDto from './dto/student-update-deletion.dto';

@Injectable()
export class AdminStudentsService {
    constructor(
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
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
        query.leftJoinAndSelect('user.details', 'details');
        query.leftJoinAndSelect('details.nationality', 'nationality');
        query.leftJoinAndSelect('user.educations', 'educations');
        query.leftJoinAndSelect('student.parent', 'parent');
        query.leftJoinAndSelect('parent.user', 'parentUser');
        query.leftJoinAndSelect('parentUser.details', 'parentDetails');
        query.leftJoinAndSelect('parentDetails.nationality', 'parentNationality');
        query.leftJoinAndSelect('student.teacherBookings', 'teacherBookings', 'teacherBookings.isDeleted = false');
        query.leftJoinAndSelect('teacherBookings.teacher', 'teacher');
        query.leftJoinAndSelect('teacher.user', 'teacherUser');
        query.leftJoinAndSelect('teacherUser.details', 'teacherDetails');
        query.leftJoinAndSelect('teacherDetails.nationality', 'teacherNationality');
        query.leftJoinAndSelect('teacher.teacherSubjects', 'teacherSubjects', 'teacherSubjects.isDeleted = false');
        query.leftJoinAndSelect('teacherSubjects.subject', 'subject');
        query.leftJoinAndSelect('teacher.availabilities', 'availabilities', 'availabilities.isDeleted = false');
        
        query.where('student.isDeleted = :isDeleted', { isDeleted: false });

        if (typeof isActive === 'boolean') {
            query.andWhere('user.isActive = :isActive', { isActive });
        }

        if (search) {
            query.andWhere(
                '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
                { search: `%${search}%` },
            );
        }
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

    async updateStudentStatus(id: string, payload: StudentUpdateStatusDto): Promise<Student> {
        const student = await this.studentRepository.findOne({
            where: { id, isDeleted: false },
            relations: ['user'],
        });
        if (!student) {
            throw new NotFoundException('Student not found');
        }

        if (student.user) {
            student.user.isActive = payload.isActive;
            await this.userRepository.save(student.user);
        }
        return student;
    }

    async updateStudentDeletion(id: string, payload: StudentUpdateDeletionDto): Promise<Student> {
        const student = await this.studentRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!student) {
            throw new NotFoundException('Student not found');
        }
        student.isDeleted = payload.isDeleted;
        if (payload.isDeleted && student.user) {
            student.user.isActive = false;
            await this.userRepository.save(student.user);
        }
        return this.studentRepository.save(student);
    }
}
