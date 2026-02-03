import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Assignment, { AssignmentStatus } from 'src/database/entities/assignment.entity';
import AssignmentSubmission, { SubmissionStatus } from 'src/database/entities/assignment-submission.entity';
import { Teacher } from 'src/database/entities/teacher.entity';
import ClassEntity from 'src/database/entities/classes.entity';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';
import { Student } from 'src/database/entities/student.entity';
import User from 'src/database/entities/user.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import AssignmentListDto from './dto/assignment-list.dto';
import SubmissionListDto from './dto/submission-list.dto';
import { Pagination } from '../shared/models/api-response.model';
import { NotificationService } from '../shared/notification/notification.service';
import { NotificationType } from '../shared/enums';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(AssignmentSubmission)
    private readonly submissionRepository: Repository<AssignmentSubmission>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    @InjectRepository(TeacherBooking)
    private readonly teacherBookingRepository: Repository<TeacherBooking>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly notificationService: NotificationService,
  ) {}

  async createAssignment(teacherId: string, createDto: CreateAssignmentDto, user: User): Promise<Assignment> {
    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!teacher) {
      throw new ForbiddenException('You can only create assignments for your own teacher account');
    }

    // Validate class or booking ownership
    // if (createDto.classId) {
    //   const classEntity = await this.classRepository.findOne({
    //     where: { id: createDto.classId, teacherId: teacher.id, isDeleted: false },
    //   });
    //   if (!classEntity) {
    //     throw new NotFoundException('Class not found or you do not have access to it');
    //   }
    // }

    if (createDto.teacherBookingId) {
      const booking = await this.teacherBookingRepository.findOne({
        where: { id: createDto.teacherBookingId, teacherId: teacher.id, isDeleted: false },
      });
      if (!booking) {
        throw new NotFoundException('Teacher booking not found or you do not have access to it');
      }
    }

    // if (!createDto.classId && !createDto.teacherBookingId) {
    //   throw new BadRequestException('Either classId or teacherBookingId must be provided');
    // }

    const assignment = this.assignmentRepository.create({
      ...createDto,
      teacherId: teacher.id,
      dueDate: createDto.dueDate ? new Date(createDto.dueDate) : null,
      submissionDate: createDto.submissionDate ? new Date(createDto.submissionDate) : null,
      attachments: createDto.attachments ? createDto.attachments.map(attachment => attachment.url) : null,
      status: AssignmentStatus.PUBLISHED,
      studentUserId: createDto.studentUserId,
    });
    const savedAssignment = await this.assignmentRepository.save(assignment);
    // teacher details
    const bookinging = await this.teacherBookingRepository.findOne({
      where: { id: createDto.teacherBookingId, isDeleted: false },
      relations: ['teacher', 'teacher.user', 'teacher.user.details', 'student', 'student.user','student.user.details'],
    });
    // student details
    this.notificationService.createNotification(bookinging!.student.user, {
      type: NotificationType.NEW_ASSIGNMENT,
      title: 'New assignment created',
      message: `<span class="font-bold text-primary">${bookinging!.teacher.user.firstName} ${bookinging!.teacher.user.lastName}</span> has created a new assignment <span class="font-bold text-gray-500">${assignment.title}</span> for you. Due date: <span class="font-bold text-gray-500">${assignment.dueDate?.toLocaleDateString()}</span>`,
      redirectPath: '/student/assignments',
      redirectParams: { assignmentId: assignment.id },
      user: bookinging!.student.user,
    });
    return savedAssignment;
  }

  async getTeacherAssignments(
    teacherId: string,
    user: User,
    filters: { page: number; limit: number; classId?: string; status?: AssignmentStatus },
  ): Promise<AssignmentListDto> {
    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!teacher) {
      throw new ForbiddenException('You can only view your own assignments');
    }

    const query = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.class', 'class')
      .leftJoinAndSelect('assignment.teacherBooking', 'teacherBooking')
      .leftJoinAndSelect('assignment.submissions', 'submissions')
      .leftJoinAndSelect('assignment.studentUser', 'studentUser')
      .leftJoinAndSelect('studentUser.details', 'studentUserDetails')
      .where('assignment.teacherId = :teacherId', { teacherId: teacher.id })
      .andWhere('assignment.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.classId) {
      query.andWhere('assignment.classId = :classId', { classId: filters.classId });
    }

    if (filters.status) {
      query.andWhere('assignment.status = :status', { status: filters.status });
    }

    query.orderBy('assignment.createdAt', 'DESC');

    const [assignments, total] = await query
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();

    const result = new AssignmentListDto();
    result.data = assignments;
    result.total = total;
    result.pagination = {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
      hasNext: filters.page < Math.ceil(total / filters.limit),
      hasPrev: filters.page > 1,
    };

    return result;
  }

  async getAssignmentById(assignmentId: string, user: User): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, isDeleted: false },
      relations: ['teacher', 'teacher.user', 'class', 'teacherBooking', 'submissions', 'submissions.student', 'submissions.student.user'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!teacher || assignment.teacherId !== teacher.id) {
      throw new ForbiddenException('You do not have access to this assignment');
    }

    return assignment;
  }

  async updateAssignment(assignmentId: string, updateDto: UpdateAssignmentDto, user: User): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, isDeleted: false },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!teacher || assignment.teacherId !== teacher.id) {
      throw new ForbiddenException('You can only update your own assignments');
    }

    if (updateDto.dueDate) {
      updateDto.dueDate = new Date(updateDto.dueDate) as any;
    }
    if (updateDto.submissionDate) {
      updateDto.submissionDate = new Date(updateDto.submissionDate) as any;
    }

    Object.assign(assignment, updateDto);
    return await this.assignmentRepository.save(assignment);
  }

  async deleteAssignment(assignmentId: string, user: User): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, isDeleted: false },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!teacher || assignment.teacherId !== teacher.id) {
      throw new ForbiddenException('You can only delete your own assignments');
    }

    await this.assignmentRepository.update(assignmentId, { isDeleted: true });
  }

  async getSubmissions(
    assignmentId: string,
    user: User,
    filters: { page: number; limit: number; status?: SubmissionStatus },
  ): Promise<SubmissionListDto> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, isDeleted: false },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!teacher || assignment.teacherId !== teacher.id) {
      throw new ForbiddenException('You do not have access to this assignment');
    }

    const query = this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .where('submission.assignmentId = :assignmentId', { assignmentId })
      .andWhere('submission.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.status) {
      query.andWhere('submission.status = :status', { status: filters.status });
    }

    query.orderBy('submission.submittedAt', 'DESC');

    const [submissions, total] = await query
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();

    const result = new SubmissionListDto();
    result.submissions = submissions;
    result.total = total;
    result.pagination = {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
      hasNext: filters.page < Math.ceil(total / filters.limit),
      hasPrev: filters.page > 1,
    };

    return result;
  }

  async gradeSubmission(
    assignmentId: string,
    submissionId: string,
    gradeDto: GradeSubmissionDto,
    user: User,
  ): Promise<AssignmentSubmission> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, isDeleted: false },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!teacher || assignment.teacherId !== teacher.id) {
      throw new ForbiddenException('You can only grade submissions for your own assignments');
    }

    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId, assignmentId, isDeleted: false },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    submission.score = gradeDto.score;
    submission.maxScore = gradeDto.maxScore || assignment.maxScore;
    submission.feedback = gradeDto.feedback || null;
    submission.status = SubmissionStatus.GRADED;
    submission.gradedAt = new Date();
    submission.gradedBy = teacher.id;

    const savedSubmission = await this.submissionRepository.save(submission);
    assignment.status = AssignmentStatus.GRADED;
    await this.assignmentRepository.save(assignment);
    const bookinging = await this.teacherBookingRepository.findOne({
      where: { id: assignment.teacherBookingId!, isDeleted: false },
      relations: ['teacher', 'teacher.user', 'teacher.user.details', 'student', 'student.user','student.user.details'],
    });
    this.notificationService.createNotification(bookinging!.student.user, {
      type: NotificationType.ASSIGNMENT_GRADED,
      title: 'Assignment graded',
      message: `<span class="font-bold text-primary">${bookinging!.teacher.user.firstName} ${bookinging!.teacher.user.lastName}</span> has graded your assignment <span class="font-bold text-gray-500">${assignment.title}</span>. Score: <span class="font-bold text-gray-500">${submission.score}</span>`,
      redirectPath: '/student/assignments',
      redirectParams: { assignmentId: assignment.id },
      user: bookinging!.student.user,
    });
    return savedSubmission;
  }
}

