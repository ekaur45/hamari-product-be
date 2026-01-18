import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { PaginationRequest } from "src/models/common/pagination.model";
import { PUBLIC_API_TEACHER, PUBLIC_API_TEACHER_BASE } from "src/utils/api.constants";
import { TeacherService } from "./teacher.service";
import { ApiResponseModel } from "src/modules/shared/models/api-response.model";

@ApiTags('Public Teacher')
@Controller(PUBLIC_API_TEACHER_BASE)
export class TeacherController {
    constructor(
        private readonly teacherService: TeacherService,
    ) { }
    @Get(PUBLIC_API_TEACHER.PING)
    ping() {
        return 'pong';
    }

    @Get(PUBLIC_API_TEACHER.BASE)
    async getTeachers(@Query() paginationRequest: PaginationRequest) {
        const result = await this.teacherService.getTeachersWithPagination(paginationRequest);
        return ApiResponseModel.success(result);
    }


    @ApiResponse({
        status: 200,
        description: 'Featured Teachers retrieved successfully',
        type: ApiResponseModel,
    })
    @Get(PUBLIC_API_TEACHER.FEATURED)
    async getFeaturedTeachers(@Query() paginationRequest: PaginationRequest) {
        const result = await this.teacherService.getFeaturedTeachersWithPagination(paginationRequest);
        return ApiResponseModel.success(result);
    }
    @Get(PUBLIC_API_TEACHER.DETAIL)
    async getTeacherDetail(@Param('teacherId') teacherId: string) {
        const result = await this.teacherService.getTeacherDetail(teacherId);
        return ApiResponseModel.success(result);
    }



}
