import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Put, Request, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiResponseModel } from '../shared/models/api-response.model';
import User from 'src/database/entities/user.entity';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import UpdateProfileDto, { AddAvailabilityDto, UpdateProfessionalInfoDto, UpdateProfileBioDto, UpdateUserEducationDto, UpdateUserSubjectsDto } from './dto/update-profile.dto';
import { Teacher } from 'src/database/entities/teacher.entity';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {
    }

    @ApiResponse({
        status: 200,
        description: 'Profile retrieved successfully',
        type: ApiResponseModel,
    })
    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req: { user: User }): Promise<ApiResponseModel<Omit<User, 'password'>>> {
        const profile = await this.profileService.getProfile(req.user);
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        return ApiResponseModel.success(profile, 'Profile retrieved successfully');
    }


    @ApiResponse({
        status: 200,
        description: 'Profile updated successfully',
        type: ApiResponseModel,
    })

    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @Put(':id')
    @ApiBody({ type: UpdateProfileDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async updateProfile(
        @Param('id') id: string, 
        @Body() updateProfileDto: UpdateProfileDto, 
        @Request() req: { user: User }
    ): Promise<ApiResponseModel<Omit<User, 'password'>>> {
        if (id !== req.user.id) {
            throw new ForbiddenException('You can only update your own profile');
        }
        const profile = await this.profileService.updateProfile(id, updateProfileDto, req.user);
        return ApiResponseModel.success(profile, 'Profile updated successfully');
    }


    @ApiResponse({
        status: 200,
        description: 'Professional info updated successfully',
        type: ApiResponseModel,
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @Put(':id/professional-info')
    @ApiBody({ type: UpdateProfessionalInfoDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async updateProfessionalInfo(
        @Param('id') id: string,
        @Body() updateProfessionalInfoDto: UpdateProfessionalInfoDto,
        @Request() req: { user: User }
    ): Promise<ApiResponseModel<Omit<User, 'password'>>> {
        if (id !== req.user.id) {
            throw new ForbiddenException('You can only update your own professional info');
        }
        const professionalInfo = await this.profileService.updateProfessionalInfo(id, updateProfessionalInfoDto, req.user);
        return ApiResponseModel.success(professionalInfo, 'Professional info updated successfully');
    }


    @ApiResponse({
        status: 200,
        description: 'Profile bio updated successfully',
        type: ApiResponseModel,
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @Put(':id/bio')
    @ApiBody({ type: UpdateProfileBioDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async updateProfileBio(
        @Param('id') id: string,
        @Body() updateProfileBioDto: UpdateProfileBioDto,
        @Request() req: { user: User }
    ): Promise<ApiResponseModel<Omit<User, 'password'>>> {
        if (id !== req.user.id) {
            throw new ForbiddenException('You can only update your own profile bio');
        }
        const profileBio = await this.profileService.updateProfileBio(id, updateProfileBioDto, req.user);
        return ApiResponseModel.success(profileBio, 'Profile bio updated successfully');
    }


    @Put(':id/education')
    @ApiBody({ type: UpdateUserEducationDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async updateUserEducation(
        @Param('id') id: string,
        @Body() updateUserEducationDto: UpdateUserEducationDto,
        @Request() req: { user: User }
    ): Promise<ApiResponseModel<Omit<User, 'password'>>> {
        if (id !== req.user.id) {
            throw new ForbiddenException('You can only update your own education');
        }
        const userEducation = await this.profileService.updateUserEducation(id, updateUserEducationDto, req.user);
        return ApiResponseModel.success(userEducation, 'User education updated successfully');
    }


    @Put(':id/subjects')
    @ApiBody({ type: Array<UpdateUserSubjectsDto> })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async updateUserSubjects(
        @Param('id') id: string,
        @Body() updateUserSubjectsDto: Array<UpdateUserSubjectsDto>,
        @Request() req: { user: User }
    ): Promise<ApiResponseModel<Teacher>> {
        if (id !== req.user.id) {
            throw new ForbiddenException('You can only update your own subjects');
        }
        const userSubjects = await this.profileService.updateUserSubjects(id, updateUserSubjectsDto, req.user);
        return ApiResponseModel.success(userSubjects, 'User subjects updated successfully');
    }


    @Put(':id/availability')
    @ApiBody({ type: Array<AddAvailabilityDto> })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async addAvailability(
        @Param('id') id: string,
        @Body() addAvailabilityDto: Array<AddAvailabilityDto>,
        @Request() req: { user: User }
    ): Promise<ApiResponseModel<Teacher>> {
        if (id !== req.user.id) {
            throw new ForbiddenException('You can only add your own availability');
        }
        const availability = await this.profileService.addAvailability(id, addAvailabilityDto, req.user);
        return ApiResponseModel.success(availability, 'Availability added successfully');
    }
}
