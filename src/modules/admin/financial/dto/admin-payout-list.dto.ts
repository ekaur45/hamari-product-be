import Payout from "src/database/entities/payout.entity";
import { Pagination } from "src/modules/shared/models/api-response.model";

export default class AdminPayoutListDto {
    payouts: Payout[];
    total: number;
    pagination: Pagination;
}

