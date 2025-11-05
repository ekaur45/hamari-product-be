import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AdminUsersService } from './admin-users.service';
import SharedModule from 'src/modules/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [UsersController],
  providers: [ AdminUsersService],
})
export class UsersModule {}
