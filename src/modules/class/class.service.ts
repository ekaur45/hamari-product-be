import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Class from '../../database/entities/class.entity';
import User from '../../database/entities/user.entity';
import Academy from '../../database/entities/academy.entity';
import ClassEnrollment from '../../database/entities/class-enrollment.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassType, ClassStatus, UserRole } from '../shared/enums';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Academy)
    private readonly academyRepository: Repository<Academy>,
    @InjectRepository(ClassEnrollment)
    private readonly enrollmentRepository: Repository<ClassEnrollment>,
  ) {}

  async createClass(
    createClassDto: CreateClassDto,
    teacherId: string,
  ): Promise<Class> {
    const teacher = await this.userRepository.findOne({
      where: { id: teacherId, role: UserRole.TEACHER },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Validate academy if it's an academy class
    if (createClassDto.type === ClassType.ACADEMY && createClassDto.academyId) {
      const academy = await this.academyRepository.findOne({
        where: { id: createClassDto.academyId, isDeleted: false },
      });

      if (!academy) {
        throw new NotFoundException('Academy not found');
      }
    }

    const classEntity = this.classRepository.create({
      ...createClassDto,
      teacherId,
    });

    return await this.classRepository.save(classEntity);
  }

  async getClasses(filters: {
    type?: ClassType;
    status?: ClassStatus;
    teacherId?: string;
    academyId?: string;
  }): Promise<Class[]> {
    const query = this.classRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.teacher', 'teacher')
      .leftJoinAndSelect('class.academy', 'academy')
      .where('class.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.type) {
      query.andWhere('class.type = :type', { type: filters.type });
    }

    if (filters.status) {
      query.andWhere('class.status = :status', { status: filters.status });
    }

    if (filters.teacherId) {
      query.andWhere('class.teacherId = :teacherId', {
        teacherId: filters.teacherId,
      });
    }

    if (filters.academyId) {
      query.andWhere('class.academyId = :academyId', {
        academyId: filters.academyId,
      });
    }

    return await query.getMany();
  }

  async getUserClasses(userId: string): Promise<Class[]> {
    return await this.classRepository.find({
      where: { teacherId: userId, isDeleted: false },
      relations: ['teacher', 'academy'],
    });
  }

  async getClassById(id: string): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['teacher', 'academy', 'enrollments', 'enrollments.student'],
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    return classEntity;
  }

  async updateClass(
    id: string,
    updateClassDto: UpdateClassDto,
    userId: string,
  ): Promise<Class> {
    const classEntity = await this.getClassById(id);

    if (classEntity.teacherId !== userId) {
      throw new ForbiddenException('You can only update your own classes');
    }

    if (classEntity.status === ClassStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed classes');
    }

    Object.assign(classEntity, updateClassDto);
    return await this.classRepository.save(classEntity);
  }

  async deleteClass(id: string, userId: string): Promise<void> {
    const classEntity = await this.getClassById(id);

    if (classEntity.teacherId !== userId) {
      throw new ForbiddenException('You can only delete your own classes');
    }

    if (classEntity.status === ClassStatus.ONGOING) {
      throw new BadRequestException('Cannot delete ongoing classes');
    }

    classEntity.isDeleted = true;
    await this.classRepository.save(classEntity);
  }

  async startClass(id: string, userId: string): Promise<Class> {
    const classEntity = await this.getClassById(id);

    if (classEntity.teacherId !== userId) {
      throw new ForbiddenException('Only the teacher can start the class');
    }

    if (classEntity.status !== ClassStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled classes can be started');
    }

    classEntity.status = ClassStatus.ONGOING;
    return await this.classRepository.save(classEntity);
  }

  async completeClass(id: string, userId: string): Promise<Class> {
    const classEntity = await this.getClassById(id);

    if (classEntity.teacherId !== userId) {
      throw new ForbiddenException('Only the teacher can complete the class');
    }

    if (classEntity.status !== ClassStatus.ONGOING) {
      throw new BadRequestException('Only ongoing classes can be completed');
    }

    classEntity.status = ClassStatus.COMPLETED;
    return await this.classRepository.save(classEntity);
  }

  async getClassStudents(classId: string): Promise<any[]> {
    const enrollments = await this.enrollmentRepository.find({
      where: { classId, isDeleted: false },
      relations: ['student'],
    });

    return enrollments.map((enrollment) => ({
      id: enrollment.id,
      status: enrollment.status,
      paidAmount: enrollment.paidAmount,
      createdAt: enrollment.createdAt,
      student: {
        id: enrollment.student.id,
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
        email: enrollment.student.email,
      },
    }));
  }
}
