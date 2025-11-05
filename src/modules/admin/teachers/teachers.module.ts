import { Module } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { AdminTeachersService } from './admin-teachers.service';
import SharedModule from 'src/modules/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [TeachersController],
  providers: [AdminTeachersService],
  exports: [AdminTeachersService]
})
export class TeachersModule {}
