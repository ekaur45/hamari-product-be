import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRole } from 'src/modules/shared/enums';
import UserService from 'src/modules/user/user.service';
import AdminUsersListDto from './dto/admin-users-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import User from 'src/database/entities/user.entity';
import AdminCreateUserDto from './dto/admin-create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUsersService {
    constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    ) {}

    async getUsers(filters: {
        page: number;
        limit: number;
        search?: string;
        role?: UserRole;
        isActive?: boolean;
    }): Promise<AdminUsersListDto> {
        
        const query = this.userRepository.createQueryBuilder('users');

        // if (filters.search) {
        //     query.andWhere('user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search', { search: `%${filters.search}%` });
        // }

        // if (filters.role) {
        //     query.andWhere('user.role = :role', { role: filters.role });
        // }
        
        // if (filters.isActive) {
        //     query.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
        // }

        query.orderBy('users.createdAt', 'DESC');
        const [users, total] = await query.skip((filters.page -1) * filters.limit).take(filters.limit).getManyAndCount();
        const result = new AdminUsersListDto();
        result.users = users;
        result.totalUsers = total;
        result.totalTeachers = users.filter(user => user.role === UserRole.TEACHER).length;
        result.totalStudents = users.filter(user => user.role === UserRole.STUDENT).length;
        result.totalParents = users.filter(user => user.role === UserRole.PARENT).length;
        result.totalAcademyOwners = users.filter(user => user.role === UserRole.ACADEMY_OWNER).length;
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
}
