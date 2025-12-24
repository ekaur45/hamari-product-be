import SupportTicket from "src/database/entities/support-ticket.entity";
import { Pagination } from "src/modules/shared/models/api-response.model";

export default class AdminSupportListDto {
    tickets: SupportTicket[];
    total: number;
    pagination: Pagination;
}

