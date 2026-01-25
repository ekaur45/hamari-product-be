import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from 'src/database/entities/teacher.entity';
import User from 'src/database/entities/user.entity';
import TeacherListDto from './dto/teacher-list.dti';
import TeacherUpdateStatusDto from './dto/teacher-update-status.dto';
import TeacherUpdateVerificationDto from './dto/teacher-update-verification.dto';
import TeacherUpdateDeletionDto from './dto/teacher-update-deletion.dto';
import { Log } from 'src/database/entities/log.entity';

@Injectable()
export class AdminTeachersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Teacher)
        private readonly teacherRepository: Repository<Teacher>,
        @InjectRepository(Log)
        private readonly logRepository: Repository<Log>,
    ) {}

    async getTeachers(filters: {
        page: number;
        limit: number;
        search?: string;
        isActive?: boolean;
        isVerified?: boolean;
    }): Promise<TeacherListDto> {
        const { page, limit, search, isActive, isVerified } = filters;

        
        const query = this.teacherRepository.createQueryBuilder('teacher');
        query.leftJoinAndSelect('teacher.user', 'user');
        query.leftJoinAndSelect('user.details', 'details');
        query.leftJoinAndSelect('teacher.teacherSubjects', 'teacherSubjects', 'teacherSubjects.isDeleted = false');
        query.leftJoinAndSelect('teacherSubjects.subject', 'subject');
        query.leftJoinAndSelect('teacher.teacherBookings', 'teacherBookings', 'teacherBookings.isDeleted = false');
        query.leftJoinAndSelect('teacherBookings.student', 'student');
        query.leftJoinAndSelect('teacherBookings.availability', 'availability');
        query.leftJoinAndSelect('details.nationality', 'nationality');
        query.leftJoinAndSelect('user.educations', 'educations');
        query.where('teacher.isDeleted = :isDeleted', { isDeleted: false });

        if (typeof isActive === 'boolean') {
            query.andWhere('teacher.isActive = :isActive', { isActive });
        }

        if (typeof isVerified === 'boolean') {
            query.andWhere('teacher.isVerified = :isVerified', { isVerified });
        }

        if (search) {
            query.andWhere(
                '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
                { search: `%${search}%` },
            );
        }
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
    async getTeacherDetail(id: string): Promise<Teacher> {
        const query = this.teacherRepository.createQueryBuilder("teacher");
        query.leftJoinAndSelect('teacher.user', 'user');
        query.leftJoinAndSelect('user.details', 'details');
        query.leftJoinAndSelect('teacher.teacherSubjects', 'teacherSubjects', 'teacherSubjects.isDeleted = false');
        query.leftJoinAndSelect('teacherSubjects.subject', 'subject');
        query.leftJoinAndSelect('teacher.teacherBookings', 'teacherBookings', 'teacherBookings.isDeleted = false');
        query.leftJoinAndSelect('teacherBookings.student', 'student');
        query.leftJoinAndSelect('teacherBookings.availability', 'availability');
        query.leftJoinAndSelect('details.nationality', 'nationality');
        query.leftJoinAndSelect('user.educations', 'educations');
        query.where('teacher.isDeleted = :isDeleted AND teacher.id = :id', { isDeleted: false, id });
        const teacher = await query.getOne();
        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }
        return teacher;
    }
    async updateTeacherStatus(id: string, payload: TeacherUpdateStatusDto): Promise<Teacher> {
        const teacher = await this.teacherRepository.findOne({
            where: { id, isDeleted: false },
            relations: ['user'],
        });
        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }

        teacher.isActive = payload.isActive;
        if (teacher.user) {
            teacher.user.isActive = payload.isActive;
            await this.userRepository.save(teacher.user);
        }
        return this.teacherRepository.save(teacher);
    }

    async updateTeacherVerification(id: string, payload: TeacherUpdateVerificationDto, adminId?: string): Promise<Teacher> {
        const teacher = await this.teacherRepository.findOne({
            where: { id, isDeleted: false },
            relations: ['user'],
        });
        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }
        teacher.isVerified = payload.isVerified;
        teacher.verificationNote = payload.note ?? null;
        const saved = await this.teacherRepository.save(teacher);

        // audit log (fire-and-forget)
        this.logRepository.save({
            level: 'info',
            context: 'teacher-approval',
            message: `Teacher ${payload.isVerified ? 'approved' : 'rejected'}`,
            metadata: {
                teacherId: teacher.id,
                userId: teacher.user?.id,
                adminId,
                note: payload.note,
                action: payload.isVerified ? 'approve' : 'reject',
            },
        }).catch(() => {});

        return saved;
    }

    async updateTeacherDeletion(id: string, payload: TeacherUpdateDeletionDto): Promise<Teacher> {
        const teacher = await this.teacherRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }
        teacher.isDeleted = payload.isDeleted;
        if (payload.isDeleted) {
            teacher.isActive = false;
            if (teacher.user) {
                teacher.user.isActive = false;
                await this.userRepository.save(teacher.user);
            }
        }
        return this.teacherRepository.save(teacher);
    }
}
