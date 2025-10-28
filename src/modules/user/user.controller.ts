import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ApiResponseModel } from '../shared/models/api-response.model';
import User from '../../database/entities/user.entity';
import UserService from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../shared/enums';

@ApiTags('User')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User created successfully',
    type: ApiResponseModel,
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponseModel<User>> {
    const user = await this.userService.createUser(createUserDto);
    return ApiResponseModel.success(user, 'User created successfully');
  }

  @Get()
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  @ApiQuery({ name: 'isActive', type: 'boolean', required: false })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: ApiResponseModel,
  })
  async getAllUsers(
    @Query('role') role?: UserRole,
    @Query('isActive') isActive?: boolean,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseModel<User[]>> {
    const { items, total } = await this.userService.getAllUsers({ role, isActive, page, limit });
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
    return ApiResponseModel.successWithPagination(items, pagination, 'Users retrieved successfully');
  }

  @Get('profile')
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: ApiResponseModel,
  })
  async getProfile(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Omit<User, 'password'>>> {
    const profile = await this.userService.getUserById(req.user.id);
    return ApiResponseModel.success(profile, 'User profile retrieved successfully');
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: ApiResponseModel,
  })
  async getUserById(
    @Param('id') id: string,
  ): Promise<ApiResponseModel<Omit<User, 'password'>>> {
    const user = await this.userService.getUserById(id);
    return ApiResponseModel.success(user, 'User retrieved successfully');
  }

  @Put(':id')
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: ApiResponseModel,
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Omit<User, 'password'>>> {
    const user = await this.userService.updateUser(id, updateUserDto, req.user.id);
    return ApiResponseModel.success(user, 'User updated successfully');
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: ApiResponseModel,
  })
  async deleteUser(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<void>> {
    await this.userService.deleteUser(id, req.user.id);
    return ApiResponseModel.success(undefined, 'User deleted successfully');
  }

  @Post(':id/activate')
  @ApiResponse({
    status: 200,
    description: 'User activated successfully',
    type: ApiResponseModel,
  })
  async activateUser(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Omit<User, 'password'>>> {
    const user = await this.userService.activateUser(id, req.user.id);
    return ApiResponseModel.success(user, 'User activated successfully');
  }

  @Post(':id/deactivate')
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
    type: ApiResponseModel,
  })
  async deactivateUser(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Omit<User, 'password'>>> {
    const user = await this.userService.deactivateUser(id, req.user.id);
    return ApiResponseModel.success(user, 'User deactivated successfully');
  }
}
