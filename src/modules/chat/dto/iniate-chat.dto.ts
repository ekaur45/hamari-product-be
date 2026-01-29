import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class InitiateChatDto {
    @ApiProperty({ description: 'Receiver ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsNotEmpty({ message: 'Receiver ID is required' })
    @IsUUID(4, { message: 'Receiver ID must be a valid UUID' })
    receiverId: string;

    @ApiProperty({ description: 'Message', example: 'Hello, how are you?' })
    @IsOptional()
    @IsString({ message: 'Message must be a string' })
    message?: string;
}