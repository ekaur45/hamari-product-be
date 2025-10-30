import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import UserModule from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AcademyModule } from './modules/academy/academy.module';
import { ClassModule } from './modules/class/class.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { ParentChildModule } from './modules/parent-child/parent-child.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { StudentModule } from './modules/student/student.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { SubjectModule } from './modules/subject/subject.module';
import { DiscoverModule } from './modules/discover/discover.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `environments/.env.${process.env.NODE_ENV || 'local'}`,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      synchronize: false,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('JWT_SECRET', 'defaultSecret'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '3600s') },
      }),
    }),
    UserModule,
    AuthModule,
    AcademyModule,
    ClassModule,
    PaymentModule,
    PerformanceModule,
    EnrollmentModule,
    ParentChildModule,
    InvitationModule,
    StudentModule,
    TeacherModule,
    SubjectModule,
    DiscoverModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
