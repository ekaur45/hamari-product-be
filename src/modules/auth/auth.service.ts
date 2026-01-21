import { BadRequestException, Injectable } from '@nestjs/common';
import LoginDto from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/database/entities/user.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import RegisterDto from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { OtpType, UserRole } from '../shared/enums';
import { Teacher } from 'src/database/entities/teacher.entity';
import { Student } from 'src/database/entities/student.entity';
import { Parent } from 'src/database/entities/parent.entity';
import UserDetail from 'src/database/entities/user-details.entity';
import { ProfileService } from '../profile/profile.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { generateOtp } from 'src/utils/misc.utils';
import Otp from 'src/database/entities/otp.entity';
import { EmailService } from '../shared/email/email.service';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(UserDetail)
    private readonly userDetailRepository: Repository<UserDetail>,

    private readonly jwtService: JwtService,

    private readonly config: ConfigService,
    private readonly ProfileService: ProfileService,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly emailService: EmailService,
  ) { }
  async login(login: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne({
      where: [{ email: login.username }, { username: login.username }],
      select: ['password', 'id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
    });
    if (!(user && bcrypt.compareSync(login.password, user.password)))
      throw new BadRequestException('Username or password is not correct.');

    const { password: _, ...rest } = user;
    const tokenPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
    const access_token = this.jwtService.sign(tokenPayload, {
      secret: this.config.get('JWT_SECRET')
    });
    const profile = await this.ProfileService.getProfile(user);
    const otp = await this.otpRepository.save({
      userId: user.id,
      otp: generateOtp(),
      type: OtpType.REGISTER,
      expiresAt: (new Date(Date.now() + 10 * 60 * 1000)),
    });
    this.emailService.sendLoginEmailOtp(user, otp.otp);
    return {
      ...user,
      ...profile,
      isProfileComplete: user.isProfileComplete,
      access_token,
    };
  }

  async register(registerUser: RegisterDto) {
    let user = await this.userRepository.findOne({
      where: [{ email: registerUser.email }],
      relations: ['details'],
    });
    if (user) throw new BadRequestException('User with this email already exists.');

    registerUser.password = bcrypt.hashSync(registerUser.password, 10);

    user = await this.userRepository.save({ ...registerUser });
    const { password: _, ...rest } = user;
    const access_token = this.jwtService.sign(rest, {
      secret: this.config.get('JWT_SECRET')
    });
    if (registerUser.role === UserRole.TEACHER) {
      const teacher = await this.teacherRepository.save({
        userId: user.id,
      });
    }
    if (registerUser.role === UserRole.STUDENT) {
      const student = await this.studentRepository.save({
        userId: user.id,
      });
    }
    if (registerUser.role === UserRole.PARENT) {
      const parent = await this.parentRepository.save({
        userId: user.id,
      });
    }
    if (registerUser.phone) {
      const userDetail = await this.userDetailRepository.save({
        userId: user.id,
        phone: registerUser.phone,
      });
    }
    const otp = await this.otpRepository.save({
      userId: user.id,
      otp: generateOtp(),
      type: OtpType.REGISTER,
      expiresAt: (new Date(Date.now() + 10 * 60 * 1000)),
    });
    this.emailService.sendRegisterEmailOtp(user, otp.otp);
    return {
      ...user,
      isProfileComplete: user.isProfileComplete,
      access_token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });
    if (!user) throw new BadRequestException('User not found');
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.details', 'details', 'user.id = details.userId')
      .leftJoinAndSelect('user.educations', 'educations');

    if (user.role === UserRole.STUDENT) {
      query.leftJoinAndSelect('user.student', 'student');
    }

    if (user.role === UserRole.TEACHER) {
      query
        .leftJoinAndSelect('user.teacher', 'teacher')
        .leftJoinAndSelect(
          'teacher.teacherSubjects',
          'teacherSubjects',
          'teacherSubjects.isDeleted = false'
        )
        .leftJoinAndSelect('teacherSubjects.subject', 'subject')
        .leftJoinAndSelect('teacher.availabilities', 'availabilities', 'availabilities.isDeleted = false');
    }

    if (user.role === UserRole.PARENT) {
      query.leftJoinAndSelect('user.parent', 'parent');
    }

    if (user.role === UserRole.ACADEMY_OWNER) {
      query.leftJoinAndSelect('user.academy', 'academy');
    }

    const userData = await query
      .where('user.id = :id', { id: user.id })
      .getOne();

    return userData;
  }
  async verifyOtp(userId: string, providedOtp: string) {
    const otp = await this.otpRepository.findOne({
      where: {
        userId: userId,
        otp: providedOtp,
        type: OtpType.REGISTER,
        isUsed: false,
        isDeleted: false,
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!otp) throw new BadRequestException('Invalid OTP or OTP has expired');
    otp.isUsed = true;
    otp.updatedAt = new Date();
    await this.otpRepository.save(otp);
    await this.userRepository.update(userId, { isEmailVerified: true });
    const _user = await this.getProfile(userId);
    const tokenPayload = {
      id: _user!.id,
      email: _user!.email,
      firstName: _user!.firstName,
      lastName: _user!.lastName,
      role: _user!.role,
      isActive: _user!.isActive,
      createdAt: _user!.createdAt,
    };
    const access_token = this.jwtService.sign(tokenPayload, {
      secret: this.config.get('JWT_SECRET')
    });
    return {
      ..._user,
      isProfileComplete: _user!.isProfileComplete,
      access_token,
    };
  }
}
