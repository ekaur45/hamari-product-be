import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from '../../database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../shared/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new BadRequestException('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async getAllUsers(filters: {
    role?: UserRole;
    isActive?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ items: User[]; total: number }> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.details', 'details')
      .where('user.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.role) {
      query.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(filters.limit || 10, 100));
    const skip = (page - 1) * limit;

    const [items, total] = await query.skip(skip).take(limit).getManyAndCount();
    return { items, total };
  }

  async getUserById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['details'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUserId: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.getUserById(id);

    // Check if user is updating themselves or is admin
    if (user.id !== currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
      });
      if (currentUser?.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You can only update your own profile');
      }
    }

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(id: string, currentUserId: string): Promise<void> {
    const user = await this.getUserById(id);

    // Check if user is deleting themselves or is admin
    if (user.id !== currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
      });
      if (currentUser?.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You can only delete your own account');
      }
    }

    user.isDeleted = true;
    await this.userRepository.save(user);
  }

  async activateUser(
    id: string,
    currentUserId: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.getUserById(id);

    // Check if current user is admin
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (currentUser?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can activate users');
    }

    user.isActive = true;
    const updatedUser = await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deactivateUser(
    id: string,
    currentUserId: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.getUserById(id);

    // Check if current user is admin
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (currentUser?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can deactivate users');
    }

    user.isActive = false;
    const updatedUser = await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
