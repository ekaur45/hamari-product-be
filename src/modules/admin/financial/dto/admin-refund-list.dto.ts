import Refund from "src/database/entities/refund.entity";
import { Pagination } from "src/modules/shared/models/api-response.model";

export default class AdminRefundListDto {
    refunds: Refund[];
    total: number;
    pagination: Pagination;
}

