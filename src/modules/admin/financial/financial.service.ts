import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import Payout, { PayoutStatus } from "src/database/entities/payout.entity";
import Refund, { RefundStatus } from "src/database/entities/refund.entity";
import { Repository } from "typeorm";
import AdminPayoutListDto from "./dto/admin-payout-list.dto";
import AdminRefundListDto from "./dto/admin-refund-list.dto";
import AdminUpdatePayoutStatusDto from "./dto/admin-update-payout-status.dto";
import AdminUpdateRefundStatusDto from "./dto/admin-update-refund-status.dto";

@Injectable()
export class AdminFinancialService {
    constructor(
        @InjectRepository(Payout)
        private readonly payoutRepository: Repository<Payout>,
        @InjectRepository(Refund)
        private readonly refundRepository: Repository<Refund>,
    ) {}

    async listPayouts(filters: { page: number; limit: number; status?: PayoutStatus; search?: string; }): Promise<AdminPayoutListDto> {
        const { page, limit, status, search } = filters;
        const query = this.payoutRepository.createQueryBuilder('payout');
        query.leftJoinAndSelect('payout.teacher', 'teacher');
        query.leftJoinAndSelect('teacher.user', 'user');
        query.where('payout.isDeleted = :isDeleted', { isDeleted: false });

        if (status) {
            query.andWhere('payout.status = :status', { status });
        }
        if (search) {
            query.andWhere('(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)', { search: `%${search}%` });
        }

        query.orderBy('payout.createdAt', 'DESC');
        query.skip((page - 1) * limit);
        query.take(limit);

        const [payouts, total] = await query.getManyAndCount();
        const dto = new AdminPayoutListDto();
        dto.payouts = payouts;
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

    async updatePayoutStatus(id: string, payload: AdminUpdatePayoutStatusDto): Promise<Payout> {
        const payout = await this.payoutRepository.findOne({ where: { id, isDeleted: false } });
        if (!payout) {
            throw new NotFoundException('Payout not found');
        }
        payout.status = payload.status;
        payout.failureReason = payload.failureReason ?? null;
        if (payload.status === PayoutStatus.PAID) {
            payout.processedAt = new Date();
        }
        return this.payoutRepository.save(payout);
    }

    async listRefunds(filters: { page: number; limit: number; status?: RefundStatus; search?: string; }): Promise<AdminRefundListDto> {
        const { page, limit, status, search } = filters;
        const query = this.refundRepository.createQueryBuilder('refund');
        query.leftJoinAndSelect('refund.user', 'user');
        query.leftJoinAndSelect('refund.classBooking', 'classBooking');
        query.leftJoinAndSelect('refund.teacherBooking', 'teacherBooking');
        query.where('refund.isDeleted = :isDeleted', { isDeleted: false });

        if (status) {
            query.andWhere('refund.status = :status', { status });
        }
        if (search) {
            query.andWhere('(refund.reason LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)', { search: `%${search}%` });
        }

        query.orderBy('refund.createdAt', 'DESC');
        query.skip((page - 1) * limit);
        query.take(limit);

        const [refunds, total] = await query.getManyAndCount();
        const dto = new AdminRefundListDto();
        dto.refunds = refunds;
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

    async updateRefundStatus(id: string, payload: AdminUpdateRefundStatusDto): Promise<Refund> {
        const refund = await this.refundRepository.findOne({ where: { id, isDeleted: false } });
        if (!refund) {
            throw new NotFoundException('Refund not found');
        }
        refund.status = payload.status;
        if (payload.reason) {
            refund.reason = payload.reason;
        }
        return this.refundRepository.save(refund);
    }
}

