import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../../database/entities/user.entity';
import Subject from '../../database/entities/subject.entity';
import { DiscoverService } from './discover.service';
import { DiscoverController } from './discover.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Subject])],
  providers: [DiscoverService],
  controllers: [DiscoverController],
})
export class DiscoverModule {}


