import { Injectable, NotFoundException } from '@nestjs/common';
import Subject from 'src/database/entities/subject.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Repository } from 'typeorm';
import { Pagination } from '../shared/models/api-response.model';


@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async getSubjects({name}: {name: string}): Promise<Subject[]> {
    return await this.subjectRepository.find({
      where: { name: Like(`%${name}%`) },
      order: { name: 'ASC' },
    });
  }
  async getSubjectsWithPagination(
    page: number,
    limit: number,
    name: string="",
  ): Promise<{ subjects: Subject[], pagination: Pagination }> {
    const query = this.subjectRepository.createQueryBuilder('subject')
      .innerJoinAndSelect('subject.teacherSubjects', 'teacherSubjects')
      .innerJoinAndSelect('teacherSubjects.teacher', 'teacher')
      .innerJoinAndSelect('teacher.user', 'user')
      .innerJoinAndSelect('teacher.availabilities', 'availabilities')
      .where('subject.isDeleted = false');
    if (name) {
      query.andWhere('subject.name LIKE :name', { name: `%${name}%` });
    }
    const [subjects, total] = await query.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { subjects, pagination: {
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    } };
  }
  async getSubjectById(id: string): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['teacherSubjects', 'teacherSubjects.teacher', 'teacherSubjects.teacher.user', 'teacherSubjects.teacher.availabilities'],
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return subject;
  }
}


