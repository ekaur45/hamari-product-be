import {
  Controller,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,

  ApiResponse,

  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

import { ClassService } from './class.service';
import { ApiResponseModel } from '../shared/models/api-response.model';
import ClassEntity from 'src/database/entities/classes.entity';
import User from 'src/database/entities/user.entity';

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

  
}
