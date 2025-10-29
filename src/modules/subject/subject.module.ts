import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Subject from '../../database/entities/subject.entity';
import Academy from '../../database/entities/academy.entity';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, Academy])],
  providers: [SubjectService],
  controllers: [SubjectController],
  exports: [TypeOrmModule],
})
export class SubjectModule {}


