import { Body, Controller, Get, Post, Query, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';  
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AdminUsersService } from './admin-users.service';
import { UserRole } from 'src/modules/shared/enums';
import { RoleGuard } from 'src/modules/shared/guards/role.guard';
import { ApiResponseModel } from 'src/modules/shared/models/api-response.model';
import AdminUsersListDto from './dto/admin-users-list.dto';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import User from 'src/database/entities/user.entity';
import AdminCreateUserDto from './dto/admin-create-user.dto';

@ApiTags('Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseGuards(RoleGuard)
@SetMetadata("user_roles", [UserRole.ADMIN])
export class UsersController {
    constructor(private readonly adminUsersService: AdminUsersService){}

    @Get()
    @ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
        type: ApiResponseModel,
    })
    async getUsers(

        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('role') role?: UserRole,
        @Query('isActive') isActive?: boolean,
    ): Promise<ApiResponseModel<AdminUsersListDto>> {
        const users = await this.adminUsersService.getUsers({ page, limit, search, role, isActive });
        return ApiResponseModel.success(users, 'Users retrieved successfully');
    }


    @Post()
    @ApiBody({ type: AdminCreateUserDto })
    @ApiResponse({
        status: 200,
        description: 'User created successfully',
        type: ApiResponseModel<User>,
    })
    async createUser(@Body() createUserDto: AdminCreateUserDto): Promise<ApiResponseModel<User>> {
        const user = await this.adminUsersService.createUser(createUserDto);
        return ApiResponseModel.success(user, 'User created successfully');
    }
}
