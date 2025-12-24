import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from 'src/database/entities/user.entity';
import { Parent } from 'src/database/entities/parent.entity';
import { Student } from 'src/database/entities/student.entity';
import ParentChild from 'src/database/entities/parent-child.entity';
import ClassBooking from 'src/database/entities/class-booking.entity';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';
import Assignment, { AssignmentStatus } from 'src/database/entities/assignment.entity';
import AssignmentSubmission from 'src/database/entities/assignment-submission.entity';
import { UserRole } from '../shared/enums';
import { ChildClassesDto, ChildAssignmentsDto, ChildScheduleDto, ChildBookingsDto, ChildPerformanceDto } from './dto/child-data.dto';
import StudentPerformanceDto from '../teacher/dto/student-performance.dto';
import { SubmissionStatus } from 'src/database/entities/assignment-submission.entity';

@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(ParentChild)
    private readonly parentChildRepository: Repository<ParentChild>,
    @InjectRepository(ClassBooking)
    private readonly classBookingRepository: Repository<ClassBooking>,
    @InjectRepository(TeacherBooking)
    private readonly teacherBookingRepository: Repository<TeacherBooking>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(AssignmentSubmission)
    private readonly submissionRepository: Repository<AssignmentSubmission>,
  ) {}

  async verifyParentChildRelationship(parentUser: User, childId: string): Promise<Student> {
    if (parentUser.role !== UserRole.PARENT) {
      throw new ForbiddenException('Only parents can access this resource');
    }

    const parent = await this.parentRepository.findOne({
      where: { userId: parentUser.id },
    });

    if (!parent) {
      throw new NotFoundException('Parent profile not found');
    }

    const link = await this.parentChildRepository.findOne({
      where: { parentId: parent.id, childId, isDeleted: false },
      relations: ['child', 'child.user'],
    });

    if (!link) {
      throw new ForbiddenException('You do not have access to this child');
    }

    return link.child;
  }

  async getChildClasses(parentUser: User, childId: string): Promise<ChildClassesDto> {
    const child = await this.verifyParentChildRelationship(parentUser, childId);

    const classBookings = await this.classBookingRepository.find({
      where: { studentId: child.id, isDeleted: false },
      relations: ['class', 'class.teacher', 'class.teacher.user', 'class.subject', 'student', 'student.user'],
    });

    return {
      classes: classBookings,
      total: classBookings.length,
    };
  }

  async getChildAssignments(parentUser: User, childId: string, page: number = 1, limit: number = 10): Promise<ChildAssignmentsDto> {
    const child = await this.verifyParentChildRelationship(parentUser, childId);

    // Get assignments from classes child is enrolled in
    const classBookings = await this.classBookingRepository.find({
      where: { studentId: child.id, isDeleted: false },
      relations: ['class'],
    });
    const classIds = classBookings.map(cb => cb.classId);

    // Get assignments from teacher bookings
    const teacherBookings = await this.teacherBookingRepository.find({
      where: { studentId: child.id, isDeleted: false },
    });
    const teacherBookingIds = teacherBookings.map(tb => tb.id);

    const query = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.class', 'class')
      .leftJoinAndSelect('assignment.teacherBooking', 'teacherBooking')
      .leftJoinAndSelect('assignment.teacher', 'teacher')
      .leftJoinAndSelect('teacher.user', 'teacherUser')
      .leftJoinAndSelect('assignment.submissions', 'submissions', 'submissions.studentId = :studentId AND submissions.isDeleted = false', { studentId: child.id })
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
        query.andWhere('1 = 0');
      }
    } else {
      query.andWhere('1 = 0');
    }

    query.orderBy('assignment.dueDate', 'ASC');

    const [assignments, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      assignments,
      total,
    };
  }

  async getChildSchedule(parentUser: User, childId: string): Promise<ChildScheduleDto> {
    const child = await this.verifyParentChildRelationship(parentUser, childId);

    const teacherBookings = await this.teacherBookingRepository.find({
      where: { studentId: child.id, isDeleted: false },
      relations: ['teacher', 'teacherSubject', 'availability', 'teacherSubject.subject', 'teacher.user'],
    });

    const classBookings = await this.classBookingRepository.find({
      where: { studentId: child.id, isDeleted: false },
      relations: ['class', 'class.teacher', 'class.teacher.user', 'class.subject', 'student', 'student.user', 'class.classBookings'],
    });

    return {
      courseBooking: teacherBookings,
      classBooking: classBookings,
    };
  }

  async getChildBookings(parentUser: User, childId: string, page: number = 1, limit: number = 10): Promise<ChildBookingsDto> {
    const child = await this.verifyParentChildRelationship(parentUser, childId);

    const query = this.teacherBookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.teacher', 'teacher')
      .leftJoinAndSelect('teacher.user', 'teacherUser')
      .leftJoinAndSelect('booking.teacherSubject', 'teacherSubject')
      .leftJoinAndSelect('teacherSubject.subject', 'subject')
      .leftJoinAndSelect('booking.availability', 'availability')
      .where('booking.studentId = :studentId', { studentId: child.id })
      .andWhere('booking.isDeleted = :isDeleted', { isDeleted: false });

    query.orderBy('booking.bookingDate', 'DESC');

    const [bookings, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      bookings,
      total,
    };
  }

  async getChildPerformance(parentUser: User, childId: string): Promise<ChildPerformanceDto> {
    const child = await this.verifyParentChildRelationship(parentUser, childId);

    // Get all assignments child has access to
    const classBookings = await this.classBookingRepository.find({
      where: { studentId: child.id, isDeleted: false },
    });
    const classIds = classBookings.map(cb => cb.classId);

    const teacherBookings = await this.teacherBookingRepository.find({
      where: { studentId: child.id, isDeleted: false },
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
      where: { studentId: child.id, isDeleted: false },
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

    const result = new ChildPerformanceDto();
    result.student = child;
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

