import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Log } from "src/database/entities/log.entity";
import { Repository } from "typeorm";
import AdminLogListDto from "./dto/admin-log-list.dto";

@Injectable()
export class AdminLogsService {
    constructor(
        @InjectRepository(Log)
        private readonly logRepository: Repository<Log>,
    ) {}

    async listLogs(filters: { page: number; limit: number; level?: string; search?: string; from?: string; to?: string; }): Promise<AdminLogListDto> {
        const { page, limit, level, search, from, to } = filters;
        const query = this.logRepository.createQueryBuilder('log');

        if (level) {
            query.andWhere('log.level = :level', { level });
        }

        if (search) {
            query.andWhere('(log.message LIKE :search OR log.context LIKE :search)', { search: `%${search}%` });
        }

        if (from) {
            const fromDate = new Date(from);
            if (!isNaN(fromDate.getTime())) {
                query.andWhere('log.timestamp >= :from', { from: fromDate });
            }
        }

        if (to) {
            const toDate = new Date(to);
            if (!isNaN(toDate.getTime())) {
                query.andWhere('log.timestamp <= :to', { to: toDate });
            }
        }

        query.orderBy('log.timestamp', 'DESC');
        query.skip((page - 1) * limit);
        query.take(limit);

        const [logs, total] = await query.getManyAndCount();

        const dto = new AdminLogListDto();
        dto.logs = logs;
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
}

