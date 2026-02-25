import { Body, Controller, Post, Req, Request, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../shared/guards/jwt-auth.guard";
import AddReviewDto from "./dto/add-review.dto";
import ReviewsService from "./reviews.service";
import User from "src/database/entities/user.entity";
import { ApiResponseModel } from "../shared/models/api-response.model";

@Controller('reviews')
@ApiTags('Reviews')
@UseGuards(JwtAuthGuard)
export default class ReviewsController {
    constructor(
        private reviewService: ReviewsService
    ) {

    }

    @Post()
    async addReview(
        @Body() body: AddReviewDto,
        @Request() req: { user: User }
    ) {
        const result = await this.reviewService.addReview(body,req.user);
        return ApiResponseModel.success(null,"Review added successfuly.");
    }
}