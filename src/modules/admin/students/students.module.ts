import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { AdminStudentsService } from './admin-students.service';
import SharedModule from 'src/modules/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [StudentsController],
  providers: [AdminStudentsService]
})
export class StudentsModule {}
