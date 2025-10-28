import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ApiResponseModel } from '../shared/models/api-response.model';
import Academy from '../../database/entities/academy.entity';
import { AcademyService } from './academy.service';
import { CreateAcademyDto } from './dto/create-academy.dto';
import { UpdateAcademyDto } from './dto/update-academy.dto';
import { InviteTeacherDto } from './dto/invite-teacher.dto';

@ApiTags('Academy')
@Controller('academies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AcademyController {
  constructor(private readonly academyService: AcademyService) {}

  @Post()
  @ApiBody({ type: CreateAcademyDto })
  @ApiResponse({
    status: 200,
    description: 'Academy created successfully',
    type: ApiResponseModel,
  })
  async createAcademy(
    @Body() createAcademyDto: CreateAcademyDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Academy>> {
    const academy = await this.academyService.createAcademy(
      createAcademyDto,
      req.user.id,
    );
    return ApiResponseModel.success(academy, 'Academy created successfully');
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Academies retrieved successfully',
    type: ApiResponseModel,
  })
  async getAllAcademies(): Promise<ApiResponseModel<Academy[]>> {
    const academies = await this.academyService.getAllAcademies();
    return ApiResponseModel.success(
      academies,
      'Academies retrieved successfully',
    );
  }

  @Get('my-academies')
  @ApiResponse({
    status: 200,
    description: 'User academies retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyAcademies(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Academy[]>> {
    const academies = await this.academyService.getUserAcademies(req.user.id);
    return ApiResponseModel.success(
      academies,
      'User academies retrieved successfully',
    );
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Academy retrieved successfully',
    type: ApiResponseModel,
  })
  async getAcademyById(
    @Param('id') id: string,
  ): Promise<ApiResponseModel<Academy>> {
    const academy = await this.academyService.getAcademyById(id);
    return ApiResponseModel.success(academy, 'Academy retrieved successfully');
  }

  @Put(':id')
  @ApiBody({ type: UpdateAcademyDto })
  @ApiResponse({
    status: 200,
    description: 'Academy updated successfully',
    type: ApiResponseModel,
  })
  async updateAcademy(
    @Param('id') id: string,
    @Body() updateAcademyDto: UpdateAcademyDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Academy>> {
    const academy = await this.academyService.updateAcademy(
      id,
      updateAcademyDto,
      req.user.id,
    );
    return ApiResponseModel.success(academy, 'Academy updated successfully');
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Academy deleted successfully',
    type: ApiResponseModel,
  })
  async deleteAcademy(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<void>> {
    await this.academyService.deleteAcademy(id, req.user.id);
    return ApiResponseModel.success(undefined, 'Academy deleted successfully');
  }

  @Post(':id/invite-teacher')
  @ApiBody({ type: InviteTeacherDto })
  @ApiResponse({
    status: 200,
    description: 'Teacher invitation sent successfully',
    type: ApiResponseModel,
  })
  async inviteTeacher(
    @Param('id') academyId: string,
    @Body() inviteTeacherDto: InviteTeacherDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<void>> {
    await this.academyService.inviteTeacher(
      academyId,
      inviteTeacherDto,
      req.user.id,
    );
    return ApiResponseModel.success(
      undefined,
      'Teacher invitation sent successfully',
    );
  }

  @Get(':id/teachers')
  @ApiResponse({
    status: 200,
    description: 'Academy teachers retrieved successfully',
    type: ApiResponseModel,
  })
  async getAcademyTeachers(
    @Param('id') academyId: string,
  ): Promise<ApiResponseModel<any[]>> {
    const teachers = await this.academyService.getAcademyTeachers(academyId);
    return ApiResponseModel.success(
      teachers,
      'Academy teachers retrieved successfully',
    );
  }
}
