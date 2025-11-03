import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth,ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

import { AcademyService } from './academy.service';

@ApiTags('Academy')
@Controller('academies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AcademyController {
  constructor(private readonly academyService: AcademyService) {}

 
}
