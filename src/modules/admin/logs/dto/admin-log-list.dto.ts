import { Log } from "src/database/entities/log.entity";
import { Pagination } from "src/modules/shared/models/api-response.model";

export default class AdminLogListDto {
    logs: Log[];
    pagination: Pagination;
    total: number;
}

