import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Teacher } from 'src/database/entities/teacher.entity';
import { Pagination } from '../shared/models/api-response.model';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import UpdateTeacherRatesDto from './dto/update-rates.dto';
import User from 'src/database/entities/user.entity';
import TeacherBooking from 'src/database/entities/teacher-booking.entity';
import ClassEntity from 'src/database/entities/classes.entity';
import Subject from 'src/database/entities/subject.entity';
import { CreateClassDto } from './dto/create-class.dto';
import ClassBooking from 'src/database/entities/class-booking.entity';
import { Student } from 'src/database/entities/student.entity';
import TeacherStudentsListDto from './dto/teacher-students-list.dto';
import StudentPerformanceDto from './dto/student-performance.dto';
import Assignment from 'src/database/entities/assignment.entity';
import AssignmentSubmission from 'src/database/entities/assignment-submission.entity';
import Review from 'src/database/entities/review.entity';
import { BookingStatus, UserRole } from 'src/modules/shared/enums';
import Currency from 'src/database/entities/currency.entity';
import { TeacherSessionsDto } from './dto/sessions.dto';
import { PaginationRequest } from 'src/models/common/pagination.model';
@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(TeacherBooking)
    private readonly teacherBookingRepository: Repository<TeacherBooking>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    @InjectRepository(ClassBooking)
    private readonly classBookingRepository: Repository<ClassBooking>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(AssignmentSubmission)
    private readonly submissionRepository: Repository<AssignmentSubmission>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) { }

  async getTeachersWithPagination(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ teachers: Teacher[], pagination: Pagination }> {
    const query = this.teacherRepository.createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .leftJoinAndSelect('user.details', 'details')
      .leftJoinAndSelect('teacher.availabilities', 'availabilities')
      .leftJoinAndSelect('teacher.teacherSubjects', 'teacherSubjects')
      .leftJoinAndSelect('teacherSubjects.subject', 'subject')
      .where('teacher.isDeleted = false');
    if (search) {
      query.andWhere('user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search', { search: `%${search}%` });
    }
    query.orderBy('teacher.createdAt', 'DESC');
    query.skip((page - 1) * limit);
    query.take(limit);
    const [teachers, total] = await query.getManyAndCount();
    return {
      teachers, pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    };
  }

  async getTeacherById(id: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['user', 'user.details', 'availabilities', 'teacherSubjects', 'teacherSubjects.subject'],
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher;
  }

  async updateTeacherRates(teacherId: string, updateTeacherRatesDto: UpdateTeacherRatesDto, user: User, currency: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId, isDeleted: false },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    if (teacher.userId !== user.id) {
      throw new ForbiddenException('You can only update your own rates');
    }
    teacher.hourlyRate = await this.convertToBaseCurrency(updateTeacherRatesDto.hourlyRate, currency);
    teacher.monthlyRate = await this.convertToBaseCurrency(updateTeacherRatesDto.monthlyRate, currency);
    await this.teacherRepository.save(teacher);
    return teacher;
  }
  async getTeacherBookings(user: User): Promise<TeacherBooking[]> {
    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, isDeleted: false,teacherBookings: { isDeleted: false,status: In([BookingStatus.CONFIRMED, BookingStatus.COMPLETED]) } },
      relations: ['teacherBookings', 'teacherBookings.teacher', 'teacherBookings.student', 'teacherBookings.student.user','teacherBookings.student.user.details', 'teacherBookings.teacherSubject', 'teacherBookings.availability', 'teacherBookings.teacherSubject.subject'],
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher.teacherBookings;
  }

  async getTeacherBookingById(bookingId: string): Promise<TeacherBooking> {
    const booking = await this.teacherBookingRepository.findOne({ where: { id: bookingId, isDeleted: false }, relations: ['teacher','teacher.user','teacher.user.details', 'student', 'student.user','student.user.details', 'teacherSubject', 'availability', 'teacherSubject.subject'] });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }
  async getTeacherClasses(user: User): Promise<ClassEntity[]> {
    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, isDeleted: false, classes: { isDeleted: false } },
      relations: ['classes', 'classes.teacher', 'classes.teacher.user', 'classes.subject', 'classes.classBookings', 'classes.classBookings.student', 'classes.classBookings.student.user'],
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher.classes;
  }
  async getTeacherSubjects(teacherId: string, user: User): Promise<Subject[]> {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId, isDeleted: false },
      relations: ['teacherSubjects', 'teacherSubjects.subject'],
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher.teacherSubjects.map(subject => subject.subject);
  }
  async createClass(teacherId: string, createClassDto: CreateClassDto): Promise<ClassEntity> {
    const teacher = await this.teacherRepository.findOne({ where: { userId: teacherId, isDeleted: false }, relations: ['teacherSubjects', 'teacherSubjects.subject'] });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // check if subject exists and exists in the teacher's subjects
    const subject = await this.subjectRepository.findOne({ where: { id: createClassDto.subjectId, isDeleted: false } });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    if (!teacher.teacherSubjects.some(subject => subject.subjectId === createClassDto.subjectId)) {
      throw new ForbiddenException('You can only create classes for your own subjects');
    }
    createClassDto.teacherId = teacher.id;
    const classEntity = this.classRepository.create({
      ...createClassDto,
      scheduleDays: createClassDto.schedule ?? [],
    });
    await this.classRepository.save(classEntity);
    return classEntity;
  }
  async deleteClass(teacherId: string, classId: string): Promise<ClassEntity> {
    const classEntity = await this.classRepository.findOne({ where: { id: classId, teacherId, isDeleted: false } });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }
    await this.classRepository.update(classId, { isDeleted: true });
    return classEntity;
  }

  async getStudentsInClass(teacherId: string, classId: string, user: User): Promise<Student[]> {
    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, id: teacherId, isDeleted: false },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const classEntity = await this.classRepository.findOne({
      where: { id: classId, teacherId: teacher.id, isDeleted: false },
    });
    if (!classEntity) {
      throw new NotFoundException('Class not found or you do not have access to it');
    }

    const classBookings = await this.classBookingRepository.find({
      where: { classId, isDeleted: false },
      relations: ['student', 'student.user', 'student.user.details'],
    });

    const students = classBookings.map(booking => booking.student);
    // Remove duplicates based on student ID
    const uniqueStudents = students.filter((student, index, self) =>
      index === self.findIndex(s => s.id === student.id)
    );

    return uniqueStudents;
  }

  async getAllStudents(user: User): Promise<TeacherStudentsListDto> {
    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, isDeleted: false },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Get all classes with their bookings
    const classes = await this.classRepository.find({
      where: { teacherId: teacher.id, isDeleted: false },
      relations: ['subject', 'classBookings', 'classBookings.student', 'classBookings.student.user', 'classBookings.student.user.details'],
    });

    // Get all one-on-one bookings
    const bookings = await this.teacherBookingRepository.find({
      where: { teacherId: teacher.id, isDeleted: false },
      relations: ['student', 'student.user', 'student.user.details', 'teacherSubject', 'teacherSubject.subject'],
    });

    // Organize class students
    const classStudentsMap = new Map<string, { classId: string; className: string; students: Set<string> }>();
    
    classes.forEach(classEntity => {
      const key = classEntity.id;
      if (!classStudentsMap.has(key)) {
        classStudentsMap.set(key, {
          classId: classEntity.id,
          className: classEntity.subject?.name || 'Unknown',
          students: new Set(),
        });
      }
      classEntity.classBookings?.forEach(booking => {
        if (booking.student) {
          classStudentsMap.get(key)!.students.add(booking.student.id);
        }
      });
    });

    // Convert to array with actual student objects
    const classStudents = Array.from(classStudentsMap.entries()).map(([classId, data]) => {
      const studentIds = Array.from(data.students);
      const students = studentIds.map(id => {
        const classEntity = classes.find(c => c.id === classId);
        const booking = classEntity?.classBookings?.find(b => b.student?.id === id);
        return booking?.student;
      }).filter(Boolean) as Student[];

      return {
        classId: data.classId,
        className: data.className,
        students,
      };
    });

    // Organize one-on-one students
    const oneOnOneStudents = bookings.map(booking => ({
      booking,
      student: booking.student,
    }));

    // Calculate total unique students
    const allStudentIds = new Set<string>();
    classStudents.forEach(cs => {
      cs.students.forEach(s => allStudentIds.add(s.id));
    });
    oneOnOneStudents.forEach(oos => {
      allStudentIds.add(oos.student.id);
    });

    const result = new TeacherStudentsListDto();
    result.classStudents = classStudents;
    result.oneOnOneStudents = oneOnOneStudents;
    result.totalStudents = allStudentIds.size;

    return result;
  }

  async getStudentPerformance(teacherId: string, studentId: string, user: User): Promise<StudentPerformanceDto> {
    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, id: teacherId, isDeleted: false },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const student = await this.studentRepository.findOne({
      where: { id: studentId, isDeleted: false },
      relations: ['user', 'user.details'],
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get all assignments for this teacher that could be assigned to this student
    // (either through classes or one-on-one bookings)
    const assignments = await this.assignmentRepository.find({
      where: { teacherId: teacher.id, isDeleted: false },
      relations: ['class', 'teacherBooking', 'submissions'],
    });

    // Filter assignments relevant to this student
    const relevantAssignments = assignments.filter(assignment => {
      if (assignment.classId) {
        // Check if student is enrolled in this class
        return true; // We'll filter by submissions later
      } else if (assignment.teacherBookingId) {
        // Check if this booking is for this student
        return assignment.teacherBooking?.studentId === studentId;
      }
      return false;
    });

    // Get all submissions for this student
    const submissions = await this.submissionRepository.find({
      where: { studentId, isDeleted: false },
      relations: ['assignment'],
    });

    // Match assignments with submissions
    const assignmentData = relevantAssignments.map(assignment => {
      const submission = submissions.find(s => s.assignmentId === assignment.id);
      const score = submission?.score ?? null;
      const maxScore = submission?.maxScore ?? assignment.maxScore;
      const percentage = score !== null && maxScore > 0 ? (score / maxScore) * 100 : null;

      return {
        assignment,
        submission: submission || null,
        score,
        maxScore,
        percentage,
      };
    });

    // Calculate statistics
    const completedAssignments = assignmentData.filter(ad => ad.submission !== null).length;
    const totalAssignments = assignmentData.length;
    const scoredAssignments = assignmentData.filter(ad => ad.score !== null);
    const totalScore = scoredAssignments.reduce((sum, ad) => sum + (ad.score || 0), 0);
    const maxPossibleScore = assignmentData.reduce((sum, ad) => sum + ad.maxScore, 0);
    const averageScore = scoredAssignments.length > 0 ? totalScore / scoredAssignments.length : 0;

    // Performance by type
    const performanceByType = new Map<string, { totalScore: number; maxScore: number; count: number; completed: number }>();
    
    assignmentData.forEach(ad => {
      const type = ad.assignment.type;
      if (!performanceByType.has(type)) {
        performanceByType.set(type, { totalScore: 0, maxScore: 0, count: 0, completed: 0 });
      }
      const typeData = performanceByType.get(type)!;
      typeData.count++;
      typeData.maxScore += ad.maxScore;
      if (ad.submission) {
        typeData.completed++;
      }
      if (ad.score !== null) {
        typeData.totalScore += ad.score;
      }
    });

    const performanceByTypeArray = Array.from(performanceByType.entries()).map(([type, data]) => ({
      type,
      averageScore: data.completed > 0 ? data.totalScore / data.completed : 0,
      totalAssignments: data.count,
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

  async getAllStudentsPerformance(teacherId: string, user: User): Promise<StudentPerformanceDto[]> {
    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, id: teacherId, isDeleted: false },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Get all students
    const studentsData = await this.getAllStudents(user);
    const allStudentIds = new Set<string>();
    
    studentsData.classStudents.forEach(cs => {
      cs.students.forEach(s => allStudentIds.add(s.id));
    });
    studentsData.oneOnOneStudents.forEach(oos => {
      allStudentIds.add(oos.student.id);
    });

    // Get performance for each student
    const performances = await Promise.all(
      Array.from(allStudentIds).map(studentId =>
        this.getStudentPerformance(teacherId, studentId, user).catch(() => null)
      )
    );

    return performances.filter(p => p !== null) as StudentPerformanceDto[];
  }

  async getTeacherReviews(teacherId: string, user: User, page: number = 1, limit: number = 10): Promise<{ reviews: Review[], pagination: Pagination }> {
    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, id: teacherId, isDeleted: false },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const query = this.reviewRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .leftJoinAndSelect('reviewer.details', 'reviewerDetails')
      .where('review.revieweeId = :teacherUserId', { teacherUserId: teacher.userId })
      .andWhere('review.revieweeRole = :role', { role: UserRole.TEACHER })
      .andWhere('review.isDeleted = false')
      .andWhere('review.isVisible = true')
      .orderBy('review.createdAt', 'DESC');

    query.skip((page - 1) * limit);
    query.take(limit);

    const [reviews, total] = await query.getManyAndCount();

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

  async getTeacherReviewStats(teacherId: string, user: User): Promise<{ averageRating: number; totalReviews: number; ratingDistribution: { rating: number; count: number }[] }> {
    const teacher = await this.teacherRepository.findOne({
      where: { userId: user.id, id: teacherId, isDeleted: false },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const reviews = await this.reviewRepository.find({
      where: {
        revieweeId: teacher.userId,
        revieweeRole: UserRole.TEACHER,
        isDeleted: false,
        isVisible: true,
      },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + (review.rating??0), 0) / totalReviews
      : 0;

    // Rating distribution
    const distribution = new Map<number, number>();
    for (let i = 1; i <= 5; i++) {
      distribution.set(i, 0);
    }
    reviews.forEach(review => {
      distribution.set((review.rating??0), (distribution.get((review.rating??0)) || 0) + 1);
    });

    const ratingDistribution = Array.from(distribution.entries()).map(([rating, count]) => ({
      rating,
      count,
    }));

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
    };
  }
  private async convertToBaseCurrency(amount: number, currency: string): Promise<number> {
    const baseCurrency = await this.currencyRepository.findOne({
      where: {
        isBase: true,
      },
    });
    if (!baseCurrency) {
      return amount;
    }
    if(currency == baseCurrency.code) {
      return amount;
    }
    const selectedCurrency = await this.currencyRepository.findOne({
      where: {
        code: currency,
      },
    });
    if (!selectedCurrency) {
      return amount;
    }
    return (Number(amount) * baseCurrency.exchangeRate) / selectedCurrency.exchangeRate;
  }
  async getTeacherSessions(teacherId: string, user: User, paginationRequest: PaginationRequest): Promise<TeacherSessionsDto> {
    
    const query = this.teacherBookingRepository.createQueryBuilder('teacherBooking')
      .leftJoinAndSelect('teacherBooking.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('user.details', 'details')
      .leftJoinAndSelect('teacherBooking.teacherSubject', 'teacherSubject')
      .leftJoinAndSelect('teacherSubject.subject', 'subject')
      .leftJoinAndSelect('teacherBooking.availability', 'availability')
      .leftJoinAndSelect('teacherBooking.teacher', 'teacher')
      .leftJoinAndSelect('teacherBooking.reviews',   'reviews',
        `
          EXISTS (
            SELECT 1 
            FROM reviews r
            WHERE r.teacherBookingId = teacherBooking.id
            AND r.reviewerId = :userId
          )
          OR reviews.reviewerId = :userId
        `,
        { userId: user.id })
      .leftJoinAndSelect('teacher.user', 'teacherUser')
      .leftJoinAndSelect('teacherUser.details', 'teacherDetails')      
      .where('teacher.userId = :userId', { userId: user.id })
      .andWhere('teacherBooking.isDeleted = false')
      .andWhere('teacherBooking.status not in (:...statuses)', { statuses: [BookingStatus.CANCELLED, BookingStatus.PENDING] });
query.orderBy('teacherBooking.createdAt', 'DESC');
    query.skip((paginationRequest.page - 1) * paginationRequest.limit);
    query.take(paginationRequest.limit);

    const [sessions, total] = await query.getManyAndCount();

    return {
      sessions: sessions,
      pagination: {
        page: paginationRequest.page,
        limit: paginationRequest.limit,
        total: total,
        totalPages: Math.ceil(total / paginationRequest.limit),
        hasNext: paginationRequest.page < Math.ceil(total / paginationRequest.limit),
        hasPrev: paginationRequest.page > 1,
      },
    };
  }
}
