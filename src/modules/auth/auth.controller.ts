import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
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
import { LoginResponseDto } from './dto/login-response.dto';
import { EmailService } from '../shared/email/email.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly chatGateway: ChatGateway,

    private readonly emailService: EmailService,
  ) { }

  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: ApiResponseModel,
  })
  @Post('login')
  async login(@Body() login: LoginDto,
    @Res({ passthrough: true })
    res: express.Response): Promise<ApiResponseModel<LoginResponseDto>> {
    const user = await this.authService.login(login);

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
    return ApiResponseModel.success({...newUser, isProfileComplete: newUser.isProfileComplete}, 'Registration successful', '/auth/register');
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
  ): Promise<ApiResponseModel<User | null>> {
    const profile = await this.authService.getProfile(req.user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
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

  @Get('ping')
  @ApiResponse({
    status: 200,
    description: 'Ping successful'
  })
  async ping(@Request() req: { user: Omit<User, 'password'> }): Promise<ApiResponseModel<Omit<User, 'password'>>> {
    return ApiResponseModel.success(req.user, 'Auth check successful');
  }

  @Get('send-otp')
  async sendOtp(): Promise<ApiResponseModel<any>> {
    const otp = await this.emailService.sendOtpEmail('ekaur45dev@gmail.com', '123456');
    return ApiResponseModel.success(otp, 'OTP sent successfully');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    type: ApiResponseModel,
  })
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Request() req: { user: User }): Promise<ApiResponseModel<any>> {
    const otp = await this.authService.verifyOtp(req.user.id, verifyOtpDto.otp);
    return ApiResponseModel.success(otp, 'OTP verified successfully');
  }
}
