import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ParentChildService } from './parent-child.service';

@ApiTags('Parent-Child')
@Controller('parent-children')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ParentChildController {
  constructor(private readonly parentChildService: ParentChildService) {}

}
