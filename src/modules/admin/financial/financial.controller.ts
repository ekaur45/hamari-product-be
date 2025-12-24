import { Body, Controller, Get, Param, Patch, Query, SetMetadata, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/modules/shared/guards/jwt-auth.guard";
import { RoleGuard } from "src/modules/shared/guards/role.guard";
import { UserRole } from "src/modules/shared/enums";
import { ApiResponseModel } from "src/modules/shared/models/api-response.model";
import { AdminFinancialService } from "./financial.service";
import { PayoutStatus } from "src/database/entities/payout.entity";
import { RefundStatus } from "src/database/entities/refund.entity";
import AdminPayoutListDto from "./dto/admin-payout-list.dto";
import AdminRefundListDto from "./dto/admin-refund-list.dto";
import AdminUpdatePayoutStatusDto from "./dto/admin-update-payout-status.dto";
import AdminUpdateRefundStatusDto from "./dto/admin-update-refund-status.dto";
import { AdminActionLoggerInterceptor } from "../../shared/interceptors/admin-action-logger.interceptor";

@ApiTags('Financials')
@Controller('admin/financial')
@UseGuards(JwtAuthGuard, RoleGuard)
@SetMetadata("user_roles", [UserRole.ADMIN])
@ApiBearerAuth()
@UseInterceptors(AdminActionLoggerInterceptor)
export class AdminFinancialController {
    constructor(private readonly adminFinancialService: AdminFinancialService) {}

    @Get('payouts')
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiQuery({ name: 'status', enum: PayoutStatus, required: false })
    @ApiQuery({ name: 'search', type: 'string', required: false })
    @ApiResponse({ status: 200, description: 'Payouts retrieved successfully', type: ApiResponseModel })
    async getPayouts(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('status') status?: PayoutStatus,
        @Query('search') search?: string,
    ): Promise<ApiResponseModel<AdminPayoutListDto>> {
        const payouts = await this.adminFinancialService.listPayouts({ page, limit, status, search });
        return ApiResponseModel.success(payouts, 'Payouts retrieved successfully');
    }

    @Patch('payouts/:id/status')
    @ApiBody({ type: AdminUpdatePayoutStatusDto })
    @ApiResponse({ status: 200, description: 'Payout status updated successfully', type: ApiResponseModel })
    async updatePayoutStatus(
        @Param('id') id: string,
        @Body() payload: AdminUpdatePayoutStatusDto,
    ): Promise<ApiResponseModel> {
        const updated = await this.adminFinancialService.updatePayoutStatus(id, payload);
        return ApiResponseModel.success(updated, 'Payout status updated successfully');
    }

    @Get('refunds')
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiQuery({ name: 'status', enum: RefundStatus, required: false })
    @ApiQuery({ name: 'search', type: 'string', required: false })
    @ApiResponse({ status: 200, description: 'Refunds retrieved successfully', type: ApiResponseModel })
    async getRefunds(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('status') status?: RefundStatus,
        @Query('search') search?: string,
    ): Promise<ApiResponseModel<AdminRefundListDto>> {
        const refunds = await this.adminFinancialService.listRefunds({ page, limit, status, search });
        return ApiResponseModel.success(refunds, 'Refunds retrieved successfully');
    }

    @Patch('refunds/:id/status')
    @ApiBody({ type: AdminUpdateRefundStatusDto })
    @ApiResponse({ status: 200, description: 'Refund status updated successfully', type: ApiResponseModel })
    async updateRefundStatus(
        @Param('id') id: string,
        @Body() payload: AdminUpdateRefundStatusDto,
    ): Promise<ApiResponseModel> {
        const updated = await this.adminFinancialService.updateRefundStatus(id, payload);
        return ApiResponseModel.success(updated, 'Refund status updated successfully');
    }
}

