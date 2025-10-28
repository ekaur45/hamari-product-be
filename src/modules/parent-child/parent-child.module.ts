import { Module } from '@nestjs/common';
import { ParentChildController } from './parent-child.controller';
import { ParentChildService } from './parent-child.service';
import SharedModule from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [ParentChildController],
  providers: [ParentChildService],
  exports: [ParentChildService],
})
export class ParentChildModule {}
