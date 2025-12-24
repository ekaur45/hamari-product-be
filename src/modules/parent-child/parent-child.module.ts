import { Module } from '@nestjs/common';
import { ParentChildController } from './parent-child.controller';
import { ParentChildService } from './parent-child.service';
import SharedModule from '../shared/shared.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Parent } from 'src/database/entities/parent.entity';
import { Student } from 'src/database/entities/student.entity';
import ParentChild from 'src/database/entities/parent-child.entity';
import User from 'src/database/entities/user.entity';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Parent, Student, ParentChild, User])],
  controllers: [ParentChildController],
  providers: [ParentChildService],
  exports: [ParentChildService],
})
export class ParentChildModule {}
