import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/database/entities/user.entity';
import { In, Repository } from 'typeorm';
import UserDetail from 'src/database/entities/user-details.entity';
import { UserRole } from '../shared/enums';
import UpdateProfileDto, { AddAvailabilityDto, UpdateProfessionalInfoDto, UpdateProfileBioDto, UpdateUserEducationDto, UpdateUserSubjectsDto } from './dto/update-profile.dto';
import { Teacher } from 'src/database/entities/teacher.entity';
import UserEducation from 'src/database/entities/user-education.entity';
import TeacherSubject from 'src/database/entities/teacher-subject.entity';
import Subject from 'src/database/entities/subject.entity';
import Availability, { AvailabilityDay } from 'src/database/entities/availablility.entity';

const logger = new Logger('ProfileService');

@Injectable()
export class ProfileService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserDetail)
        private readonly userDetailRepository: Repository<UserDetail>,

        @InjectRepository(Teacher)
        private readonly teacherRepository: Repository<Teacher>,

        @InjectRepository(TeacherSubject)
        private readonly teacherSubjectRepository: Repository<TeacherSubject>,
        @InjectRepository(Subject)
        private readonly subjectRepository: Repository<Subject>,

        @InjectRepository(Availability)
        private readonly teacherAvailabilityRepository: Repository<Availability>,
    ) {
    }

    async getProfile(user: User) {
        const query = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.details', 'details', 'user.id = details.userId')
            .leftJoinAndSelect('user.educations', 'educations');

        if (user.role === UserRole.STUDENT) {
            query.leftJoinAndSelect('user.student', 'student');
        }

        if (user.role === UserRole.TEACHER) {
            query
                .leftJoinAndSelect('user.teacher', 'teacher')
                .leftJoinAndSelect(
                    'teacher.teacherSubjects',
                    'teacherSubjects',
                    'teacherSubjects.isDeleted = false' // 👈 Filter here
                )
                .leftJoinAndSelect('teacherSubjects.subject', 'subject')
                .leftJoinAndSelect('teacher.availabilities', 'availabilities', 'availabilities.isDeleted = false');
        }

        if (user.role === UserRole.PARENT) {
            query.leftJoinAndSelect('user.parent', 'parent');
        }

        if (user.role === UserRole.ACADEMY_OWNER) {
            query.leftJoinAndSelect('user.academy', 'academy');
        }

        const userData = await query
            .where('user.id = :id', { id: user.id })
            .getOne();

        return userData;
        /*const relations = ['details','educations'];
        if (user.role === UserRole.STUDENT) {
            relations.push('student');
        }
        if (user.role === UserRole.TEACHER) {
            relations.push('teacher');
            relations.push('teacher.teacherSubjects');
            relations.push('teacher.teacherSubjects.subject');
        }
        if (user.role === UserRole.PARENT) {
            relations.push('parent');
        }
        if (user.role === UserRole.ACADEMY_OWNER) {
            relations.push('academy');
        }
        const userData = await this.userRepository.findOne({
            where: { id: user.id },
            relations: relations,
        });
        return userData;*/
    }

    async updateProfile(id: string, updateProfileDto: UpdateProfileDto, user: User) {
        const userData = await this.userRepository.findOne({
            where: { id: user.id },
            relations: ['details'],
        });
        if (!userData) {
            throw new NotFoundException('User not found');
        }
        if (updateProfileDto.firstName) {
            userData.firstName = updateProfileDto.firstName;
        }
        if (updateProfileDto.lastName) {
            userData.lastName = updateProfileDto.lastName;
        }
        if (userData.details) {
            userData.details.phone = updateProfileDto.phone;
            userData.details.nationalityId = updateProfileDto.nationalityId;
            userData.details.dateOfBirth = updateProfileDto.dateOfBirth;
            userData.details.gender = updateProfileDto.gender;
            userData.details.address = updateProfileDto.address;
            userData.details.city = updateProfileDto.city;
            userData.details.state = updateProfileDto.state;
            userData.details.country = updateProfileDto.country;
            userData.details.zipCode = updateProfileDto.zipCode;
        }
        // if (updateProfileDto.phone) {
        //     userData.phone = updateProfileDto.phone;
        // }
        await this.userRepository.save(userData);
        return userData;
    }

    async updateProfessionalInfo(id: string, updateProfessionalInfoDto: UpdateProfessionalInfoDto, user: User) {
        if (user.role !== UserRole.TEACHER) {
            throw new ForbiddenException('You are not authorized to update professional info');
        }
        const userData = await this.userRepository.findOne({
            where: { id: user.id },
            relations: ['teacher'],
        });
        if (!userData) {
            throw new NotFoundException('User not found');
        }
        if (!userData.teacher) {
            // create a new teacher
            userData.teacher = new Teacher();
            userData.teacher.userId = user.id;
            await this.teacherRepository.save(userData.teacher);
        }
        if (updateProfessionalInfoDto.preferredSubject) {
            userData.teacher.preferredSubject = updateProfessionalInfoDto.preferredSubject;
        }
        if (updateProfessionalInfoDto.yearsOfExperience) {
            userData.teacher.yearsOfExperience = updateProfessionalInfoDto.yearsOfExperience;
        }
        if (updateProfessionalInfoDto.tagline) {
            userData.teacher.tagline = updateProfessionalInfoDto.tagline;
        }
        if (updateProfessionalInfoDto.introduction) {
            userData.teacher.introduction = updateProfessionalInfoDto.introduction;
        }
        if (updateProfessionalInfoDto.introductionVideoUrl) {
            userData.teacher.introductionVideoUrl = updateProfessionalInfoDto.introductionVideoUrl;
        }
        if (updateProfessionalInfoDto.introductionVideoThumbnailUrl) {
            userData.teacher.introductionVideoThumbnailUrl = updateProfessionalInfoDto.introductionVideoThumbnailUrl;
        }
        if (updateProfessionalInfoDto.introductionVideoTitle) {
            userData.teacher.introductionVideoTitle = updateProfessionalInfoDto.introductionVideoTitle;
        }
        if (updateProfessionalInfoDto.introductionVideoDescription) {
            userData.teacher.introductionVideoDescription = updateProfessionalInfoDto.introductionVideoDescription;
        }
        await this.userRepository.save(userData);
        return userData;
    }

    async updateProfileBio(id: string, updateProfileBioDto: UpdateProfileBioDto, user: User) {
        if (user.role !== UserRole.STUDENT) {
            throw new ForbiddenException('You are not authorized to update student profile bio');
        }
        const userData = await this.userRepository.findOne({
            where: { id: user.id },
            relations: ['student'],
        });
        if (!userData) {
            throw new NotFoundException('User not found');
        }
        if (!userData.student) {
            throw new NotFoundException('Student not found');
        }
        userData.student.tagline = updateProfileBioDto.bio;
        const saved = await this.userRepository.save(userData);
        new Logger('ProfileService').log('Profile bio updated successfully', saved);
        return userData;
    }
    async updateUserEducation(id: string, updateUserEducationDto: UpdateUserEducationDto, user: User) {
        if (user.role !== UserRole.TEACHER) {
            throw new ForbiddenException('You are not authorized to update student education');
        }
        const userData = await this.userRepository.findOne({
            where: { id: user.id },
            relations: ['educations'],
        });
        if (!userData) {
            throw new NotFoundException('User not found');
        }
        const education = new UserEducation();
        education.instituteName = updateUserEducationDto.instituteName;
        education.degreeName = updateUserEducationDto.degreeName;
        education.startedYear = updateUserEducationDto.startedYear;
        education.endedYear = updateUserEducationDto.endedYear;
        education.isStillStudying = updateUserEducationDto.isStillStudying;
        education.remarks = updateUserEducationDto.remarks;
        if (!userData.educations) {
            userData.educations = [];
        }
        userData.educations.push(education);
        const saved = await this.userRepository.save(userData);
        new Logger('ProfileService').log('User education updated successfully', saved);
        return userData;
    }
    async updateUserSubjects(id: string, updateUserSubjectsDto: Array<UpdateUserSubjectsDto>, user: User) {

        if (user.role !== UserRole.TEACHER) {
            throw new ForbiddenException('You are not authorized to update teacher subjects');
        }
        const teacher = await this.teacherRepository.findOne({
            where: { userId: user.id },
            relations: ['teacherSubjects'],
        });
        if (!teacher) {
            throw new NotFoundException('User not found');
        }
        if (!teacher.teacherSubjects) {
            teacher.teacherSubjects = [];
        }
        for (const subject of updateUserSubjectsDto) {
            const teacherSubject = new TeacherSubject();
            if (!subject.id) {
                // Create new subject if ID is not provided
                const savedSubject = await this.subjectRepository.save(this.subjectRepository.create({ name: subject.name }));
                teacherSubject.subjectId = savedSubject.id;
            } else {
                // Verify subject exists when ID is provided
                const existingSubject = await this.subjectRepository.findOne({ where: { id: subject.id } });
                if (!existingSubject) {
                    throw new NotFoundException(`Subject with ID ${subject.id} not found`);
                }
                teacherSubject.subjectId = subject.id;
            }
            teacherSubject.skillLevel = subject.skillLevel;
            teacherSubject.teacherId = teacher.id;
            teacher.teacherSubjects.push(teacherSubject);
        }
        await this.teacherSubjectRepository.upsert(teacher.teacherSubjects, {
            conflictPaths: ['teacherId', 'subjectId'],
        });
        const saved = await this.teacherRepository.save(teacher);
        return teacher;
    }


    async addAvailability(id: string, addAvailabilityDto: Array<AddAvailabilityDto>, user: User) {
        if (user.role !== UserRole.TEACHER) {
            throw new ForbiddenException('You are not authorized to add availability');
        }
        let teacher = await this.teacherRepository.findOne({
            where: { userId: user.id },
            relations: ['availabilities'],
        });
        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }
        if (!teacher.availabilities) {
            teacher.availabilities = [];
        }
        await this.teacherAvailabilityRepository.update({ teacherId: teacher.id }, { isDeleted: true });
        teacher = await this.teacherRepository.findOne({
            where: { userId: user.id, isDeleted: false },
            relations: ['availabilities'],
        });
        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }
        // mark
        for (const item of addAvailabilityDto) {
            const availability = new Availability();
            availability.dayOfWeek = item.dayOfWeek as AvailabilityDay;
            availability.startTime = item.startTime;
            availability.endTime = item.endTime;
            availability.teacherId = teacher.id;
            availability.isDeleted = false;
            teacher.availabilities.push(availability);
            
        }
        //await this.teacherAvailabilityRepository.insert(teacher.availabilities.filter(a => a.isDeleted !== true));
        await this.teacherAvailabilityRepository.upsert(teacher.availabilities.filter(a => a.isDeleted === false), {
            conflictPaths: ['teacherId', 'dayOfWeek', 'startTime', 'endTime'],
        });
        const saved = await this.teacherRepository.save(teacher);
        return teacher;
    }

    async updateProfilePicture(id: string, url: string, user: User) {
        const userData = await this.userRepository.findOne({
            where: { id: user.id },
            relations: ['details'],
        });
        if (!userData) {
            throw new NotFoundException('User not found');
        }
        if (!userData.details) {
            userData.details = new UserDetail();
            userData.details.userId = user.id;
            userData.details.profileImage = url;
            await this.userDetailRepository.upsert(userData.details, {
                conflictPaths: ['userId'],
            });
        }
        else {
            userData.details.profileImage = url;
            await this.userDetailRepository.upsert(userData.details, {
                conflictPaths: ['userId'],
            });
        }
        //await this.userRepository.save(userData);
        return userData;
    }
}
