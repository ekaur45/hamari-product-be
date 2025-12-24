import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException
} from '@nestjs/common';
import { StudentScheduleDto } from './dto/student-schedule.dto';
import User from 'src/database/entities/user.entity';
import { Student } from 'src/database/entities/student.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';
import ClassEntity from 'src/database/entities/classes.entity';
import ClassBooking from 'src/database/entities/class-booking.entity';
import Assignment, { AssignmentStatus } from 'src/database/entities/assignment.entity';
import AssignmentSubmission, { SubmissionStatus } from 'src/database/entities/assignment-submission.entity';
import Review from 'src/database/entities/review.entity';
import { UserRole } from '../shared/enums';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import StudentAssignmentListDto from './dto/student-assignment-list.dto';
import StudentBookingListDto from './dto/student-booking-list.dto';
import StudentPerformanceDto from '../teacher/dto/student-performance.dto';
import { BookingStatus } from '../shared/enums';
import { Teacher } from 'src/database/entities/teacher.entity';


@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(TeacherBooking)
    private readonly teacherBookingRepository: Repository<TeacherBooking>,

    @InjectRepository(ClassBooking)
    private readonly classBookingRepository: Repository<ClassBooking>,

    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,

    @InjectRepository(AssignmentSubmission)
    private readonly submissionRepository: Repository<AssignmentSubmission>,

    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) { }

  async getSchedule(user: User): Promise<StudentScheduleDto> {
    const student = await this.studentRepository.findOne({
      where: {
        userId: user.id,
      },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const teacherBookings = await this.teacherBookingRepository.find({
      where: {
        studentId: student.id,
      },
      relations: ['teacher', 'teacherSubject', 'availability', 'teacherSubject.subject', 'teacher.user'],
    });
    const classBookings = await this.classBookingRepository.find({
      where: {
        studentId: student.id,
      },
      relations: ['class', 'class.teacher', 'class.teacher.user', 'class.subject', 'student', 'student.user', 'class.classBookings'],
    });

    return {
      courseBooking: teacherBookings,
      classBooking: classBookings
    };
  }
  async getClasses(user: User): Promise<ClassBooking[]> {
    const student = await this.studentRepository.findOne({
      where: {
        userId: user.id,
      },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const classBookings = await this.classBookingRepository.find({
      where: {
        studentId: student.id,
      },
      relations: ['class', 'class.teacher', 'class.teacher.user', 'class.subject', 'student', 'student.user', 'class.classBookings'],
    });
    return classBookings;
  }

  async getStudentAssignments(
    user: User,
    filters: { page: number; limit: number; status?: string; classId?: string }
  ): Promise<StudentAssignmentListDto> {
    const student = await this.studentRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get assignments from classes student is enrolled in
    const classBookings = await this.classBookingRepository.find({
      where: { studentId: student.id, isDeleted: false },
      relations: ['class'],
    });
    const classIds = classBookings.map(cb => cb.classId);

    // Get assignments from teacher bookings
    const teacherBookings = await this.teacherBookingRepository.find({
      where: { studentId: student.id, isDeleted: false },
    });
    const teacherBookingIds = teacherBookings.map(tb => tb.id);

    const query = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.class', 'class')
      .leftJoinAndSelect('assignment.teacherBooking', 'teacherBooking')
      .leftJoinAndSelect('assignment.teacher', 'teacher')
      .leftJoinAndSelect('teacher.user', 'teacherUser')
      .leftJoinAndSelect('assignment.submissions', 'submissions', 'submissions.studentId = :studentId AND submissions.isDeleted = false', { studentId: student.id })
      .where('assignment.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('assignment.status = :status', { status: AssignmentStatus.PUBLISHED });

    if (classIds.length > 0 || teacherBookingIds.length > 0) {
      const conditions: string[] = [];
      const params: any = {};
      
      if (classIds.length > 0) {
        conditions.push('assignment.classId IN (:...classIds)');
        params.classIds = classIds;
      }
      
      if (teacherBookingIds.length > 0) {
        conditions.push('assignment.teacherBookingId IN (:...teacherBookingIds)');
        params.teacherBookingIds = teacherBookingIds;
      }
      
      if (conditions.length > 0) {
        query.andWhere(`(${conditions.join(' OR ')})`, params);
      } else {
        // No access - return empty result
        query.andWhere('1 = 0');
      }
    } else {
      // No bookings - return empty result
      query.andWhere('1 = 0');
    }

    if (filters.classId) {
      query.andWhere('assignment.classId = :classId', { classId: filters.classId });
    }

    query.orderBy('assignment.dueDate', 'ASC');

    const [assignments, total] = await query
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();

    const result = new StudentAssignmentListDto();
    result.assignments = assignments;
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
    const student = await this.studentRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, isDeleted: false },
      relations: ['teacher', 'teacher.user', 'class', 'teacherBooking', 'submissions', 'submissions.student'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if student has access to this assignment
    let hasAccess = false;

    if (assignment.classId) {
      const classBooking = await this.classBookingRepository.findOne({
        where: { studentId: student.id, classId: assignment.classId, isDeleted: false },
      });
      hasAccess = !!classBooking;
    }

    if (assignment.teacherBookingId) {
      const teacherBooking = await this.teacherBookingRepository.findOne({
        where: { id: assignment.teacherBookingId, studentId: student.id, isDeleted: false },
      });
      hasAccess = hasAccess || !!teacherBooking;
    }

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this assignment');
    }

    return assignment;
  }

  async submitAssignment(
    assignmentId: string,
    submitDto: SubmitAssignmentDto,
    user: User
  ): Promise<AssignmentSubmission> {
    const student = await this.studentRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, isDeleted: false },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if student has access
    let hasAccess = false;
    if (assignment.classId) {
      const classBooking = await this.classBookingRepository.findOne({
        where: { studentId: student.id, classId: assignment.classId, isDeleted: false },
      });
      hasAccess = !!classBooking;
    }
    if (assignment.teacherBookingId) {
      const teacherBooking = await this.teacherBookingRepository.findOne({
        where: { id: assignment.teacherBookingId, studentId: student.id, isDeleted: false },
      });
      hasAccess = hasAccess || !!teacherBooking;
    }

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this assignment');
    }

    // Check if assignment is still open for submission
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      if (!assignment.allowLateSubmission) {
        throw new BadRequestException('Assignment deadline has passed and late submissions are not allowed');
      }
    }

    // Check for existing submission
    let submission = await this.submissionRepository.findOne({
      where: { assignmentId, studentId: student.id, isDeleted: false },
    });

    const isLate = assignment.dueDate ? new Date() > new Date(assignment.dueDate) : false;

    if (submission) {
      // Update existing submission
      submission.submissionText = submitDto.submissionText || submission.submissionText;
      submission.files = submitDto.files || submission.files;
      submission.submittedAt = new Date();
      submission.isLate = isLate;
      submission.status = SubmissionStatus.SUBMITTED;
    } else {
      // Create new submission
      submission = this.submissionRepository.create({
        assignmentId,
        studentId: student.id,
        submissionText: submitDto.submissionText || null,
        files: submitDto.files || null,
        submittedAt: new Date(),
        isLate,
        status: SubmissionStatus.SUBMITTED,
      });
    }

    return await this.submissionRepository.save(submission);
  }

  async getMySubmissions(
    user: User,
    filters: { page: number; limit: number; assignmentId?: string; status?: SubmissionStatus }
  ): Promise<{ submissions: AssignmentSubmission[]; total: number; pagination: any }> {
    const student = await this.studentRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const query = this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.assignment', 'assignment')
      .leftJoinAndSelect('assignment.teacher', 'teacher')
      .leftJoinAndSelect('teacher.user', 'teacherUser')
      .leftJoinAndSelect('assignment.class', 'class')
      .where('submission.studentId = :studentId', { studentId: student.id })
      .andWhere('submission.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.assignmentId) {
      query.andWhere('submission.assignmentId = :assignmentId', { assignmentId: filters.assignmentId });
    }

    if (filters.status) {
      query.andWhere('submission.status = :status', { status: filters.status });
    }

    query.orderBy('submission.submittedAt', 'DESC');

    const [submissions, total] = await query
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();

    return {
      submissions,
      total,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
        hasNext: filters.page < Math.ceil(total / filters.limit),
        hasPrev: filters.page > 1,
      },
    };
  }

  async getMyBookings(
    user: User,
    filters: { page: number; limit: number; status?: BookingStatus }
  ): Promise<StudentBookingListDto> {
    const student = await this.studentRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const query = this.teacherBookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.teacher', 'teacher')
      .leftJoinAndSelect('teacher.user', 'teacherUser')
      .leftJoinAndSelect('booking.teacherSubject', 'teacherSubject')
      .leftJoinAndSelect('teacherSubject.subject', 'subject')
      .leftJoinAndSelect('booking.availability', 'availability')
      .where('booking.studentId = :studentId', { studentId: student.id })
      .andWhere('booking.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.status) {
      query.andWhere('booking.status = :status', { status: filters.status });
    }

    query.orderBy('booking.bookingDate', 'DESC');

    const [bookings, total] = await query
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();

    const result = new StudentBookingListDto();
    result.bookings = bookings;
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

  async cancelBooking(bookingId: string, user: User): Promise<void> {
    const student = await this.studentRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const booking = await this.teacherBookingRepository.findOne({
      where: { id: bookingId, studentId: student.id, isDeleted: false },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    booking.status = BookingStatus.CANCELLED;
    await this.teacherBookingRepository.save(booking);
  }

  async getClassDetails(classId: string, user: User): Promise<ClassEntity> {
    const student = await this.studentRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const classEntity = await this.classRepository.findOne({
      where: { id: classId, isDeleted: false },
      relations: ['teacher', 'teacher.user', 'subject', 'classBookings', 'classBookings.student'],
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    // Check if student is enrolled
    const classBooking = await this.classBookingRepository.findOne({
      where: { studentId: student.id, classId, isDeleted: false },
    });

    if (!classBooking) {
      throw new ForbiddenException('You are not enrolled in this class');
    }

    return classEntity;
  }

  async createReview(teacherId: string, createDto: CreateReviewDto, user: User): Promise<Review> {
    const student = await this.studentRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get teacher entity
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId, isDeleted: false },
      relations: ['user'],
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Check if student has completed bookings with this teacher
    const completedBooking = await this.teacherBookingRepository.findOne({
      where: {
        teacherId: teacher.id,
        studentId: student.id,
        status: BookingStatus.COMPLETED,
        isDeleted: false,
      },
    });

    if (!completedBooking) {
      throw new ForbiddenException('You can only review teachers you have completed sessions with');
    }

    // Check if review already exists
    const existingReview = await this.reviewRepository.findOne({
      where: {
        reviewerId: user.id,
        revieweeId: teacher.userId,
        reviewerRole: UserRole.STUDENT,
        revieweeRole: UserRole.TEACHER,
        isDeleted: false,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this teacher');
    }

    const review = this.reviewRepository.create({
      reviewerId: user.id,
      revieweeId: teacher.userId,
      reviewerRole: UserRole.STUDENT,
      revieweeRole: UserRole.TEACHER,
      rating: createDto.rating,
      comment: createDto.comment || null,
      isVisible: true,
    });

    return await this.reviewRepository.save(review);
  }

  async getTeacherReviews(teacherId: string, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; pagination: any }> {
    // Get teacher entity
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId, isDeleted: false },
      relations: ['user'],
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .where('review.revieweeId = :revieweeId', { revieweeId: teacher.userId })
      .andWhere('review.revieweeRole = :revieweeRole', { revieweeRole: UserRole.TEACHER })
      .andWhere('review.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('review.isVisible = :isVisible', { isVisible: true });

    query.orderBy('review.createdAt', 'DESC');

    const [reviews, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getMyPerformance(user: User): Promise<StudentPerformanceDto> {
    const student = await this.studentRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get all assignments student has access to
    const classBookings = await this.classBookingRepository.find({
      where: { studentId: student.id, isDeleted: false },
    });
    const classIds = classBookings.map(cb => cb.classId);

    const teacherBookings = await this.teacherBookingRepository.find({
      where: { studentId: student.id, isDeleted: false },
    });
    const teacherBookingIds = teacherBookings.map(tb => tb.id);

    // Get assignments from classes
    const classAssignments = classIds.length > 0
      ? await this.assignmentRepository.find({
          where: classIds.map(id => ({ classId: id, isDeleted: false })),
          relations: ['submissions', 'submissions.student'],
        })
      : [];

    // Get assignments from teacher bookings
    const bookingAssignments = teacherBookingIds.length > 0
      ? await this.assignmentRepository.find({
          where: teacherBookingIds.map(id => ({ teacherBookingId: id, isDeleted: false })),
          relations: ['submissions', 'submissions.student'],
        })
      : [];

    const assignments = [...classAssignments, ...bookingAssignments];

    // Get all submissions
    const submissions = await this.submissionRepository.find({
      where: { studentId: student.id, isDeleted: false },
      relations: ['assignment'],
    });

    const assignmentData = assignments.map(assignment => {
      const submission = submissions.find(s => s.assignmentId === assignment.id);
      const score = submission?.score || null;
      const maxScore = submission?.maxScore || assignment.maxScore;
      const percentage = score !== null ? (score / maxScore) * 100 : null;

      return {
        assignment,
        submission: submission || null,
        score,
        maxScore,
        percentage,
      };
    });

    const totalAssignments = assignments.length;
    const completedAssignments = submissions.filter(s => s.status === SubmissionStatus.GRADED).length;
    const totalScore = submissions
      .filter(s => s.score !== null)
      .reduce((sum, s) => sum + (s.score || 0), 0);
    const maxPossibleScore = assignments.reduce((sum, a) => sum + a.maxScore, 0);
    const averageScore = completedAssignments > 0 ? totalScore / completedAssignments : 0;

    // Performance by type
    const performanceByType = new Map<string, { total: number; completed: number; totalScore: number }>();
    assignments.forEach(assignment => {
      const submission = submissions.find(s => s.assignmentId === assignment.id);
      const type = assignment.type;
      if (!performanceByType.has(type)) {
        performanceByType.set(type, { total: 0, completed: 0, totalScore: 0 });
      }
      const typeData = performanceByType.get(type)!;
      typeData.total++;
      if (submission && submission.score !== null) {
        typeData.completed++;
        typeData.totalScore += submission.score;
      }
    });

    const performanceByTypeArray = Array.from(performanceByType.entries()).map(([type, data]) => ({
      type,
      averageScore: data.completed > 0 ? data.totalScore / data.completed : 0,
      totalAssignments: data.total,
      completedAssignments: data.completed,
    }));

    const result = new StudentPerformanceDto();
    result.student = student;
    result.totalAssignments = totalAssignments;
    result.completedAssignments = completedAssignments;
    result.averageScore = averageScore;
    result.totalScore = totalScore;
    result.maxPossibleScore = maxPossibleScore;
    result.assignments = assignmentData;
    result.performanceByType = performanceByTypeArray;

    return result;
  }
}
