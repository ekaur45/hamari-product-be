import { Controller, Get, Query, SetMetadata, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserRole } from "src/modules/shared/enums";
import { JwtAuthGuard } from "src/modules/shared/guards/jwt-auth.guard";
import { RoleGuard } from "src/modules/shared/guards/role.guard";
import { ApiResponseModel } from "src/modules/shared/models/api-response.model";
import AdminLogListDto from "./dto/admin-log-list.dto";
import { AdminLogsService } from "./admin-logs.service";

@ApiTags('Logs')
@Controller('admin/logs')
@UseGuards(JwtAuthGuard, RoleGuard)
@SetMetadata("user_roles", [UserRole.ADMIN])
@ApiBearerAuth()
export class AdminLogsController {
    constructor(private readonly adminLogsService: AdminLogsService) {}

    @Get()
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiQuery({ name: 'level', type: 'string', required: false })
    @ApiQuery({ name: 'search', type: 'string', required: false })
    @ApiQuery({ name: 'from', type: 'string', required: false, description: 'ISO date from' })
    @ApiQuery({ name: 'to', type: 'string', required: false, description: 'ISO date to' })
    @ApiResponse({
        status: 200,
        description: 'Logs retrieved successfully',
        type: ApiResponseModel,
    })
    async getLogs(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('level') level?: string,
        @Query('search') search?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ): Promise<ApiResponseModel<AdminLogListDto>> {
        const logs = await this.adminLogsService.listLogs({ page, limit, level, search, from, to });
        return ApiResponseModel.success(logs, 'Logs retrieved successfully');
    }
}

