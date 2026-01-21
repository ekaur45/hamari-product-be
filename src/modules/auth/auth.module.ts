import { Module } from '@nestjs/common';
import SharedModule from '../shared/shared.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ChatGateway } from '../websockets/chat-gateway/chat.gateway';
import { ProfileService } from '../profile/profile.service';

@Module({
  imports: [SharedModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,ChatGateway,ProfileService],
})
export class AuthModule {}
