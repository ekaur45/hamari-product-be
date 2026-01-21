import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { GlobalExceptionFilter } from './filters/global-exception/global-exception.filter';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import multer from 'multer';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { readFileSync } from 'fs';
import { AddressInfo } from 'net';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './modules/logger/logger.service';
import { AppDataSource } from './database/data-source';
import seedNationalities from './database/seeds/nationality.seed';
import cookieParser from 'cookie-parser';
import express from 'express';
import { PUBLIC_API_PAYMENT_BASE } from './utils/api.constants';
import bodyParser from 'body-parser';

async function bootstrap() {
  // const httpsOptions = {
  //   key: readFileSync('./src/ssl/server.key'),
  //   cert: readFileSync('./src/ssl/server.crt'),
  // };

  // const app = await NestFactory.create(AppModule);
  //const app = await NestFactory.create<NestExpressApplication>(AppModule, { httpsOptions });
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const logger = await app.resolve(LoggerService);
  logger.setContext('Bootstrap');

  // Use custom logger
  app.useLogger(logger);
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:4200', 'http://localhost:3000'];
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true); // allow this origin
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Stripe-Signature,X-Currency',
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const stripeWebhookPath = `/${PUBLIC_API_PAYMENT_BASE}/stripe/webhook`;

  // Stripe raw body middleware
  app.use(stripeWebhookPath, express.raw({ type: 'application/json' }));
  // ✅ Enable JSON & URL-encoded body parsing
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  app.setGlobalPrefix('/api', {
    exclude: ['/public/*'],
  });
  app.use((req, res, next) => {
    if (req.originalUrl === stripeWebhookPath) {
      bodyParser.raw({ type: 'application/json' })(req, res, next);
    } else {
      json({ limit: '10mb' })(req, res, next);
    }
  });
  // Get logger instance for exception filter
  const exceptionLogger = await app.resolve(LoggerService);
  app.useGlobalFilters(new GlobalExceptionFilter(exceptionLogger));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Taleemiyat API')
    .setDescription('API documentation for Taleemiyat project')
    .setVersion('1.0')
    .addBearerAuth() // optional: adds JWT header auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  const { address, port } = (await app.getHttpServer().address()) as AddressInfo;

  const serverUrl = (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local')
    ? `http://${address}:${port}`
    : `https://${address}:${port}`;

  logger.log(`Application is running on: ${serverUrl}`);
  logger.log(`Swagger documentation available at: ${serverUrl}/api-docs`);

}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
