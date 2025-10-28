import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ClassEnrollment from '../../database/entities/class-enrollment.entity';
import User from '../../database/entities/user.entity';
import Class from '../../database/entities/class.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentStatus, UserRole } from '../shared/enums';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(ClassEnrollment)
    private readonly enrollmentRepository: Repository<ClassEnrollment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async createEnrollment(
    createEnrollmentDto: CreateEnrollmentDto,
    studentId: string,
  ): Promise<ClassEnrollment> {
    const student = await this.userRepository.findOne({
      where: { id: studentId, role: UserRole.STUDENT },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const classEntity = await this.classRepository.findOne({
      where: { id: createEnrollmentDto.classId, isDeleted: false },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    // Check if class has available spots
    const currentEnrollments = await this.enrollmentRepository.count({
      where: { classId: createEnrollmentDto.classId, isDeleted: false },
    });

    if (currentEnrollments >= classEntity.maxStudents) {
      throw new BadRequestException('Class is full');
    }

    // Check if student is already enrolled
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        studentId,
        classId: createEnrollmentDto.classId,
        isDeleted: false,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException(
        'Student is already enrolled in this class',
      );
    }

    const enrollment = this.enrollmentRepository.create({
      ...createEnrollmentDto,
      studentId,
      status: EnrollmentStatus.PENDING,
      paidAmount: 0,
    });

    return await this.enrollmentRepository.save(enrollment);
  }

  async getEnrollments(): Promise<ClassEnrollment[]> {
    return await this.enrollmentRepository.find({
      where: { isDeleted: false },
      relations: ['student', 'class', 'class.teacher'],
    });
  }

  async getUserEnrollments(userId: string): Promise<ClassEnrollment[]> {
    return await this.enrollmentRepository.find({
      where: { studentId: userId, isDeleted: false },
      relations: ['class', 'class.teacher'],
    });
  }

  async getEnrollmentById(id: string): Promise<ClassEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['student', 'class', 'class.teacher'],
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  async updateEnrollment(
    id: string,
    updateEnrollmentDto: UpdateEnrollmentDto,
    userId: string,
  ): Promise<ClassEnrollment> {
    const enrollment = await this.getEnrollmentById(id);

    if (enrollment.studentId !== userId) {
      throw new ForbiddenException('You can only update your own enrollments');
    }

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed enrollments');
    }

    Object.assign(enrollment, updateEnrollmentDto);
    return await this.enrollmentRepository.save(enrollment);
  }

  async cancelEnrollment(id: string, userId: string): Promise<void> {
    const enrollment = await this.getEnrollmentById(id);

    if (enrollment.studentId !== userId) {
      throw new ForbiddenException('You can only cancel your own enrollments');
    }

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed enrollments');
    }

    enrollment.status = EnrollmentStatus.CANCELLED;
    enrollment.isDeleted = true;
    await this.enrollmentRepository.save(enrollment);
  }

  async confirmEnrollment(
    id: string,
    userId: string,
  ): Promise<ClassEnrollment> {
    const enrollment = await this.getEnrollmentById(id);

    if (enrollment.studentId !== userId) {
      throw new ForbiddenException('You can only confirm your own enrollments');
    }

    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new BadRequestException(
        'Only pending enrollments can be confirmed',
      );
    }

    enrollment.status = EnrollmentStatus.CONFIRMED;
    return await this.enrollmentRepository.save(enrollment);
  }
}
