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
import { CreateRecurringClassDto } from './dto/create-recurring-class.dto';
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
    creatorUserId: string,
  ): Promise<Class> {
    const creator = await this.userRepository.findOne({ where: { id: creatorUserId } });
    if (!creator) throw new NotFoundException('User not found');

    let teacherIdToUse: string | undefined = undefined;

    if (creator.role === UserRole.TEACHER) {
      teacherIdToUse = creatorUserId;
    } else if (creator.role === UserRole.ACADEMY_OWNER) {
      if (!createClassDto.teacherId) {
        throw new BadRequestException('teacherId is required when creating as academy owner');
      }
      // verify teacher exists
      const teacherUser = await this.userRepository.findOne({ where: { id: createClassDto.teacherId, role: UserRole.TEACHER } });
      if (!teacherUser) throw new NotFoundException('Teacher not found');
      teacherIdToUse = createClassDto.teacherId;
    } else {
      throw new ForbiddenException('Only teachers or academy owners can create classes');
    }

    // Validate academy if it's an academy class
    if (createClassDto.type === ClassType.ACADEMY) {
      if (!createClassDto.academyId) {
        throw new BadRequestException('academyId is required for academy class');
      }
      const academy = await this.academyRepository.findOne({
        where: { id: createClassDto.academyId, isDeleted: false },
      });
      if (!academy) throw new NotFoundException('Academy not found');
      if (creator.role === UserRole.ACADEMY_OWNER && academy.ownerId !== creatorUserId) {
        throw new ForbiddenException('You can only create classes for your own academy');
      }
    }

    // compatibility mapping for alternative fields
    const title = createClassDto.title ?? createClassDto.name ?? 'Untitled Class';
    const startTime = createClassDto.startTime ?? createClassDto.startDate;
    const endTime = createClassDto.endTime ?? createClassDto.endDate;
    if (!startTime || !endTime) {
      throw new BadRequestException('startTime and endTime are required');
    }

    const classEntity = this.classRepository.create({
      ...createClassDto,
      title,
      startTime: new Date(startTime as any) as any,
      endTime: new Date(endTime as any) as any,
      teacherId: teacherIdToUse!,
    });

    return await this.classRepository.save(classEntity);
  }

  async createRecurringClasses(
    createRecurringClassDto: CreateRecurringClassDto,
    creatorUserId: string,
  ): Promise<Class[]> {
    const creator = await this.userRepository.findOne({ where: { id: creatorUserId } });
    if (!creator) throw new NotFoundException('User not found');

    if (creator.role !== UserRole.ACADEMY_OWNER) {
      throw new ForbiddenException('Only academy owners can create recurring classes');
    }

    // Validate academy if it's an academy class
    if (createRecurringClassDto.type === ClassType.ACADEMY) {
      if (!createRecurringClassDto.academyId) {
        throw new BadRequestException('academyId is required for academy class');
      }
      const academy = await this.academyRepository.findOne({
        where: { id: createRecurringClassDto.academyId, isDeleted: false },
      });
      if (!academy) throw new NotFoundException('Academy not found');
      if (academy.ownerId !== creatorUserId) {
        throw new ForbiddenException('You can only create classes for your own academy');
      }
    }

    // Validate teacher exists
    const teacher = await this.userRepository.findOne({
      where: { id: createRecurringClassDto.teacherId, role: UserRole.TEACHER },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');

    const startDate = new Date(createRecurringClassDto.startDate);
    const endDate = new Date(createRecurringClassDto.endDate);
    const classes: Class[] = [];

    // Generate classes for each day in the date range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayName = currentDate
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();
      
      if (createRecurringClassDto.daysOfWeek.includes(dayName)) {
        // Create class for this day
        const classStartTime = new Date(currentDate);
        const [hours, minutes] = createRecurringClassDto.startTime.split(':').map(Number);
        classStartTime.setHours(hours, minutes, 0, 0);

        const classEndTime = new Date(currentDate);
        const [endHours, endMinutes] = createRecurringClassDto.endTime.split(':').map(Number);
        classEndTime.setHours(endHours, endMinutes, 0, 0);

        const classEntity = this.classRepository.create({
          title: `${createRecurringClassDto.title} - ${currentDate.toLocaleDateString()}`,
          description: createRecurringClassDto.description,
          type: createRecurringClassDto.type,
          startTime: classStartTime,
          endTime: classEndTime,
          maxStudents: createRecurringClassDto.maxStudents || 30,
          fee: createRecurringClassDto.fee,
          location: createRecurringClassDto.location,
          meetingLink: createRecurringClassDto.meetingLink,
          teacherId: createRecurringClassDto.teacherId,
          academyId: createRecurringClassDto.academyId,
          status: ClassStatus.SCHEDULED,
        });

        classes.push(classEntity);
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return await this.classRepository.save(classes);
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
