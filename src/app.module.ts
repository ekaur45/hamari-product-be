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
import { UsersModule } from './modules/admin/users/users.module';
import { TeachersModule } from './modules/admin/teachers/teachers.module';
import { StudentsModule } from './modules/admin/students/students.module';
import { ProfileModule } from './modules/profile/profile.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { WebsocketsModule } from './modules/websockets/websockets.modules';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`environments/.env.${process.env.NODE_ENV || 'local'}`,`.env`]      
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: 3306,
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        synchronize: false,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        logging: configService.get('DEBUG_DB') === 'true' ? true : false,
        logger: 'advanced-console',
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('JWT_SECRET', 'defaultSecret'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '3600s') },
      }),
    }),
    MulterModule.register({
      dest: './uploads',
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
          cb(null, `${randomName}-${file.originalname}`);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
      },
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
    UsersModule,
    TeachersModule,
    StudentsModule,
    ProfileModule,
    WebsocketsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
