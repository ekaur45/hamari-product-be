import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import TeacherBooking from "src/database/entities/teacher-booking.entity";
import { Teacher } from "src/database/entities/teacher.entity";
import { PaginationRequest } from "src/models/common/pagination.model";
import { BookingStatus } from "src/modules/shared/enums";
import { ILike, Repository } from "typeorm";
import { Like } from "typeorm";

@Injectable()
export class TeacherService {
    constructor(
        @InjectRepository(Teacher)
        private readonly teacherRepository: Repository<Teacher>,
    ) { }

    async getTeachersWithPagination(pagination: PaginationRequest) {

        const query = this.teacherRepository
        .createQueryBuilder('teacher')
        .distinct(true)
        .leftJoinAndSelect('teacher.user', 'user')
        .leftJoinAndSelect('user.details', 'details')
        .leftJoinAndSelect('teacher.teacherSubjects', 'teacherSubjects', 'teacherSubjects.isDeleted = false')
        .leftJoinAndSelect('teacherSubjects.subject', 'subject')
        .leftJoinAndSelect('teacher.teacherBookings', 'teacherBookings', 'teacherBookings.status = :status AND teacherBookings.isDeleted = false', { status: BookingStatus.CONFIRMED })
        .addSelect(subQuery => {
            return subQuery
              .select('COUNT(DISTINCT tb.studentId)', 'total')
              .from(TeacherBooking, 'tb')
              .where('tb.teacherId = teacher.id')
              .andWhere('tb.status = :status', { status: BookingStatus.CONFIRMED })
              .andWhere('tb.isDeleted = false');
          }, 'totalStudents') // Maps to teacher.totalStudents
        .where('teacher.isDeleted = false')
        .andWhere('user.hasCompletedProfile = true AND teacher.isActive = true')
      
      if (pagination.search) {
        query.andWhere(
          `(
            LOWER(user.firstName) LIKE LOWER(:search)
            OR LOWER(user.lastName) LIKE LOWER(:search)
            OR LOWER(details.bio) LIKE LOWER(:search)
            OR LOWER(teacher.preferredSubject) LIKE LOWER(:search)
            OR LOWER(teacher.introductionVideoTitle) LIKE LOWER(:search)
            OR LOWER(teacher.introductionVideoDescription) LIKE LOWER(:search)
            OR LOWER(teacher.introductionVideoUrl) LIKE LOWER(:search)
            OR LOWER(teacher.introductionVideoThumbnailUrl) LIKE LOWER(:search)
            OR LOWER(subject.name) LIKE LOWER(:search)
          )`,
          { search: `%${pagination.search}%` }
        );
      }
      
      if (pagination.subjects) {
        const subjects = pagination.subjects.split(',');
        query.andWhere('subject.name IN (:...subjects)', { subjects });
      }
      
      const [teachers, count] = await query
        .take(pagination.limit)
        .skip((pagination.page - 1) * pagination.limit)
        .orderBy('teacher.createdAt', 'DESC')
        .getManyAndCount();
        return {
            data: teachers,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: count,
                totalPages: Math.ceil(count / pagination.limit),
                hasNext: pagination.page < Math.ceil(count / pagination.limit),
                hasPrev: pagination.page > 1,
            },
        }
    }        
    async getFeaturedTeachersWithPagination(pagination: PaginationRequest) {
        const [teachers, count] = await this.teacherRepository.findAndCount({
            where: {
                user: {
                    hasCompletedProfile: true,
                },
            },
            take: 5,
            skip: 0,
            order: {
                createdAt: 'DESC',
            },
            relations: ['user', 'user.details']
        })
        return {
            data: teachers,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: count,
            },
        }
    }

    async getTeacherDetail(teacherId: string) {        
        const teacher = await this.teacherRepository
        .createQueryBuilder('teacher')
      
        // ================= USER =================
        .leftJoinAndSelect('teacher.user', 'user')
        .leftJoinAndSelect('user.details', 'details')
        .leftJoinAndSelect('details.nationality', 'nationality')
        .leftJoinAndSelect('user.educations', 'educations')
      
        // ================= TEACHER SUBJECTS =================
        .leftJoinAndSelect('teacher.teacherSubjects', 'teacherSubjects', 'teacherSubjects.isDeleted = false')
        .leftJoinAndSelect('teacherSubjects.subject', 'subject')
      
        // ================= AVAILABILITIES =================
        .leftJoinAndSelect('teacher.availabilities', 'availabilities')
      
        // ================= BOOKINGS (FILTERED) =================
        .leftJoinAndSelect(
          'teacher.teacherBookings',
          'teacherBookings',
          'teacherBookings.status = :status AND teacherBookings.isDeleted = false',
          { status: BookingStatus.COMPLETED },
        )
        .leftJoinAndSelect('teacherBookings.availability', 'availability')
      
        // ================= WHERE =================
        .where('teacher.id = :teacherId AND user.hasCompletedProfile = true', { teacherId })
      
        // ================= SELECT =================
        .select([
          // ---- Teacher
          'teacher.id',
          'teacher.tagline',
          'teacher.yearsOfExperience',
          'teacher.preferredSubject',
          'teacher.introduction',
          'teacher.introductionVideoUrl',
          'teacher.introductionVideoThumbnailUrl',
          'teacher.introductionVideoTitle',
          'teacher.introductionVideoDescription',
          'teacher.specialization',
          'teacher.hourlyRate',
          'teacher.monthlyRate',
      
          // ---- User
          'user.id',
          'user.firstName',
          'user.lastName',
          'user.email',
          'user.username',
      
          // ---- User Details
          'details.id',
          'details.bio',
          'details.profileImage',
          'details.phone',
          'details.dateOfBirth',
          'details.gender',
          'details.address',
          'details.city',
          'details.state',
          'details.country',
          'details.zipCode',
          'details.skills',
      
          // ---- Nationality
          'nationality.id',
          'nationality.name',
      
          // ---- Educations
          'educations.id',
          'educations.instituteName',
          'educations.degreeName',
          'educations.startedYear',
          'educations.endedYear',
          'educations.isStillStudying',
          'educations.remarks',
      
          // ---- Teacher Subjects
          'teacherSubjects.id',
          'teacherSubjects.hourlyRate',
          'teacherSubjects.monthlyRate',
      
          // ---- Subject
          'subject.id',
          'subject.name',
      
          // ---- Availabilities
          'availabilities.id',
          'availabilities.dayOfWeek',
          'availabilities.startTime',
          'availabilities.endTime',
      
          // ---- Bookings (CONFIRMED ONLY)
          'teacherBookings.id',
          'teacherBookings.bookingDate',
          'teacherBookings.totalAmount',
          'teacherBookings.paidAmount',
          'teacherBookings.dueAmount',
          'teacherBookings.discountAmount',
          'teacherBookings.status',
          'teacherBookings.createdAt',
          'teacherBookings.updatedAt',
          'teacherBookings.isDeleted',
          'teacherBookings.availability',
          'availability.startTime',
          'availability.endTime',
        ])
      
        .getOne();
        return teacher;
    }
}
