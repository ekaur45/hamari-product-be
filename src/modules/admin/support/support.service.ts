import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import SupportTicket, { SupportTicketStatus, SupportTicketPriority } from "src/database/entities/support-ticket.entity";
import { Repository } from "typeorm";
import AdminSupportListDto from "./dto/admin-support-list.dto";
import AdminUpdateSupportStatusDto from "./dto/admin-update-support-status.dto";

@Injectable()
export class AdminSupportService {
    constructor(
        @InjectRepository(SupportTicket)
        private readonly supportRepository: Repository<SupportTicket>,
    ) {}

    async listTickets(filters: {
        page: number;
        limit: number;
        search?: string;
        status?: SupportTicketStatus;
        priority?: SupportTicketPriority;
    }): Promise<AdminSupportListDto> {
        const { page, limit, search, status, priority } = filters;
        const query = this.supportRepository.createQueryBuilder('ticket');
        query.leftJoinAndSelect('ticket.user', 'user');
        query.leftJoinAndSelect('ticket.assignee', 'assignee');
        query.where('ticket.isDeleted = :isDeleted', { isDeleted: false });

        if (search) {
            query.andWhere(
                '(ticket.title LIKE :search OR ticket.description LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
                { search: `%${search}%` },
            );
        }
        if (status) {
            query.andWhere('ticket.status = :status', { status });
        }
        if (priority) {
            query.andWhere('ticket.priority = :priority', { priority });
        }

        query.orderBy('ticket.createdAt', 'DESC');
        query.skip((page - 1) * limit);
        query.take(limit);

        const [tickets, total] = await query.getManyAndCount();
        const dto = new AdminSupportListDto();
        dto.tickets = tickets;
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

    async updateStatus(id: string, payload: AdminUpdateSupportStatusDto): Promise<SupportTicket> {
        const ticket = await this.supportRepository.findOne({ where: { id, isDeleted: false } });
        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }
        ticket.status = payload.status;
        ticket.assigneeId = payload.assigneeId ?? null;
        return this.supportRepository.save(ticket);
    }

    async deleteTicket(id: string): Promise<void> {
        const ticket = await this.supportRepository.findOne({ where: { id, isDeleted: false } });
        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }
        ticket.isDeleted = true;
        await this.supportRepository.save(ticket);
    }
}

