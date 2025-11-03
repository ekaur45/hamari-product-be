import { BadRequestException, Injectable } from '@nestjs/common';
import LoginDto from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import RegisterDto from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,

    private readonly config: ConfigService,
  ) {}
  async login(login: LoginDto) {
    const user = await this.userRepository.findOne({
      where: [{ email: login.username }, { username: login.username }],
      relations: ['details'],
    });
    if (!(user && bcrypt.compareSync(login.password, user.password)))
      throw new BadRequestException('Username or password is not correct.');

    const { password: _, ...rest } = user;
    const access_token = this.jwtService.sign(rest,{
      secret: this.config.get('JWT_SECRET')
    });

    return {
      ...user,
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

    user = await this.userRepository.save(registerUser);
    const { password: _, ...rest } = user;
    const access_token = this.jwtService.sign(rest,{
      secret: this.config.get('JWT_SECRET')
    });

    return {
      ...user,
      access_token,
    };
  }

  async getProfile(userId: string) {
    const result = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    const { password: _, ...rest } = result;
    return rest;
  }
}
