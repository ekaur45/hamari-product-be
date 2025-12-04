import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,

  ApiBody,

  ApiResponse,

  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

import { ClassService } from './class.service';
import { ApiResponseModel } from '../shared/models/api-response.model';
import ClassEntity from 'src/database/entities/classes.entity';
import User from 'src/database/entities/user.entity';
import { BookClassDto } from './dto/book-class.dto';

@ApiTags('Class')
@Controller('classes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get('')
  @ApiResponse({
    status: 200,
    description: 'Classes retrieved successfully',
    type: ApiResponseModel<ClassEntity[]>,
  })
  async getClasses(@Request() req: { user: User }): Promise<ApiResponseModel<ClassEntity[]>> {
    const classes = await this.classService.getClasses(req.user);
    return ApiResponseModel.success(classes, 'Classes retrieved successfully');
  }

  @Get(':classId')
  @ApiResponse({
    status: 200,
    description: 'Class retrieved successfully',
    type: ApiResponseModel<ClassEntity>,
  })
  async getClass(@Param('classId') classId: string): Promise<ApiResponseModel<ClassEntity>> {
    const classEntity = await this.classService.getClass(classId);
    return ApiResponseModel.success(classEntity, 'Class retrieved successfully');
  }
  @Post(':classId/book')
  @ApiBody({ type: BookClassDto })
  @ApiResponse({
    status: 200,
    description: 'Class booked successfully',
    type: ApiResponseModel<ClassEntity>,
  })
  async bookClass(@Param('classId') classId: string, @Body() bookClassDto: BookClassDto, @Request() req: { user: User }): Promise<ApiResponseModel<ClassEntity>> {
    const classEntity = await this.classService.bookClass(classId, bookClassDto, req.user);
    return ApiResponseModel.success(classEntity, 'Class booked successfully');
  }

  
}
