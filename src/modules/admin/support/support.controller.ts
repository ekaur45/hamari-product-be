import { Body, Controller, Delete, Get, Param, Patch, Query, SetMetadata, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/modules/shared/guards/jwt-auth.guard";
import { RoleGuard } from "src/modules/shared/guards/role.guard";
import { UserRole } from "src/modules/shared/enums";
import { ApiResponseModel } from "src/modules/shared/models/api-response.model";
import { AdminSupportService } from "./support.service";
import { SupportTicketStatus, SupportTicketPriority } from "src/database/entities/support-ticket.entity";
import AdminSupportListDto from "./dto/admin-support-list.dto";
import AdminUpdateSupportStatusDto from "./dto/admin-update-support-status.dto";
import { AdminActionLoggerInterceptor } from "../../shared/interceptors/admin-action-logger.interceptor";

@ApiTags('Support')
@Controller('admin/support')
@UseGuards(JwtAuthGuard, RoleGuard)
@SetMetadata("user_roles", [UserRole.ADMIN])
@ApiBearerAuth()
@UseInterceptors(AdminActionLoggerInterceptor)
export class AdminSupportController {
    constructor(private readonly adminSupportService: AdminSupportService) {}

    @Get()
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiQuery({ name: 'search', type: 'string', required: false })
    @ApiQuery({ name: 'status', enum: SupportTicketStatus, required: false })
    @ApiQuery({ name: 'priority', enum: SupportTicketPriority, required: false })
    @ApiResponse({
        status: 200,
        description: 'Tickets retrieved successfully',
        type: ApiResponseModel,
    })
    async getTickets(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('status') status?: SupportTicketStatus,
        @Query('priority') priority?: SupportTicketPriority,
    ): Promise<ApiResponseModel<AdminSupportListDto>> {
        const tickets = await this.adminSupportService.listTickets({ page, limit, search, status, priority });
        return ApiResponseModel.success(tickets, 'Tickets retrieved successfully');
    }

    @Patch(':id/status')
    @ApiBody({ type: AdminUpdateSupportStatusDto })
    @ApiResponse({
        status: 200,
        description: 'Ticket status updated successfully',
        type: ApiResponseModel,
    })
    async updateStatus(
        @Param('id') id: string,
        @Body() payload: AdminUpdateSupportStatusDto,
    ): Promise<ApiResponseModel> {
        const updated = await this.adminSupportService.updateStatus(id, payload);
        return ApiResponseModel.success(updated, 'Ticket status updated successfully');
    }

    @Delete(':id')
    @ApiResponse({
        status: 200,
        description: 'Ticket deleted successfully',
        type: ApiResponseModel,
    })
    async deleteTicket(
        @Param('id') id: string,
    ): Promise<ApiResponseModel<void>> {
        await this.adminSupportService.deleteTicket(id);
        return ApiResponseModel.success(undefined, 'Ticket deleted successfully');
    }
}

