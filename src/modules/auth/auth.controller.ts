import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import User from 'src/database/entities/user.entity';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import RegisterDto from './dto/register.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ApiResponseModel } from '../shared/models/api-response.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: ApiResponseModel,
  })
  @Post('login')
  async login(@Body() login: LoginDto): Promise<ApiResponseModel<User>> {
    const user = await this.authService.login(login);
    return ApiResponseModel.success(user, 'Login successful');
  }

  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 200,
    description: 'Registration successful',
    type: ApiResponseModel,
  })
  @Post('register')
  async register(@Body() user: RegisterDto): Promise<ApiResponseModel<User>> {
    const newUser = await this.authService.register(user);
    return ApiResponseModel.success(newUser, 'Registration successful');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ApiResponseModel,
  })
  @Get('profile')
  async getProfile(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Omit<User, 'password'>>> {
    const profile = await this.authService.getProfile(req.user.id);
    return ApiResponseModel.success(profile, 'Profile retrieved successfully');
  }
}
