import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,

  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

import { ClassService } from './class.service';

@ApiTags('Class')
@Controller('classes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  
}
