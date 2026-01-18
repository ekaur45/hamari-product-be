import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Teacher } from "src/database/entities/teacher.entity";
import { PaginationRequest } from "src/models/common/pagination.model";
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
            take: 3,
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
        const teacher = await this.teacherRepository.findOne({
            where: {
                id: teacherId,
            },
            relations: ['user', 'user.details', 'user.details.nationality', 'user.educations', 'teacherSubjects', 'teacherSubjects.subject', 'availabilities', 'teacherBookings'],
            select: {
                id: true, // 🔥 MUST HAVE
                tagline: true,
                yearsOfExperience: true,
                preferredSubject: true,
                introduction: true,
                introductionVideoUrl: true,
                introductionVideoThumbnailUrl: true,
                introductionVideoTitle: true,
                introductionVideoDescription: true,
                specialization: true,
                hourlyRate: true,
                monthlyRate: true,
                classes: true,

                user: {
                    id: true, // 🔥 MUST HAVE
                    firstName: true,
                    lastName: true,
                    email: true,
                    username: true,
                    details: {
                        id: true, // 🔥 MUST HAVE
                        bio: true,
                        profileImage: true,
                        phone: true,
                        nationality: true,
                        dateOfBirth: true,
                        gender: true,
                        address: true,
                        city: true,
                        state: true,
                        country: true,
                        zipCode: true,
                        skills: true,
                    },
                    educations: {
                        id: true, // 🔥 MUST HAVE
                        instituteName: true,
                        degreeName: true,
                        startedYear: true,
                        endedYear: true,
                        isStillStudying: true,
                        remarks: true,
                    },
                },

                teacherSubjects: {
                    id: true, // 🔥 MUST HAVE
                    subject: true,
                    hourlyRate: true,
                    monthlyRate: true,
                },

                availabilities: {
                    id: true, // 🔥 MUST HAVE
                    dayOfWeek: true,
                    startTime: true,
                    endTime: true,
                },

                teacherBookings: {
                    id: true // 🔥 MUST HAVE
                }
            },
        })
        return teacher;
    }
}
