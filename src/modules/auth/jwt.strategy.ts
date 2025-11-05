import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../shared/enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: any) {
    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      username: payload.username as string,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      isActive: payload.isActive as boolean,
      createdAt: payload.createdAt as Date,
      updatedAt: payload.updatedAt as Date
    };
  }
}
