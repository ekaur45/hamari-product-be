import { Injectable } from '@nestjs/common';
import Subject from 'src/database/entities/subject.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Repository } from 'typeorm';


@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async getSubjects({name}: {name: string}): Promise<Subject[]> {
    return await this.subjectRepository.find({
      where: { name: Like(`%${name}%`) },
      order: { name: 'ASC' },
    });
  }
}


