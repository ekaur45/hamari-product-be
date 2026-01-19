import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import express, { CookieOptions } from 'express';
import User from 'src/database/entities/user.entity';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import RegisterDto from './dto/register.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ApiResponseModel } from '../shared/models/api-response.model';
import { UserRole } from '../shared/enums';
import { ChatGateway } from '../websockets/chat-gateway/chat.gateway';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly chatGateway: ChatGateway) { }

  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: ApiResponseModel,
  })
  @Post('login')
  async login(@Body() login: LoginDto,
    @Res({ passthrough: true })
    res: express.Response): Promise<ApiResponseModel<User>> {
    const user = await this.authService.login(login);

    const cookiesOptions: CookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 1,
    }
    if (process.env.NODE_ENV === 'local') {
      cookiesOptions.secure = true;
      cookiesOptions.domain = '.taleemiyat.com';
    }
    res.cookie('taleemiyat_token', user.access_token, cookiesOptions);
    return ApiResponseModel.success(user, 'Login successful', '/auth/login');
  }


  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 200,
    description: 'Registration successful',
    type: ApiResponseModel,
  })
  @Post('register')
  async register(@Body() user: RegisterDto): Promise<ApiResponseModel<User>> {
    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Admin registration is not allowed.');
    }
    const newUser = await this.authService.register(user);
    return ApiResponseModel.success(newUser, 'Registration successful', '/auth/register');
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



  @Get('test-ws')
  async testWs(): Promise<ApiResponseModel<string>> {
    const to = 'message_2a981d89-90fb-427a-a440-a729fb9b7b78';
    this.chatGateway.server.emit(to, 'Hello, world!');
    return ApiResponseModel.success('WebSocket test successful', 'WebSocket test successful');
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: express.Response): Promise<ApiResponseModel<string>> {
    const cookiesOptions: CookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 1,
    }
    if (process.env.NODE_ENV === 'production') {
      cookiesOptions.secure = true;
      cookiesOptions.domain = '.taleemiyat.com';
    }
    res.clearCookie('taleemiyat_token', cookiesOptions);
    return ApiResponseModel.success('Logout successful', 'Logout successful');
  }
}
