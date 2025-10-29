import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { SubjectService } from './subject.service';

@ApiTags('Subject')
@Controller('subjects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @ApiBody({ schema: { properties: { name: { type: 'string' }, description: { type: 'string' }, academyId: { type: 'string', format: 'uuid' } }, required: ['name', 'academyId'] } })
  @ApiResponse({ status: 201, description: 'Subject created' })
  async create(@Body() body: { name: string; description?: string; academyId: string }, @Request() req: { user: { id: string } }) {
    const subject = await this.subjectService.createSubject(body, req.user.id);
    return { success: true, message: 'Subject created successfully', data: subject };
  }

  @Get('academy/:academyId')
  @ApiResponse({ status: 200, description: 'Subjects fetched' })
  async list(@Param('academyId') academyId: string, @Request() req: { user: { id: string } }) {
    const subjects = await this.subjectService.listSubjects(academyId, req.user.id);
    return { success: true, message: 'Subjects fetched successfully', data: subjects };
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'Subject updated' })
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
    @Request() req: { user: { id: string } },
  ) {
    const subject = await this.subjectService.updateSubject(id, body, req.user.id);
    return { success: true, message: 'Subject updated successfully', data: subject };
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Subject deleted' })
  async delete(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    await this.subjectService.deleteSubject(id, req.user.id);
    return { success: true, message: 'Subject deleted successfully' };
  }
}


