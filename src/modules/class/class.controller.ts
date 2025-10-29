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
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ApiResponseModel } from '../shared/models/api-response.model';
import Class from '../../database/entities/class.entity';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { CreateRecurringClassDto } from './dto/create-recurring-class.dto';
import { ClassType, ClassStatus } from '../shared/enums';

@ApiTags('Class')
@Controller('classes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  @ApiBody({ type: CreateClassDto })
  @ApiResponse({
    status: 200,
    description: 'Class created successfully',
    type: ApiResponseModel,
  })
  async createClass(
    @Body() createClassDto: CreateClassDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Class>> {
    const classEntity = await this.classService.createClass(
      createClassDto,
      req.user.id,
    );
    return ApiResponseModel.success(classEntity, 'Class created successfully');
  }

  @Post('recurring')
  @ApiBody({ type: CreateRecurringClassDto })
  @ApiResponse({
    status: 200,
    description: 'Recurring classes created successfully',
    type: ApiResponseModel,
  })
  async createRecurringClasses(
    @Body() createRecurringClassDto: CreateRecurringClassDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Class[]>> {
    const classes = await this.classService.createRecurringClasses(
      createRecurringClassDto,
      req.user.id,
    );
    return ApiResponseModel.success(classes, 'Recurring classes created successfully');
  }

  @Get()
  @ApiQuery({ name: 'type', enum: ClassType, required: false })
  @ApiQuery({ name: 'status', enum: ClassStatus, required: false })
  @ApiQuery({ name: 'teacherId', type: 'string', required: false })
  @ApiQuery({ name: 'academyId', type: 'string', required: false })
  @ApiResponse({
    status: 200,
    description: 'Classes retrieved successfully',
    type: ApiResponseModel,
  })
  async getClasses(
    @Query('type') type?: ClassType,
    @Query('status') status?: ClassStatus,
    @Query('teacherId') teacherId?: string,
    @Query('academyId') academyId?: string,
  ): Promise<ApiResponseModel<Class[]>> {
    const classes = await this.classService.getClasses({
      type,
      status,
      teacherId,
      academyId,
    });
    return ApiResponseModel.success(classes, 'Classes retrieved successfully');
  }

  @Get('my-classes')
  @ApiResponse({
    status: 200,
    description: 'User classes retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyClasses(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Class[]>> {
    const classes = await this.classService.getUserClasses(req.user.id);
    return ApiResponseModel.success(
      classes,
      'User classes retrieved successfully',
    );
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Class retrieved successfully',
    type: ApiResponseModel,
  })
  async getClassById(
    @Param('id') id: string,
  ): Promise<ApiResponseModel<Class>> {
    const classEntity = await this.classService.getClassById(id);
    return ApiResponseModel.success(
      classEntity,
      'Class retrieved successfully',
    );
  }

  @Put(':id')
  @ApiBody({ type: UpdateClassDto })
  @ApiResponse({
    status: 200,
    description: 'Class updated successfully',
    type: ApiResponseModel,
  })
  async updateClass(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Class>> {
    const classEntity = await this.classService.updateClass(
      id,
      updateClassDto,
      req.user.id,
    );
    return ApiResponseModel.success(classEntity, 'Class updated successfully');
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Class deleted successfully',
    type: ApiResponseModel,
  })
  async deleteClass(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<void>> {
    await this.classService.deleteClass(id, req.user.id);
    return ApiResponseModel.success(undefined, 'Class deleted successfully');
  }

  @Post(':id/start')
  @ApiResponse({
    status: 200,
    description: 'Class started successfully',
    type: ApiResponseModel,
  })
  async startClass(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Class>> {
    const classEntity = await this.classService.startClass(id, req.user.id);
    return ApiResponseModel.success(classEntity, 'Class started successfully');
  }

  @Post(':id/complete')
  @ApiResponse({
    status: 200,
    description: 'Class completed successfully',
    type: ApiResponseModel,
  })
  async completeClass(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Class>> {
    const classEntity = await this.classService.completeClass(id, req.user.id);
    return ApiResponseModel.success(
      classEntity,
      'Class completed successfully',
    );
  }

  @Get(':id/students')
  @ApiResponse({
    status: 200,
    description: 'Class students retrieved successfully',
    type: ApiResponseModel,
  })
  async getClassStudents(
    @Param('id') classId: string,
  ): Promise<ApiResponseModel<any[]>> {
    const students = await this.classService.getClassStudents(classId);
    return ApiResponseModel.success(
      students,
      'Class students retrieved successfully',
    );
  }
}
