import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { UserRole } from "src/modules/shared/enums";

export default class AdminCreateUserDto {
    @ApiProperty({
        description: 'User first name',
        example: 'John',
    })
    @IsNotEmpty({ message: 'First name is required' })
    @IsString({ message: 'First name must be a string' })
    @MinLength(2, { message: 'First name must be at least 2 characters' })
    @MaxLength(100, { message: 'First name must not exceed 100 characters' })
    firstName: string;

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
    })
    @IsNotEmpty({ message: 'Last name is required' })
    @IsString({ message: 'Last name must be a string' })
    @MinLength(2, { message: 'Last name must be at least 2 characters' })
    @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
    lastName: string;

    @ApiProperty({
        description: 'User email',
        example: 'john.doe@example.com',
    })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email provided.' })
    email: string;

    @ApiProperty({
        description: 'User password',
        example: 'password123',
    })
    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be a string' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;


    @ApiProperty({
        description: 'User role',
        example: UserRole.ADMIN,
    })
    @IsNotEmpty({ message: 'Role is required' })
    @IsEnum(UserRole, { message: 'Invalid role provided.' })
    role: UserRole;
}
