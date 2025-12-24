import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import Review from "src/database/entities/review.entity";
import { UserRole } from "src/modules/shared/enums";
import AdminReviewListDto from "./dto/admin-review-list.dto";
import AdminUpdateReviewVisibilityDto from "./dto/admin-update-review-visibility.dto";
import { Repository } from "typeorm";

@Injectable()
export class AdminReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
    ) {}

    async listReviews(filters: {
        page: number;
        limit: number;
        search?: string;
        reviewerRole?: UserRole;
        revieweeRole?: UserRole;
        isVisible?: boolean;
    }): Promise<AdminReviewListDto> {
        const { page, limit, search, reviewerRole, revieweeRole, isVisible } = filters;
        const query = this.reviewRepository.createQueryBuilder('review');
        query.leftJoinAndSelect('review.reviewer', 'reviewer');
        query.leftJoinAndSelect('review.reviewee', 'reviewee');
        query.where('review.isDeleted = :isDeleted', { isDeleted: false });

        if (search) {
            query.andWhere(
                '(review.comment LIKE :search OR reviewer.firstName LIKE :search OR reviewer.lastName LIKE :search OR reviewee.firstName LIKE :search OR reviewee.lastName LIKE :search)',
                { search: `%${search}%` },
            );
        }
        if (reviewerRole) {
            query.andWhere('review.reviewerRole = :reviewerRole', { reviewerRole });
        }
        if (revieweeRole) {
            query.andWhere('review.revieweeRole = :revieweeRole', { revieweeRole });
        }
        if (typeof isVisible === 'boolean') {
            query.andWhere('review.isVisible = :isVisible', { isVisible });
        }

        query.orderBy('review.createdAt', 'DESC');
        query.skip((page - 1) * limit);
        query.take(limit);

        const [reviews, total] = await query.getManyAndCount();
        const dto = new AdminReviewListDto();
        dto.reviews = reviews;
        dto.total = total;
        dto.pagination = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
        };
        return dto;
    }

    async updateVisibility(id: string, payload: AdminUpdateReviewVisibilityDto): Promise<Review> {
        const review = await this.reviewRepository.findOne({ where: { id, isDeleted: false } });
        if (!review) {
            throw new NotFoundException('Review not found');
        }
        review.isVisible = payload.isVisible;
        return this.reviewRepository.save(review);
    }

    async deleteReview(id: string): Promise<void> {
        const review = await this.reviewRepository.findOne({ where: { id, isDeleted: false } });
        if (!review) {
            throw new NotFoundException('Review not found');
        }
        review.isDeleted = true;
        review.isVisible = false;
        await this.reviewRepository.save(review);
    }
}

