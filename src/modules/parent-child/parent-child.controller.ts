import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ParentChildService } from './parent-child.service';
import User from 'src/database/entities/user.entity';

@ApiTags('Parent-Child')
@Controller('parent-children')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ParentChildController {
  constructor(private readonly parentChildService: ParentChildService) { }

  @Post('add')
  async addChild(@Request() req: { user: User }, @Body('email') email: string) {
    return this.parentChildService.addChildByEmail(req.user, email);
  }

  @Get()
  async getChildren(@Request() req: { user: User }) {
    return this.parentChildService.getChildren(req.user);
  }
}
