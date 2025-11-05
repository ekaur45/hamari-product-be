import { BadRequestException, Injectable } from '@nestjs/common';
import LoginDto from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import RegisterDto from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../shared/enums';
import { Teacher } from 'src/database/entities/teacher.entity';
import { Student } from 'src/database/entities/student.entity';
import { Parent } from 'src/database/entities/parent.entity';
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

    private readonly jwtService: JwtService,

    private readonly config: ConfigService,
  ) {}
  async login(login: LoginDto) {
    const user = await this.userRepository.findOne({
      where: [{ email: login.username }, { username: login.username }],
      relations: ['details'],
      select: ['id', 'email','password', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt'],
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
    if(registerUser.role === UserRole.TEACHER){
      const teacher = await this.teacherRepository.save({
        userId: user.id,
      });
    }
    if(registerUser.role === UserRole.STUDENT){
      const student = await this.studentRepository.save({
        userId: user.id,
      });
    }
    if(registerUser.role === UserRole.PARENT){
      const parent = await this.parentRepository.save({
        userId: user.id,
      });
    }

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
