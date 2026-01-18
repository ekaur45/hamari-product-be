import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import Subject from 'src/database/entities/subject.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Like, Repository } from 'typeorm';
import { Pagination } from '../shared/models/api-response.model';
import TeacherSubject from 'src/database/entities/teacher-subject.entity';
import UpdateSubjectRatesDto from './dto/update-subject-rates.dto';
import User from 'src/database/entities/user.entity';
import { GetSubjectRequest } from './dto/get-subject.request';


@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(TeacherSubject)
    private readonly teacherSubjectRepository: Repository<TeacherSubject>,
  ) { }

  async getSubjects({ name }: { name: string }): Promise<Subject[]> {
    return await this.subjectRepository.find({
      where: { name: Like(`%${name}%`) },
      order: { name: 'ASC' },
    });
  }
  async getSubjectsWithPagination(
    page: number,
    limit: number,
    name: string = "",
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
    return {
      subjects, pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    };
  }
  async getSubjectById(id: string): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['teacherSubjects', 'teacherSubjects.teacher', 'teacherSubjects.teacher.user', 'teacherSubjects.teacher.user.details', 'teacherSubjects.teacher.availabilities'],
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return subject;
  }


  async updateSubjectRates(updateSubjectRatesDto: Array<UpdateSubjectRatesDto>, user: User): Promise<TeacherSubject[]> {
    const teacherSubjects = await this.teacherSubjectRepository.find({
      where: { id: In(updateSubjectRatesDto.map(dto => dto.id)), isDeleted: false },
    });
    if (!teacherSubjects) {
      throw new NotFoundException('Teacher subjects not found');
    }
    if (teacherSubjects.length !== updateSubjectRatesDto.length) {
      throw new NotFoundException('Some teacher subjects not found');
    }
    for (const dto of updateSubjectRatesDto) {
      const teacherSubject = teacherSubjects.find(s => s.id === dto.id);
      if (!teacherSubject) {
        throw new NotFoundException(`Teacher subject with ID ${dto.id} not found`);
      }
      teacherSubject.hourlyRate = dto.hourlyRate;
      teacherSubject.monthlyRate = dto.monthlyRate;
      await this.teacherSubjectRepository.save(teacherSubject);
    }
    return teacherSubjects;
  }


  async getAllSubjects(request: GetSubjectRequest) {
    const { page, limit, search } = request;
    const query = this.subjectRepository.createQueryBuilder('subject')
      .innerJoinAndSelect('subject.teacherSubjects', 'teacherSubjects')
      .where('subject.isDeleted = false');
    if (search) {
      query.andWhere('subject.name LIKE :name', { name: `%${search}%` });
    }
    const [subjects, total] = await query.skip((page - 1) * limit).take(limit).getManyAndCount();
    return {
      data: subjects, pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    };

  }
}


