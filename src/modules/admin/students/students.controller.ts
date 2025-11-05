import { Controller, Get, Query } from '@nestjs/common';
import { AdminStudentsService } from './admin-students.service';
import { ApiResponseModel } from 'src/modules/shared/models/api-response.model';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import StudentListDto from './dto/student-list.dto';

@Controller('admin/students')
export class StudentsController {
    constructor(private readonly adminStudentsService: AdminStudentsService) {}


    @Get()
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiQuery({ name: 'search', type: 'string', required: false })
    @ApiQuery({ name: 'isActive', type: 'boolean', required: false })
    @ApiResponse({
        status: 200,
        description: 'Students retrieved successfully',
        type: ApiResponseModel,
    })
    async getStudents(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('isActive') isActive?: boolean,
    ): Promise<ApiResponseModel<StudentListDto>> {
        const students = await this.adminStudentsService.getStudents({ page, limit, search, isActive });
        return ApiResponseModel.success(students, 'Students retrieved successfully');
    }
}
