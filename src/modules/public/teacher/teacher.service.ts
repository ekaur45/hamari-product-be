import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Teacher } from "src/database/entities/teacher.entity";
import { PaginationRequest } from "src/models/common/pagination.model";
import { BookingStatus } from "src/modules/shared/enums";
import { Repository } from "typeorm";
import { Like } from "typeorm";

@Injectable()
export class TeacherService {
    constructor(
        @InjectRepository(Teacher)
        private readonly teacherRepository: Repository<Teacher>,
    ) { }

    async getTeachersWithPagination(pagination: PaginationRequest) {
        const search = pagination.search
            ? Like(`%${pagination.search}%`)
            : undefined;

        const [teachers, count] = await this.teacherRepository.findAndCount({
            where: [
                {
                    user: {
                        firstName: search,
                    },
                },
                {
                    user: {
                        lastName: search,
                    },
                },
                {
                    user: {
                        details: {
                            bio: search,
                        },
                    },
                },
                {
                    user: {
                        teacher: {
                            preferredSubject: search,
                        },
                    },
                },
                {
                    user: {
                        teacher: {
                            introductionVideoTitle: search,
                        },
                    },
                },
                {
                    user: {
                        teacher: {
                            introductionVideoDescription: search,
                        },
                    },
                },
                {
                    user: {
                        teacher: {
                            introductionVideoUrl: search,
                        },
                    },
                },
                {
                    user: {
                        teacher: {
                            introductionVideoThumbnailUrl: search,
                        },
                    },
                },
                {
                    user: {
                        teacher: {
                            teacherSubjects: {
                                subject: {
                                    name: search,
                                },
                            },
                        },
                    },
                },
                {
                    user: {
                        hasCompletedProfile: true,
                    },
                },
            ],

            take: pagination.limit,
            skip: (pagination.page - 1) * pagination.limit,
            order: {
                createdAt: 'DESC',
            },
            relations: ['user', 'user.details']
        });
        return {
            data: teachers,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: count,
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
            take: 3,
            skip: 0,
            order: {
                createdAt: 'ASC',
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
        .leftJoinAndSelect('teacher.teacherSubjects', 'teacherSubjects')
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
