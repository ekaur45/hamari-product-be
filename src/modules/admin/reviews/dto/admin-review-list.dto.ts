import Review from "src/database/entities/review.entity";
import { Pagination } from "src/modules/shared/models/api-response.model";

export default class AdminReviewListDto {
    reviews: Review[];
    total: number;
    pagination: Pagination;
}

