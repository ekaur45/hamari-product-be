import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import AcademyInvitation from '../../database/entities/academy-invitation.entity';
import User from '../../database/entities/user.entity';
import Academy from '../../database/entities/academy.entity';
import AcademyTeacher from '../../database/entities/academy-teacher.entity';
import { InvitationStatus, TeacherRole, TeacherStatus } from '../shared/enums';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(AcademyInvitation)
    private readonly invitationRepository: Repository<AcademyInvitation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Academy)
    private readonly academyRepository: Repository<Academy>,
    @InjectRepository(AcademyTeacher)
    private readonly academyTeacherRepository: Repository<AcademyTeacher>,
  ) {}

  async getInvitations(filters: {
    status?: InvitationStatus;
    academyId?: string;
  }): Promise<AcademyInvitation[]> {
    const query = this.invitationRepository
      .createQueryBuilder('invitation')
      .leftJoinAndSelect('invitation.academy', 'academy')
      .leftJoinAndSelect('invitation.invitedTeacher', 'invitedTeacher')
      .leftJoinAndSelect('invitation.invitedBy', 'invitedBy')
      .where('invitation.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.status) {
      query.andWhere('invitation.status = :status', { status: filters.status });
    }

    if (filters.academyId) {
      query.andWhere('invitation.academyId = :academyId', {
        academyId: filters.academyId,
      });
    }

    return await query.getMany();
  }

  async getUserInvitations(userId: string): Promise<AcademyInvitation[]> {
    return await this.invitationRepository.find({
      where: { invitedTeacherId: userId, isDeleted: false },
      relations: ['academy', 'invitedBy'],
    });
  }

  async getSentInvitations(userId: string): Promise<AcademyInvitation[]> {
    return await this.invitationRepository.find({
      where: { invitedByUserId: userId, isDeleted: false },
      relations: ['academy', 'invitedTeacher'],
    });
  }

  async getInvitationById(id: string): Promise<AcademyInvitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['academy', 'invitedTeacher', 'invitedBy'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return invitation;
  }

  async acceptInvitation(
    id: string,
    userId: string,
  ): Promise<AcademyInvitation> {
    const invitation = await this.getInvitationById(id);

    if (invitation.invitedTeacherId !== userId) {
      throw new ForbiddenException(
        'You can only accept invitations sent to you',
      );
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Only pending invitations can be accepted');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    // Check if teacher is already part of the academy
    const existingTeacher = await this.academyTeacherRepository.findOne({
      where: {
        academyId: invitation.academyId,
        teacherId: userId,
        isDeleted: false,
      },
    });

    if (existingTeacher) {
      throw new BadRequestException('You are already part of this academy');
    }

    // Add teacher to academy
    const academyTeacher = this.academyTeacherRepository.create({
      academyId: invitation.academyId,
      teacherId: userId,
      role: TeacherRole.TEACHER,
      status: TeacherStatus.ACTIVE,
    });

    await this.academyTeacherRepository.save(academyTeacher);

    // Update invitation status
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.respondedAt = new Date();

    return await this.invitationRepository.save(invitation);
  }

  async declineInvitation(
    id: string,
    userId: string,
  ): Promise<AcademyInvitation> {
    const invitation = await this.getInvitationById(id);

    if (invitation.invitedTeacherId !== userId) {
      throw new ForbiddenException(
        'You can only decline invitations sent to you',
      );
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Only pending invitations can be declined');
    }

    invitation.status = InvitationStatus.DECLINED;
    invitation.respondedAt = new Date();

    return await this.invitationRepository.save(invitation);
  }

  async resendInvitation(
    id: string,
    userId: string,
  ): Promise<AcademyInvitation> {
    const invitation = await this.getInvitationById(id);

    if (invitation.invitedByUserId !== userId) {
      throw new ForbiddenException('You can only resend invitations you sent');
    }

    if (invitation.status !== InvitationStatus.DECLINED) {
      throw new BadRequestException('Only declined invitations can be resent');
    }

    // Check if teacher is already part of the academy
    const existingTeacher = await this.academyTeacherRepository.findOne({
      where: {
        academyId: invitation.academyId,
        teacherId: invitation.invitedTeacherId,
        isDeleted: false,
      },
    });

    if (existingTeacher) {
      throw new BadRequestException('Teacher is already part of this academy');
    }

    invitation.status = InvitationStatus.PENDING;
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    invitation.respondedAt = null;

    return await this.invitationRepository.save(invitation);
  }
}
