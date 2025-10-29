import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import User from '../../database/entities/user.entity';
import Class from '../../database/entities/class.entity';
import ClassEnrollment from '../../database/entities/class-enrollment.entity';
import Performance from '../../database/entities/performance.entity';
import AcademyTeacher from '../../database/entities/academy-teacher.entity';
import AcademyInvitation from '../../database/entities/academy-invitation.entity';
import { ClassType, ClassStatus, PerformanceType, UserRole, TeacherRole, TeacherStatus } from '../shared/enums';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { CreateTeacherDirectDto } from './dto/create-teacher-direct.dto';
import Academy from 'src/database/entities/academy.entity';
import TeacherSubject from 'src/database/entities/teacher-subject.entity';

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
    @InjectRepository(Academy)
    private readonly academyRepository: Repository<Academy>,
    @InjectRepository(TeacherSubject)
    private readonly teacherSubjectRepository: Repository<TeacherSubject>,
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

  async getMySubjects(teacherId: string) {
    const rows = await this.teacherSubjectRepository.find({
      where: { teacherId, isDeleted: false },
      relations: ['subject'],
    });
    return rows.map((r) => ({
      id: r.id,
      subjectId: r.subjectId,
      subjectName: r.subject?.name,
      fee: r.fee,
    }));
  }

  async addMySubject(teacherId: string, payload: { subjectId: string; fee?: number }) {
    const exists = await this.teacherSubjectRepository.findOne({ where: { teacherId, subjectId: payload.subjectId, isDeleted: false } });
    if (exists) {
      throw new ForbiddenException('Subject already added');
    }
    const row = this.teacherSubjectRepository.create({ teacherId, subjectId: payload.subjectId, fee: payload.fee ?? null });
    return await this.teacherSubjectRepository.save(row);
  }

  async updateMySubject(teacherId: string, id: string, payload: { fee?: number }) {
    const row = await this.teacherSubjectRepository.findOne({ where: { id, teacherId, isDeleted: false } });
    if (!row) throw new NotFoundException('Subject not found');
    row.fee = payload.fee ?? row.fee;
    return await this.teacherSubjectRepository.save(row);
  }

  async removeMySubject(teacherId: string, id: string) {
    const row = await this.teacherSubjectRepository.findOne({ where: { id, teacherId, isDeleted: false } });
    if (!row) throw new NotFoundException('Subject not found');
    row.isDeleted = true;
    await this.teacherSubjectRepository.save(row);
    return { success: true };
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

  async createTeacher(createTeacherDto: CreateTeacherDto): Promise<AcademyTeacher> {
    // Verify user exists and is a teacher
    const user = await this.userRepository.findOne({
      where: { id: createTeacherDto.userId, role: UserRole.TEACHER },
    });

    if (!user) {
      throw new NotFoundException('User not found or is not a teacher');
    }

    // Check if teacher is already assigned to this academy
    const existingTeacher = await this.academyTeacherRepository.findOne({
      where: { 
        academyId: createTeacherDto.academyId, 
        teacherId: createTeacherDto.userId 
      },
    });

    if (existingTeacher) {
      throw new ForbiddenException('Teacher is already assigned to this academy');
    }

    // Create academy-teacher relationship
    const academyTeacher = this.academyTeacherRepository.create({
      academyId: createTeacherDto.academyId,
      teacherId: createTeacherDto.userId,
      role: createTeacherDto.role as TeacherRole || TeacherRole.TEACHER,
      status: TeacherStatus.ACTIVE,
      salary: createTeacherDto.salary,
      notes: createTeacherDto.notes,
    });

    return await this.academyTeacherRepository.save(academyTeacher);
  }

  async createTeacherDirect(
    createTeacherDirectDto: CreateTeacherDirectDto,
    academyOwnerId: string,
  ): Promise<{ user: User; academyTeacher: AcademyTeacher }> {
    // Verify academy exists and user is the owner
    const academy = await this.academyRepository.findOne({
      where: { id: createTeacherDirectDto.academyId, ownerId: academyOwnerId },
    });

    if (!academy) {
      throw new NotFoundException('Academy not found or you are not the owner');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createTeacherDirectDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: createTeacherDirectDto.username },
    });

    if (existingUsername) {
      throw new BadRequestException('Username already taken');
    }

    // Create user account
    const user = this.userRepository.create({
      firstName: createTeacherDirectDto.firstName,
      lastName: createTeacherDirectDto.lastName,
      email: createTeacherDirectDto.email,
      username: createTeacherDirectDto.username,
      password: createTeacherDirectDto.password, // In production, hash this password
      role: UserRole.TEACHER,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Create academy-teacher relationship
    const academyTeacher = this.academyTeacherRepository.create({
      academyId: createTeacherDirectDto.academyId,
      teacherId: savedUser.id,
      role: TeacherRole.TEACHER,
      status: TeacherStatus.ACTIVE,
      salary: createTeacherDirectDto.salary,
      notes: createTeacherDirectDto.notes,
    });

    const savedAcademyTeacher = await this.academyTeacherRepository.save(academyTeacher);

    return { user: savedUser, academyTeacher: savedAcademyTeacher };
  }

  async updateTeacher(
    academyId: string,
    teacherId: string,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<AcademyTeacher> {
    const academyTeacher = await this.academyTeacherRepository.findOne({
      where: { academyId, teacherId },
      relations: ['teacher', 'academy'],
    });

    if (!academyTeacher) {
      throw new NotFoundException('Teacher not found in this academy');
    }

    // Update fields
    if (updateTeacherDto.role) {
      academyTeacher.role = updateTeacherDto.role as TeacherRole;
    }
    if (updateTeacherDto.salary !== undefined) {
      academyTeacher.salary = updateTeacherDto.salary;
    }
    if (updateTeacherDto.notes !== undefined) {
      academyTeacher.notes = updateTeacherDto.notes;
    }
    if (updateTeacherDto.isActive !== undefined) {
      academyTeacher.status = updateTeacherDto.isActive ? TeacherStatus.ACTIVE : TeacherStatus.INACTIVE;
    }

    return await this.academyTeacherRepository.save(academyTeacher);
  }

  async removeTeacherFromAcademy(academyId: string, teacherId: string): Promise<void> {
    const academyTeacher = await this.academyTeacherRepository.findOne({
      where: { academyId, teacherId },
    });

    if (!academyTeacher) {
      throw new NotFoundException('Teacher not found in this academy');
    }

    academyTeacher.isDeleted = true;
    await this.academyTeacherRepository.save(academyTeacher);
  }

  async getAcademyTeachers(academyId: string): Promise<AcademyTeacher[]> {
    return await this.academyTeacherRepository.find({
      where: { academyId, isDeleted: false },
      relations: ['teacher', 'academy'],
    });
  }

  async getTeacherByAcademy(academyId: string, teacherId: string): Promise<AcademyTeacher> {
    const academyTeacher = await this.academyTeacherRepository.findOne({
      where: { academyId, teacherId, isDeleted: false },
      relations: ['teacher', 'academy'],
    });

    if (!academyTeacher) {
      throw new NotFoundException('Teacher not found in this academy');
    }

    return academyTeacher;
  }

  /**
   * 
   * @param page - The page number
   * @param limit - The number of teachers per page
   * @param search - The search query
   * @returns The paginated list of teachers with their academy and teacher details
   */

  async getTeachers(user:User,page: number = 1, limit: number = 10, search?: string): Promise<{data:AcademyTeacher[],total: number}> {
    const query = this.academyTeacherRepository.createQueryBuilder('academyTeacher')
    if(user.role !== UserRole.ACADEMY_OWNER) {
      const academy = await this.academyRepository.find({
        where: { ownerId: user.id, isDeleted: false },
        select: ['id'],
      });
      query.leftJoinAndSelect('academyTeacher.teacher', 'teacher')
      .leftJoinAndSelect('academyTeacher.academy', 'academy')
      .where('academyTeacher.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('academyTeacher.academyId in (:...academyIds)', { academyIds: academy.map(a => a.id) });
    }

    if (search) {
      query.andWhere('teacher.name LIKE :search', { search: `%${search}%` });
    }

    const skip = (page - 1) * limit;

    const [teachers, total] = await query.skip(skip).take(limit).getManyAndCount();
    return {
      data: teachers,
      total
      
    };
  }
}
