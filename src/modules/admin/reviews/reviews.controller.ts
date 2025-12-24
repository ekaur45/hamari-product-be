import { Body, Controller, Delete, Get, Param, Patch, Query, SetMetadata, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserRole } from "src/modules/shared/enums";
import { JwtAuthGuard } from "src/modules/shared/guards/jwt-auth.guard";
import { RoleGuard } from "src/modules/shared/guards/role.guard";
import { ApiResponseModel } from "src/modules/shared/models/api-response.model";
import AdminReviewListDto from "./dto/admin-review-list.dto";
import { AdminReviewsService } from "./admin-reviews.service";
import AdminUpdateReviewVisibilityDto from "./dto/admin-update-review-visibility.dto";
import Review from "src/database/entities/review.entity";
import { AdminActionLoggerInterceptor } from "../../shared/interceptors/admin-action-logger.interceptor";

@ApiTags('Reviews')
@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RoleGuard)
@SetMetadata("user_roles", [UserRole.ADMIN])
@ApiBearerAuth()
@UseInterceptors(AdminActionLoggerInterceptor)
export class AdminReviewsController {
    constructor(private readonly adminReviewsService: AdminReviewsService) {}

    @Get()
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiQuery({ name: 'search', type: 'string', required: false })
    @ApiQuery({ name: 'reviewerRole', enum: UserRole, required: false })
    @ApiQuery({ name: 'revieweeRole', enum: UserRole, required: false })
    @ApiQuery({ name: 'isVisible', type: 'boolean', required: false })
    @ApiResponse({
        status: 200,
        description: 'Reviews retrieved successfully',
        type: ApiResponseModel,
    })
    async getReviews(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('reviewerRole') reviewerRole?: UserRole,
        @Query('revieweeRole') revieweeRole?: UserRole,
        @Query('isVisible') isVisible?: boolean,
    ): Promise<ApiResponseModel<AdminReviewListDto>> {
        const reviews = await this.adminReviewsService.listReviews({ page, limit, search, reviewerRole, revieweeRole, isVisible });
        return ApiResponseModel.success(reviews, 'Reviews retrieved successfully');
    }

    @Patch(':id/visibility')
    @ApiBody({ type: AdminUpdateReviewVisibilityDto })
    @ApiResponse({
        status: 200,
        description: 'Review visibility updated successfully',
        type: ApiResponseModel,
    })
    async updateVisibility(
        @Param('id') id: string,
        @Body() payload: AdminUpdateReviewVisibilityDto,
    ): Promise<ApiResponseModel<Review>> {
        const review = await this.adminReviewsService.updateVisibility(id, payload);
        return ApiResponseModel.success(review, 'Review visibility updated successfully');
    }

    @Delete(':id')
    @ApiResponse({
        status: 200,
        description: 'Review deleted successfully',
        type: ApiResponseModel,
    })
    async deleteReview(
        @Param('id') id: string,
    ): Promise<ApiResponseModel<void>> {
        await this.adminReviewsService.deleteReview(id);
        return ApiResponseModel.success(undefined, 'Review deleted successfully');
    }
}

