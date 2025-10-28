import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Academy from '../../database/entities/academy.entity';
import User from '../../database/entities/user.entity';
import AcademyTeacher from '../../database/entities/academy-teacher.entity';
import AcademyInvitation from '../../database/entities/academy-invitation.entity';
import { CreateAcademyDto } from './dto/create-academy.dto';
import { UpdateAcademyDto } from './dto/update-academy.dto';
import { InviteTeacherDto } from './dto/invite-teacher.dto';
import {
  AcademyStatus,
  InvitationStatus,
  UserRole,
} from '../shared/enums';

@Injectable()
export class AcademyService {
  constructor(
    @InjectRepository(Academy)
    private readonly academyRepository: Repository<Academy>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AcademyTeacher)
    private readonly academyTeacherRepository: Repository<AcademyTeacher>,
    @InjectRepository(AcademyInvitation)
    private readonly academyInvitationRepository: Repository<AcademyInvitation>,
  ) {}

  async createAcademy(
    createAcademyDto: CreateAcademyDto,
    ownerId: string,
  ): Promise<Academy> {
    const academy = this.academyRepository.create({
      ...createAcademyDto,
      ownerId,
      status: AcademyStatus.ACTIVE,
    });
    return await this.academyRepository.save(academy);
  }

  async getAllAcademies(): Promise<Academy[]> {
    return await this.academyRepository.find({
      where: { isDeleted: false },
      relations: ['owner'],
    });
  }

  async getUserAcademies(userId: string): Promise<Academy[]> {
    return await this.academyRepository.find({
      where: { ownerId: userId, isDeleted: false },
      relations: ['owner'],
    });
  }

  async getAcademyById(id: string): Promise<Academy> {
    const academy = await this.academyRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['owner', 'teachers', 'teachers.teacher'],
    });

    if (!academy) {
      throw new NotFoundException('Academy not found');
    }

    return academy;
  }

  async updateAcademy(
    id: string,
    updateAcademyDto: UpdateAcademyDto,
    userId: string,
  ): Promise<Academy> {
    const academy = await this.getAcademyById(id);

    if (academy.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own academies');
    }

    Object.assign(academy, updateAcademyDto);
    return await this.academyRepository.save(academy);
  }

  async deleteAcademy(id: string, userId: string): Promise<void> {
    const academy = await this.getAcademyById(id);

    if (academy.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own academies');
    }

    academy.isDeleted = true;
    await this.academyRepository.save(academy);
  }

  async inviteTeacher(
    academyId: string,
    inviteTeacherDto: InviteTeacherDto,
    userId: string,
  ): Promise<void> {
    const academy = await this.getAcademyById(academyId);

    if (academy.ownerId !== userId) {
      throw new ForbiddenException('Only academy owners can invite teachers');
    }

    const teacher = await this.userRepository.findOne({
      where: { email: inviteTeacherDto.email, role: UserRole.TEACHER },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found with this email');
    }

    // Check if teacher is already part of the academy
    const existingTeacher = await this.academyTeacherRepository.findOne({
      where: { academyId, teacherId: teacher.id },
    });

    if (existingTeacher) {
      throw new ForbiddenException('Teacher is already part of this academy');
    }

    // Check if there's already a pending invitation
    const existingInvitation = await this.academyInvitationRepository.findOne({
      where: {
        academyId,
        invitedTeacherId: teacher.id,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      throw new ForbiddenException('Invitation already sent to this teacher');
    }

    const invitation = this.academyInvitationRepository.create({
      academyId,
      invitedTeacherId: teacher.id,
      invitedByUserId: userId,
      message: inviteTeacherDto.message,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await this.academyInvitationRepository.save(invitation);
  }

  async getAcademyTeachers(academyId: string): Promise<any[]> {
    const academyTeachers = await this.academyTeacherRepository.find({
      where: { academyId, isDeleted: false },
      relations: ['teacher'],
    });

    return academyTeachers.map((at) => ({
      id: at.id,
      role: at.role,
      status: at.status,
      salary: at.salary,
      createdAt: at.createdAt,
      teacher: {
        id: at.teacher.id,
        firstName: at.teacher.firstName,
        lastName: at.teacher.lastName,
        email: at.teacher.email,
      },
    }));
  }
}
