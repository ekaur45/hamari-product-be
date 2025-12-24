import Review from 'src/database/entities/review.entity';
import { Pagination } from '../../shared/models/api-response.model';

export default class TeacherReviewsListDto {
  reviews: Review[];
  pagination: Pagination;
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { rating: number; count: number }[];
  };
}

