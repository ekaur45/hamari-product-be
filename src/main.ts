import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import multer from 'multer';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { readFileSync } from 'fs';
import { AddressInfo } from 'net';
async function bootstrap() {
  // const httpsOptions = {
  //   key: readFileSync('./src/ssl/server.key'),
  //   cert: readFileSync('./src/ssl/server.crt'),
  // };
  const logger = new Logger('Bootstrap');
  // const app = await NestFactory.create(AppModule);
  //const app = await NestFactory.create<NestExpressApplication>(AppModule, { httpsOptions });
   const app = await NestFactory.create<NestExpressApplication>(AppModule);


  app.enableCors({
    origin: '*', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Enable JSON & URL-encoded body parsing
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  // Enable multipart/form-data parsing
  // app.use(multer({ dest: './uploads' }).any());
  app.setGlobalPrefix('/api');
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Lean API')
    .setDescription('API documentation for Lean project')
    .setVersion('1.0')
    .addBearerAuth() // optional: adds JWT header auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  const { address, port } = (await app.getHttpServer().address()) as AddressInfo;
  logger.log(`Application is running on: ${process.env.NODE_ENV === 'development' ? `http://${address}:${port}` : `https://${address}:${port}`}`);
}
bootstrap().catch((error) => {
  const logger = new Logger('Error');
  logger.error('Error starting application:', error);
  process.exit(1);
});
