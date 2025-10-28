import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from '../../database/entities/user.entity';
import UserDetail from '../../database/entities/user-details.entity';
import UserEducation, { EducationType } from '../../database/entities/user-education.entity';
import UserAvailability from '../../database/entities/user-availability.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { EducationItem, AvailabilitySlot } from './types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../shared/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserDetail)
    private readonly userDetailRepository: Repository<UserDetail>,
    @InjectRepository(UserEducation)
    private readonly userEducationRepository: Repository<UserEducation>,
    @InjectRepository(UserAvailability)
    private readonly userAvailabilityRepository: Repository<UserAvailability>,
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

  private async getOrCreateDetails(userId: string): Promise<UserDetail> {
    let details = await this.userDetailRepository.findOne({ where: { userId } });
    if (!details) {
      details = this.userDetailRepository.create({ userId });
      details = await this.userDetailRepository.save(details);
    }
    return details;
  }

  async updateDetails(userId: string, dto: Partial<UserDetail>): Promise<UserDetail> {
    const details = await this.getOrCreateDetails(userId);
    Object.assign(details, dto);
    return await this.userDetailRepository.save(details);
  }

  async getEducation(userId: string): Promise<UserEducation[]> {
    return await this.userEducationRepository.find({ where: { userId } });
  }

  async addEducation(userId: string, dto: Omit<UserEducation, 'id' | 'createdAt' | 'updatedAt' | 'user'>): Promise<UserEducation> {
    const item = this.userEducationRepository.create({ ...dto, userId });
    return await this.userEducationRepository.save(item);
  }

  async updateEducation(userId: string, eduId: string, dto: Partial<UserEducation>): Promise<UserEducation> {
    const found = await this.userEducationRepository.findOne({ where: { id: eduId, userId } });
    if (!found) throw new NotFoundException('Education not found');
    Object.assign(found, dto);
    return await this.userEducationRepository.save(found);
  }

  async deleteEducation(userId: string, eduId: string): Promise<void> {
    await this.userEducationRepository.delete({ id: eduId, userId });
  }

  async getAvailability(userId: string): Promise<{ slots: UserAvailability[] }> {
    const slots = await this.userAvailabilityRepository.find({ where: { userId } });
    return { slots };
  }

  async updateAvailability(userId: string, payload: { slots: { dayOfWeek: number; startTime: string; endTime: string; notes?: string }[] }): Promise<{ slots: UserAvailability[] }> {
    // Simple replace strategy
    await this.userAvailabilityRepository.delete({ userId });
    const toSave = payload.slots.map((s) => this.userAvailabilityRepository.create({ userId, ...s }));
    const saved = await this.userAvailabilityRepository.save(toSave);
    return { slots: saved };
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<UserDetail> {
    const details = await this.getOrCreateDetails(userId);
    details.profileImage = avatarUrl;
    return await this.userDetailRepository.save(details);
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
