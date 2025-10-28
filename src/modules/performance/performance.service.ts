import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Performance from '../../database/entities/performance.entity';
import User from '../../database/entities/user.entity';
import Class from '../../database/entities/class.entity';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { UpdatePerformanceDto } from './dto/update-performance.dto';
import { PerformanceType, UserRole } from '../shared/enums';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async createPerformance(
    createPerformanceDto: CreatePerformanceDto,
    teacherId: string,
  ): Promise<Performance> {
    const teacher = await this.userRepository.findOne({
      where: { id: teacherId, role: UserRole.TEACHER },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const student = await this.userRepository.findOne({
      where: { id: createPerformanceDto.studentId, role: UserRole.STUDENT },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const classEntity = await this.classRepository.findOne({
      where: { id: createPerformanceDto.classId, isDeleted: false },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    // Verify teacher is teaching this class
    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You can only add performance records for your own classes',
      );
    }

    const performance = this.performanceRepository.create({
      ...createPerformanceDto,
    });

    return await this.performanceRepository.save(performance);
  }

  async getPerformances(filters: {
    type?: PerformanceType;
    studentId?: string;
    classId?: string;
  }): Promise<Performance[]> {
    const query = this.performanceRepository
      .createQueryBuilder('performance')
      .leftJoinAndSelect('performance.student', 'student')
      .leftJoinAndSelect('performance.class', 'class')
      .where('performance.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.type) {
      query.andWhere('performance.type = :type', { type: filters.type });
    }

    if (filters.studentId) {
      query.andWhere('performance.studentId = :studentId', {
        studentId: filters.studentId,
      });
    }

    if (filters.classId) {
      query.andWhere('performance.classId = :classId', {
        classId: filters.classId,
      });
    }

    return await query.getMany();
  }

  async getUserPerformance(userId: string): Promise<Performance[]> {
    return await this.performanceRepository.find({
      where: { studentId: userId, isDeleted: false },
      relations: ['class', 'class.teacher'],
    });
  }

  async getPerformanceById(id: string): Promise<Performance> {
    const performance = await this.performanceRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['student', 'class', 'class.teacher'],
    });

    if (!performance) {
      throw new NotFoundException('Performance record not found');
    }

    return performance;
  }

  async updatePerformance(
    id: string,
    updatePerformanceDto: UpdatePerformanceDto,
    userId: string,
  ): Promise<Performance> {
    const performance = await this.getPerformanceById(id);

    // Check if user is the teacher of the class
    if (performance.class.teacherId !== userId) {
      throw new ForbiddenException(
        'You can only update performance records for your own classes',
      );
    }

    Object.assign(performance, updatePerformanceDto);
    return await this.performanceRepository.save(performance);
  }

  async deletePerformance(id: string, userId: string): Promise<void> {
    const performance = await this.getPerformanceById(id);

    // Check if user is the teacher of the class
    if (performance.class.teacherId !== userId) {
      throw new ForbiddenException(
        'You can only delete performance records for your own classes',
      );
    }

    performance.isDeleted = true;
    await this.performanceRepository.save(performance);
  }

  async getStudentStatistics(studentId: string): Promise<any> {
    const performances = await this.performanceRepository.find({
      where: { studentId, isDeleted: false },
      relations: ['class'],
    });

    const totalRecords = performances.length;
    const averageScore =
      performances
        .filter((p) => p.score !== null && p.maxScore !== null)
        .reduce((sum, p) => sum + p.score / p.maxScore, 0) / totalRecords || 0;

    const performanceByType = performances.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRecords,
      averageScore: Math.round(averageScore * 100) / 100,
      performanceByType,
      recentPerformances: performances
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    };
  }
}
