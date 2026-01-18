import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Post, Put, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiResponseModel } from '../shared/models/api-response.model';
import User from 'src/database/entities/user.entity';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import UpdateProfileDto, { AddAvailabilityDto, UpdateProfessionalInfoDto, UpdateProfileBioDto, UpdateUserEducationDto, UpdateUserSubjectsDto } from './dto/update-profile.dto';
import { Teacher } from 'src/database/entities/teacher.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

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

    @Delete(':id/education/:educationId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async deleteUserEducation(
        @Param('id') id: string,
        @Param('educationId') educationId: string,
        @Request() req: { user: User }
    ): Promise<ApiResponseModel<Omit<User, 'password'>>> {
        if (id !== req.user.id) {
            throw new ForbiddenException('You can only delete your own education');
        }
        const userEducation = await this.profileService.deleteUserEducation(id, educationId, req.user);
        return ApiResponseModel.success(userEducation, 'User education deleted successfully');
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

    @Post('profile-photo')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                cb(null, `${randomName}-${file.originalname}`);
            },
        }),
        limits: {
            fileSize: 1024 * 1024 * 5, // 5MB
        },
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async updateProfilePicture(
        @Request() req: { user: User },
        @UploadedFile() file: Express.Multer.File
    ): Promise<ApiResponseModel<Omit<User, 'password'>>> {
        if (req.user.id !== req.user.id) {
            throw new ForbiddenException('You can only update your own profile picture');
        }
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        const url = `/uploads/${file.filename}`;
        const profilePicture = await this.profileService.updateProfilePicture(req.user.id, url, req.user);
        return ApiResponseModel.success(profilePicture, 'Profile picture updated successfully');
    }
}
