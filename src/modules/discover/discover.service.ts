import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import User from '../../database/entities/user.entity';
import Subject from '../../database/entities/subject.entity';
import { UserRole } from '../shared/enums';

@Injectable()
export class DiscoverService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Subject) private readonly subjectRepo: Repository<Subject>,
  ) {}

  async search(query: string) {
    const q = (query || '').trim();
    const whereTeacher = q
      ? [
          { role: UserRole.TEACHER, firstName: ILike(`%${q}%`) },
          { role: UserRole.TEACHER, lastName: ILike(`%${q}%`) },
          { role: UserRole.TEACHER, email: ILike(`%${q}%`) },
        ]
      : [{ role: UserRole.TEACHER }];

    const [teachers, subjects] = await Promise.all([
      this.userRepo.find({ where: whereTeacher as any, take: 50,relations: ['availability'] }),
      this.subjectRepo.find({ where: q ? { name: ILike(`%${q}%`) } : {}, take: 50 }),
    ]);

    return [
      ...teachers.map((t) => ({ type: 'teacher', data: { ...t} })),
      ...subjects.map((s) => ({ type: 'subject', data: { id: s.id, name: s.name } })),
    ];
  }
}


