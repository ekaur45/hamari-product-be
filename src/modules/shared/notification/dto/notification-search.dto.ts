import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { NotificationType } from "../../enums";
import { Transform } from "class-transformer";

export class NotificationSearchDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Transform(({ value }) => Number(value))
    page: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(500)
    @Transform(({ value }) => Number(value))
    limit: number;

    @IsOptional()
    @IsArray()
    @IsEnum(NotificationType, { each: true })
    types?: NotificationType[];

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim() ?? '')
    search?: string;

    @IsOptional()
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return undefined;
      })
    isRead?: boolean | undefined;
}