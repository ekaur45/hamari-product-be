import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { UserRole } from "src/modules/shared/enums";

export default class AdminUpdateUserRoleDto {
    @ApiProperty({ description: 'User role', example: UserRole.TEACHER })
    @IsEnum(UserRole, { message: 'Invalid role provided.' })
    role: UserRole;
}

