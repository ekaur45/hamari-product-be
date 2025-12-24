import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { SupportTicketStatus } from "src/database/entities/support-ticket.entity";

export default class AdminUpdateSupportStatusDto {
    @ApiProperty({ enum: SupportTicketStatus, description: 'Ticket status' })
    @IsEnum(SupportTicketStatus)
    status: SupportTicketStatus;

    @ApiProperty({ description: 'Assignee ID (optional)', required: false })
    @IsOptional()
    @IsString()
    assigneeId?: string;
}

