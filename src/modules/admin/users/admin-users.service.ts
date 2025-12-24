import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from 'src/modules/shared/enums';
import AdminUsersListDto from './dto/admin-users-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from 'src/database/entities/user.entity';
import AdminCreateUserDto from './dto/admin-create-user.dto';
import * as bcrypt from 'bcrypt';
import AdminUpdateUserStatusDto from './dto/admin-update-user-status.dto';
import AdminUpdateUserRoleDto from './dto/admin-update-user-role.dto';
import AdminUpdateUserDeletionDto from './dto/admin-update-user-deletion.dto';

@Injectable()
export class AdminUsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

    ) { }

    async getUsers(filters: {
        page: number;
        limit: number;
        search?: string;
        role?: UserRole;
        isActive?: boolean;
    }): Promise<AdminUsersListDto> {

        const query = this.userRepository.createQueryBuilder('user');
        query.where('user.isDeleted = :isDeleted', { isDeleted: false });

        if (filters.search) {
            query.andWhere(
                '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
                { search: `%${filters.search}%` },
            );
        }

        if (filters.role) {
            query.andWhere('user.role = :role', { role: filters.role });
        }

        if (typeof filters.isActive === 'boolean') {
            query.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
        }

        query.orderBy('user.createdAt', 'DESC');
        const [users, total] = await query
            .skip((filters.page - 1) * filters.limit)
            .take(filters.limit)
            .getManyAndCount();
        const result = new AdminUsersListDto();
        result.users = users;
        result.totalUsers = total;
        result.totalTeachers = await this.userRepository.count({ where: { role: UserRole.TEACHER, isDeleted: false } });
        result.totalStudents = await this.userRepository.count({ where: { role: UserRole.STUDENT, isDeleted: false } });
        result.totalParents = await this.userRepository.count({ where: { role: UserRole.PARENT, isDeleted: false } });
        result.totalAcademyOwners = await this.userRepository.count({ where: { role: UserRole.ACADEMY_OWNER, isDeleted: false } });
        result.pagination = {
            page: filters.page,
            limit: filters.limit,
            total: total,
            totalPages: Math.ceil(total / filters.limit),
            hasNext: filters.page < Math.ceil(total / filters.limit),
            hasPrev: filters.page > 1,
        };
        return result;

    }


    async createUser(createUserDto: AdminCreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: [
                { email: createUserDto.email }
            ],
        });
        if (existingUser) {
            throw new BadRequestException('User with this email already exists');
        }
        const hashedPassword = bcrypt.hashSync(createUserDto.password, 10);
        const user = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });
        return await this.userRepository.save(user);
    }

    async updateUserStatus(id: string, payload: AdminUpdateUserStatusDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.isActive = payload.isActive;
        return this.userRepository.save(user);
    }

    async updateUserRole(id: string, payload: AdminUpdateUserRoleDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.role = payload.role;
        return this.userRepository.save(user);
    }

    async updateUserDeletion(id: string, payload: AdminUpdateUserDeletionDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.isDeleted = payload.isDeleted;
        if (payload.isDeleted) {
            user.isActive = false;
        }
        return this.userRepository.save(user);
    }
}
