import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import ClassEntity from 'src/database/entities/classes.entity';
import { Teacher } from 'src/database/entities/teacher.entity';
import Subject from 'src/database/entities/subject.entity';
import AdminClassListDto from './dto/admin-class-list.dto';
import AdminUpdateClassStatusDto from './dto/admin-update-class-status.dto';
import AdminUpdateClassScheduleDto from './dto/admin-update-class-schedule.dto';
import { ClassStatus } from 'src/modules/shared/enums';

@Injectable()
export class AdminClassesService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async listClasses(filters: {
    page: number;
    limit: number;
    search?: string;
    status?: ClassStatus;
  }): Promise<AdminClassListDto> {
    const { page, limit, search, status } = filters;

    const query = this.classRepository.createQueryBuilder('class');
    query.leftJoinAndSelect('class.teacher', 'teacher');
    query.leftJoinAndSelect('teacher.user', 'user');
    query.leftJoinAndSelect('class.subject', 'subject');
    query.where('class.isDeleted = :isDeleted', { isDeleted: false });

    if (search) {
      query.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR subject.name LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      query.andWhere('class.status = :status', { status });
    }

    query.orderBy('class.createdAt', 'DESC');
    query.skip((page - 1) * limit);
    query.take(limit);

    const [classes, total] = await query.getManyAndCount();
    const result = new AdminClassListDto();
    result.classes = classes;
    result.totalClasses = total;
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

  async updateStatus(id: string, payload: AdminUpdateClassStatusDto): Promise<ClassEntity> {
    const classEntity = await this.classRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['teacher', 'subject'],
    });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }
    if (payload.status === ClassStatus.CANCELLED && !payload.cancelReason) {
      throw new BadRequestException('cancelReason is required when cancelling a class');
    }
    classEntity.status = payload.status;
    classEntity.cancelReason = payload.status === ClassStatus.CANCELLED ? payload.cancelReason ?? null : null;
    return this.classRepository.save(classEntity);
  }

  async updateSchedule(id: string, payload: AdminUpdateClassScheduleDto): Promise<ClassEntity> {
    const classEntity = await this.classRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    const { startTime, endTime, duration, maxStudents, scheduleDays } = payload;
    if (startTime !== undefined) classEntity.startTime = startTime;
    if (endTime !== undefined) classEntity.endTime = endTime;
    if (duration !== undefined) classEntity.duration = duration;
    if (maxStudents !== undefined) classEntity.maxStudents = maxStudents;
    if (scheduleDays !== undefined) classEntity.scheduleDays = scheduleDays;

    return this.classRepository.save(classEntity);
  }
}

