import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Subject from '../../database/entities/subject.entity';
import Academy from '../../database/entities/academy.entity';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Academy)
    private readonly academyRepository: Repository<Academy>,
  ) {}

  async createSubject(
    payload: { name: string; description?: string; academyId: string },
    userId: string,
  ): Promise<Subject> {
    const academy = await this.academyRepository.findOne({ where: { id: payload.academyId, isDeleted: false } });
    if (!academy) throw new NotFoundException('Academy not found');
    if (academy.ownerId !== userId) throw new ForbiddenException('Only academy owner can add subjects');

    const subject = this.subjectRepository.create({
      name: payload.name,
      description: payload.description,
      academyId: payload.academyId,
    });
    return await this.subjectRepository.save(subject);
  }

  async listSubjects(academyId: string, userId: string): Promise<Subject[]> {
    const academy = await this.academyRepository.findOne({ where: { id: academyId, isDeleted: false } });
    if (!academy) throw new NotFoundException('Academy not found');
    if (academy.ownerId !== userId) throw new ForbiddenException('Only academy owner can view subjects');
    return await this.subjectRepository.find({ where: { academyId, isDeleted: false } });
  }

  async updateSubject(id: string, payload: { name?: string; description?: string }, userId: string): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({ where: { id, isDeleted: false } });
    if (!subject) throw new NotFoundException('Subject not found');
    const academy = await this.academyRepository.findOne({ where: { id: subject.academyId, isDeleted: false } });
    if (!academy) throw new NotFoundException('Academy not found');
    if (academy.ownerId !== userId) throw new ForbiddenException('Only academy owner can update subjects');
    Object.assign(subject, payload);
    return await this.subjectRepository.save(subject);
  }

  async deleteSubject(id: string, userId: string): Promise<void> {
    const subject = await this.subjectRepository.findOne({ where: { id, isDeleted: false } });
    if (!subject) throw new NotFoundException('Subject not found');
    const academy = await this.academyRepository.findOne({ where: { id: subject.academyId, isDeleted: false } });
    if (!academy) throw new NotFoundException('Academy not found');
    if (academy.ownerId !== userId) throw new ForbiddenException('Only academy owner can delete subjects');
    subject.isDeleted = true;
    await this.subjectRepository.save(subject);
  }
}


