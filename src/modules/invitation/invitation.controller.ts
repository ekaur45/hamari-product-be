import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ApiResponseModel } from '../shared/models/api-response.model';
import AcademyInvitation from '../../database/entities/academy-invitation.entity';
import { InvitationService } from './invitation.service';
import { InvitationStatus } from '../shared/enums';

@ApiTags('Invitation')
@Controller('invitations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get()
  @ApiQuery({ name: 'status', enum: InvitationStatus, required: false })
  @ApiQuery({ name: 'academyId', type: 'string', required: false })
  @ApiResponse({
    status: 200,
    description: 'Invitations retrieved successfully',
    type: ApiResponseModel,
  })
  async getInvitations(
    @Query('status') status?: InvitationStatus,
    @Query('academyId') academyId?: string,
  ): Promise<ApiResponseModel<AcademyInvitation[]>> {
    const invitations = await this.invitationService.getInvitations({
      status,
      academyId,
    });
    return ApiResponseModel.success(
      invitations,
      'Invitations retrieved successfully',
    );
  }

  @Get('my-invitations')
  @ApiResponse({
    status: 200,
    description: 'User invitations retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyInvitations(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<AcademyInvitation[]>> {
    const invitations = await this.invitationService.getUserInvitations(
      req.user.id,
    );
    return ApiResponseModel.success(
      invitations,
      'User invitations retrieved successfully',
    );
  }

  @Get('sent-invitations')
  @ApiResponse({
    status: 200,
    description: 'Sent invitations retrieved successfully',
    type: ApiResponseModel,
  })
  async getSentInvitations(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<AcademyInvitation[]>> {
    const invitations = await this.invitationService.getSentInvitations(
      req.user.id,
    );
    return ApiResponseModel.success(
      invitations,
      'Sent invitations retrieved successfully',
    );
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Invitation retrieved successfully',
    type: ApiResponseModel,
  })
  async getInvitationById(
    @Param('id') id: string,
  ): Promise<ApiResponseModel<AcademyInvitation>> {
    const invitation = await this.invitationService.getInvitationById(id);
    return ApiResponseModel.success(
      invitation,
      'Invitation retrieved successfully',
    );
  }

  @Post(':id/accept')
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted successfully',
    type: ApiResponseModel,
  })
  async acceptInvitation(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<AcademyInvitation>> {
    const invitation = await this.invitationService.acceptInvitation(
      id,
      req.user.id,
    );
    return ApiResponseModel.success(
      invitation,
      'Invitation accepted successfully',
    );
  }

  @Post(':id/decline')
  @ApiResponse({
    status: 200,
    description: 'Invitation declined successfully',
    type: ApiResponseModel,
  })
  async declineInvitation(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<AcademyInvitation>> {
    const invitation = await this.invitationService.declineInvitation(
      id,
      req.user.id,
    );
    return ApiResponseModel.success(
      invitation,
      'Invitation declined successfully',
    );
  }

  @Post(':id/resend')
  @ApiResponse({
    status: 200,
    description: 'Invitation resent successfully',
    type: ApiResponseModel,
  })
  async resendInvitation(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<AcademyInvitation>> {
    const invitation = await this.invitationService.resendInvitation(
      id,
      req.user.id,
    );
    return ApiResponseModel.success(
      invitation,
      'Invitation resent successfully',
    );
  }
}
