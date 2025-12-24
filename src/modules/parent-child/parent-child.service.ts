import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from 'src/database/entities/user.entity';
import { Parent } from 'src/database/entities/parent.entity';
import { Student } from 'src/database/entities/student.entity';
import ParentChild from 'src/database/entities/parent-child.entity';
import { UserRole } from '../shared/enums';

@Injectable()
export class ParentChildService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(ParentChild)
    private readonly parentChildRepository: Repository<ParentChild>,
  ) { }

  async addChildByEmail(parentUser: User, childEmail: string) {
    if (parentUser.role !== UserRole.PARENT) {
      throw new ForbiddenException('Only parents can add children');
    }

    const childUser = await this.userRepository.findOne({
      where: { email: childEmail, role: UserRole.STUDENT },
      relations: ['student'],
    });

    if (!childUser) {
      throw new NotFoundException('Student with this email not found');
    }

    if (!childUser.student) {
      throw new NotFoundException('Student profile not found for this user');
    }

    let parent = await this.parentRepository.findOne({
      where: { userId: parentUser.id },
    });

    if (!parent) {
      parent = this.parentRepository.create({ userId: parentUser.id });
      await this.parentRepository.save(parent);
    }

    const existingLink = await this.parentChildRepository.findOne({
      where: { parentId: parent.id, childId: childUser.student.id },
    });

    if (existingLink) {
      throw new BadRequestException('This student is already linked to your account');
    }

    const link = this.parentChildRepository.create({
      parentId: parent.id,
      childId: childUser.student.id,
    });

    await this.parentChildRepository.save(link);
    return { message: 'Child added successfully' };
  }

  async getChildren(parentUser: User) {
    if (parentUser.role !== UserRole.PARENT) {
      throw new ForbiddenException('Only parents can view children');
    }

    const parent = await this.parentRepository.findOne({
      where: { userId: parentUser.id },
    });

    if (!parent) {
      return [];
    }

    const links = await this.parentChildRepository.find({
      where: { parentId: parent.id, isDeleted: false },
      relations: ['child', 'child.user', 'child.user.details'],
    });

    return links.map(link => ({
      id: link.child.id,
      firstName: link.child.user.firstName,
      lastName: link.child.user.lastName,
      email: link.child.user.email,
      profileImage: link.child.user.details?.profileImage,
    }));
  }
}
