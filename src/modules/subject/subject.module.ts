import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Subject from '../../database/entities/subject.entity';
import Academy from '../../database/entities/academy.entity';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';
import SharedModule from '../shared/shared.module';

@Module({
  imports: [ SharedModule],
  providers: [SubjectService],
  controllers: [SubjectController],
  exports: [SubjectService],
})
export class SubjectModule {}


