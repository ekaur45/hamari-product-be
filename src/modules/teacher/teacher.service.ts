import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '../../database/entities/user.entity';
import Class from '../../database/entities/class.entity';
import ClassEnrollment from '../../database/entities/class-enrollment.entity';
import Performance from '../../database/entities/performance.entity';
import AcademyTeacher from '../../database/entities/academy-teacher.entity';
import AcademyInvitation from '../../database/entities/academy-invitation.entity';
import { ClassType, ClassStatus, PerformanceType, UserRole } from '../shared/enums';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(ClassEnrollment)
    private readonly enrollmentRepository: Repository<ClassEnrollment>,
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
    @InjectRepository(AcademyTeacher)
    private readonly academyTeacherRepository: Repository<AcademyTeacher>,
    @InjectRepository(AcademyInvitation)
    private readonly invitationRepository: Repository<AcademyInvitation>,
  ) {}

  async getTeacherClasses(
    teacherId: string,
    filters: {
      type?: ClassType;
      status?: ClassStatus;
    } = {},
  ): Promise<any[]> {
    const query = this.classRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.academy', 'academy')
      .where('class.teacherId = :teacherId', { teacherId })
      .andWhere('class.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.type) {
      query.andWhere('class.type = :type', { type: filters.type });
    }

    if (filters.status) {
      query.andWhere('class.status = :status', { status: filters.status });
    }

    const classes = await query.getMany();

    return classes.map((classEntity) => ({
      id: classEntity.id,
      title: classEntity.title,
      description: classEntity.description,
      type: classEntity.type,
      status: classEntity.status,
      startTime: classEntity.startTime,
      endTime: classEntity.endTime,
      maxStudents: classEntity.maxStudents,
      fee: classEntity.fee,
      location: classEntity.location,
      meetingLink: classEntity.meetingLink,
      academy: classEntity.academy ? {
        id: classEntity.academy.id,
        name: classEntity.academy.name,
      } : null,
    }));
  }

  async getTeacherStudents(teacherId: string, classId?: string): Promise<any[]> {
    const query = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.class', 'class')
      .where('class.teacherId = :teacherId', { teacherId })
      .andWhere('enrollment.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('class.isDeleted = :classDeleted', { classDeleted: false });

    if (classId) {
      query.andWhere('enrollment.classId = :classId', { classId });
    }

    const enrollments = await query.getMany();

    return enrollments.map((enrollment) => ({
      id: enrollment.student.id,
      firstName: enrollment.student.firstName,
      lastName: enrollment.student.lastName,
      email: enrollment.student.email,
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        paidAmount: enrollment.paidAmount,
        createdAt: enrollment.createdAt,
      },
      class: {
        id: enrollment.class.id,
        title: enrollment.class.title,
        type: enrollment.class.type,
      },
    }));
  }

  async getTeacherAcademies(teacherId: string): Promise<any[]> {
    const academyTeachers = await this.academyTeacherRepository.find({
      where: { teacherId, isDeleted: false },
      relations: ['academy'],
    });

    return academyTeachers.map((academyTeacher) => ({
      id: academyTeacher.academy.id,
      name: academyTeacher.academy.name,
      description: academyTeacher.academy.description,
      address: academyTeacher.academy.address,
      contactEmail: academyTeacher.academy.contactEmail,
      contactPhone: academyTeacher.academy.contactPhone,
      role: academyTeacher.role,
      status: academyTeacher.status,
      salary: academyTeacher.salary,
      joinedAt: academyTeacher.createdAt,
    }));
  }

  async getTeacherInvitations(teacherId: string): Promise<any[]> {
    const invitations = await this.invitationRepository.find({
      where: { invitedTeacherId: teacherId, isDeleted: false },
      relations: ['academy', 'invitedBy'],
    });

    return invitations.map((invitation) => ({
      id: invitation.id,
      status: invitation.status,
      message: invitation.message,
      expiresAt: invitation.expiresAt,
      respondedAt: invitation.respondedAt,
      createdAt: invitation.createdAt,
      academy: {
        id: invitation.academy.id,
        name: invitation.academy.name,
        description: invitation.academy.description,
      },
      invitedBy: {
        id: invitation.invitedBy.id,
        firstName: invitation.invitedBy.firstName,
        lastName: invitation.invitedBy.lastName,
      },
    }));
  }

  async getTeacherDashboard(teacherId: string): Promise<any> {
    const [classes, students, academies, recentPerformance] = await Promise.all([
      this.getTeacherClasses(teacherId),
      this.getTeacherStudents(teacherId),
      this.getTeacherAcademies(teacherId),
      this.performanceRepository.find({
        where: { class: { teacherId }, isDeleted: false },
        relations: ['student', 'class'],
        order: { createdAt: 'DESC' },
        take: 5,
      }),
    ]);

    const activeClasses = classes.filter(c => c.status === ClassStatus.ONGOING).length;
    const scheduledClasses = classes.filter(c => c.status === ClassStatus.SCHEDULED).length;
    const completedClasses = classes.filter(c => c.status === ClassStatus.COMPLETED).length;

    return {
      summary: {
        totalClasses: classes.length,
        activeClasses,
        scheduledClasses,
        completedClasses,
        totalStudents: students.length,
        totalAcademies: academies.length,
      },
      recentClasses: classes.slice(0, 5),
      recentPerformance: recentPerformance.map(p => ({
        id: p.id,
        type: p.type,
        title: p.title,
        score: p.score,
        maxScore: p.maxScore,
        date: p.date,
        student: {
          id: p.student.id,
          firstName: p.student.firstName,
          lastName: p.student.lastName,
        },
        class: {
          id: p.class.id,
          title: p.class.title,
        },
      })),
    };
  }

  async getTeacherStatistics(teacherId: string): Promise<any> {
    const [classes, students, performances] = await Promise.all([
      this.getTeacherClasses(teacherId),
      this.getTeacherStudents(teacherId),
      this.performanceRepository.find({
        where: { class: { teacherId }, isDeleted: false },
        relations: ['student'],
      }),
    ]);

    const totalClasses = classes.length;
    const completedClasses = classes.filter(c => c.status === ClassStatus.COMPLETED).length;
    const totalStudents = students.length;
    const averageScore = performances.length > 0
      ? performances
          .filter(p => p.score !== null && p.maxScore !== null)
          .reduce((sum, p) => sum + (p.score / p.maxScore), 0) / performances.length
      : 0;

    return {
      totalClasses,
      completedClasses,
      completionRate: totalClasses > 0 ? (completedClasses / totalClasses) * 100 : 0,
      totalStudents,
      averageScore: Math.round(averageScore * 100) / 100,
      performanceByType: performances.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  async createPerformance(
    createPerformanceDto: any,
    teacherId: string,
  ): Promise<any> {
    // Verify teacher exists
    const teacher = await this.userRepository.findOne({
      where: { id: teacherId, role: UserRole.TEACHER },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Verify student exists
    const student = await this.userRepository.findOne({
      where: { id: createPerformanceDto.studentId, role: UserRole.STUDENT },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Verify class exists and teacher is teaching it
    const classEntity = await this.classRepository.findOne({
      where: { id: createPerformanceDto.classId, isDeleted: false },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException('You can only add performance records for your own classes');
    }

    const performance = this.performanceRepository.create(createPerformanceDto);
    return await this.performanceRepository.save(performance);
  }

  async updatePerformance(
    id: string,
    updatePerformanceDto: any,
    teacherId: string,
  ): Promise<any> {
    const performance = await this.performanceRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['class'],
    });

    if (!performance) {
      throw new NotFoundException('Performance record not found');
    }

    if (performance.class.teacherId !== teacherId) {
      throw new ForbiddenException('You can only update performance records for your own classes');
    }

    Object.assign(performance, updatePerformanceDto);
    return await this.performanceRepository.save(performance);
  }

  async getStudentPerformance(
    studentId: string,
    teacherId: string,
    filters: {
      classId?: string;
      type?: PerformanceType;
    } = {},
  ): Promise<any[]> {
    const query = this.performanceRepository
      .createQueryBuilder('performance')
      .leftJoinAndSelect('performance.class', 'class')
      .where('performance.studentId = :studentId', { studentId })
      .andWhere('class.teacherId = :teacherId', { teacherId })
      .andWhere('performance.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.classId) {
      query.andWhere('performance.classId = :classId', { classId: filters.classId });
    }

    if (filters.type) {
      query.andWhere('performance.type = :type', { type: filters.type });
    }

    const performances = await query.getMany();

    return performances.map((performance) => ({
      id: performance.id,
      type: performance.type,
      title: performance.title,
      description: performance.description,
      score: performance.score,
      maxScore: performance.maxScore,
      feedback: performance.feedback,
      date: performance.date,
      class: {
        id: performance.class.id,
        title: performance.class.title,
      },
    }));
  }

  async getClassStudents(classId: string, teacherId: string): Promise<any[]> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId, teacherId, isDeleted: false },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found or you are not the teacher');
    }

    const enrollments = await this.enrollmentRepository.find({
      where: { classId, isDeleted: false },
      relations: ['student'],
    });

    return enrollments.map((enrollment) => ({
      id: enrollment.student.id,
      firstName: enrollment.student.firstName,
      lastName: enrollment.student.lastName,
      email: enrollment.student.email,
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        paidAmount: enrollment.paidAmount,
        createdAt: enrollment.createdAt,
      },
    }));
  }

  async startClass(classId: string, teacherId: string): Promise<any> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId, teacherId, isDeleted: false },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found or you are not the teacher');
    }

    if (classEntity.status !== ClassStatus.SCHEDULED) {
      throw new ForbiddenException('Only scheduled classes can be started');
    }

    classEntity.status = ClassStatus.ONGOING;
    return await this.classRepository.save(classEntity);
  }

  async completeClass(classId: string, teacherId: string): Promise<any> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId, teacherId, isDeleted: false },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found or you are not the teacher');
    }

    if (classEntity.status !== ClassStatus.ONGOING) {
      throw new ForbiddenException('Only ongoing classes can be completed');
    }

    classEntity.status = ClassStatus.COMPLETED;
    return await this.classRepository.save(classEntity);
  }
}
