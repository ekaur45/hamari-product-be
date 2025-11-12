import { Module } from '@nestjs/common';
import SharedModule from '../shared/shared.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ChatGateway } from '../websockets/chat-gateway/chat.gateway';

@Module({
  imports: [SharedModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,ChatGateway],
})
export class AuthModule {}
