import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ParentChild from '../../database/entities/parent-child.entity';
import User from '../../database/entities/user.entity';
import Performance from '../../database/entities/performance.entity';
import { CreateParentChildDto } from './dto/create-parent-child.dto';
import { UpdateParentChildDto } from './dto/update-parent-child.dto';
import {
  RelationshipStatus,
  UserRole,
} from '../shared/enums';

@Injectable()
export class ParentChildService {
  constructor(
    @InjectRepository(ParentChild)
    private readonly parentChildRepository: Repository<ParentChild>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
  ) {}

  async createParentChild(
    createParentChildDto: CreateParentChildDto,
    parentId: string,
  ): Promise<ParentChild> {
    const parent = await this.userRepository.findOne({
      where: { id: parentId, role: UserRole.PARENT },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    const child = await this.userRepository.findOne({
      where: { id: createParentChildDto.childId, role: UserRole.STUDENT },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // Check if relationship already exists
    const existingRelationship = await this.parentChildRepository.findOne({
      where: {
        parentId,
        childId: createParentChildDto.childId,
        isDeleted: false,
      },
    });

    if (existingRelationship) {
      throw new BadRequestException('Parent-child relationship already exists');
    }

    const parentChild = this.parentChildRepository.create({
      ...createParentChildDto,
      parentId,
      status: RelationshipStatus.ACTIVE,
    });

    return await this.parentChildRepository.save(parentChild);
  }

  async getParentChildren(): Promise<ParentChild[]> {
    return await this.parentChildRepository.find({
      where: { isDeleted: false },
      relations: ['parent', 'child'],
    });
  }

  async getUserChildren(userId: string): Promise<ParentChild[]> {
    return await this.parentChildRepository.find({
      where: { parentId: userId, isDeleted: false },
      relations: ['child'],
    });
  }

  async getUserParents(userId: string): Promise<ParentChild[]> {
    return await this.parentChildRepository.find({
      where: { childId: userId, isDeleted: false },
      relations: ['parent'],
    });
  }

  async getParentChildById(id: string): Promise<ParentChild> {
    const parentChild = await this.parentChildRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['parent', 'child'],
    });

    if (!parentChild) {
      throw new NotFoundException('Parent-child relationship not found');
    }

    return parentChild;
  }

  async updateParentChild(
    id: string,
    updateParentChildDto: UpdateParentChildDto,
    userId: string,
  ): Promise<ParentChild> {
    const parentChild = await this.getParentChildById(id);

    if (parentChild.parentId !== userId) {
      throw new ForbiddenException(
        'You can only update your own parent-child relationships',
      );
    }

    Object.assign(parentChild, updateParentChildDto);
    return await this.parentChildRepository.save(parentChild);
  }

  async deleteParentChild(id: string, userId: string): Promise<void> {
    const parentChild = await this.getParentChildById(id);

    if (parentChild.parentId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own parent-child relationships',
      );
    }

    parentChild.isDeleted = true;
    await this.parentChildRepository.save(parentChild);
  }

  async getChildPerformance(childId: string, parentId: string): Promise<any[]> {
    // Verify parent-child relationship
    const relationship = await this.parentChildRepository.findOne({
      where: { parentId, childId, isDeleted: false },
    });

    if (!relationship) {
      throw new ForbiddenException(
        'You can only view performance of your own children',
      );
    }

    const performances = await this.performanceRepository.find({
      where: { studentId: childId, isDeleted: false },
      relations: ['class', 'class.teacher'],
    });

    return performances.map((performance) => ({
      id: performance.id,
      type: performance.type,
      title: performance.title,
      description: performance.description,
      score: performance.score,
      maxScore: performance.maxScore,
      feedback: performance.feedback,
      date: performance.date,
      class: {
        id: performance.class.id,
        title: performance.class.title,
        teacher: {
          id: performance.class.teacher.id,
          firstName: performance.class.teacher.firstName,
          lastName: performance.class.teacher.lastName,
        },
      },
    }));
  }
}
