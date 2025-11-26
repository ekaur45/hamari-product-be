import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import ClassEntity from 'src/database/entities/classes.entity';
import User from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
  ) {}

  async getClasses(user: User): Promise<ClassEntity[]> {
    const classes = await this.classRepository.find({ where: { isDeleted: false }, relations: ['teacher', 'teacher.user', 'subject', 'classBookings', 'classBookings.student', 'classBookings.student.user'] });
    return classes;
  }
 
}
