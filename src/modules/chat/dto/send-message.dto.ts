import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class SendMessageDto {
    @ApiProperty({ description: 'Conversation ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsNotEmpty({ message: 'Conversation ID is required' })
    @IsUUID(4, { message: 'Conversation ID must be a valid UUID' })
    conversationId: string;

    @ApiProperty({ description: 'Message', example: 'Hello, how are you?' })
    @IsNotEmpty({ message: 'Message is required' })
    @IsString({ message: 'Message must be a string' })
    message: string;

    @IsOptional()
    @IsArray({ message: 'Resources must be an array' })    
    resources: string[];

    @ApiProperty({ description: 'Receiver ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsNotEmpty({ message: 'Receiver ID is required' })
    @IsUUID(4, { message: 'Receiver ID must be a valid UUID' })
    receiverId: string;
}