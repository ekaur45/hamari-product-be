import { Injectable } from '@nestjs/common';
import { Teacher } from 'src/database/entities/teacher.entity';
import { Pagination } from '../shared/models/api-response.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async getTeachersWithPagination(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ teachers: Teacher[], pagination: Pagination }> {
    const query = this.teacherRepository.createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .leftJoinAndSelect('teacher.availabilities', 'availabilities')
      .leftJoinAndSelect('teacher.teacherSubjects', 'teacherSubjects')
      .leftJoinAndSelect('teacherSubjects.subject', 'subject')
      .where('teacher.isDeleted = false');
    if (search) {
      query.andWhere('user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search', { search: `%${search}%` });
    }
    query.orderBy('teacher.createdAt', 'DESC');
    query.skip((page - 1) * limit);
    query.take(limit);
    const [teachers, total] = await query.getManyAndCount();
    return { teachers, pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    } };
  }

}
