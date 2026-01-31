import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './config/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;
  const configSwagger = new DocumentBuilder()
    .setTitle('API - Webhook Service')
    .setDescription('This is webhook service API description')
    .setVersion('1.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('swagger', app, documentFactory);

  // Cấu hình Cross-Origin Resource Sharing
  app.enableCors();

  // Cấu hình Validation
  app.useGlobalPipes(
    new ValidationPipe({
      // Loại bỏ các input không cần thiết
      whitelist: true,
      // Loại bỏ các input không hợp lệ
      forbidNonWhitelisted: true,
    }),
  );

  // Cấu hình đọc cookie từ request
  app.use(cookieParser());
  // Cấu hình error handler global
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    console.log(`http://localhost:${port}/swagger`);
  });
}
bootstrap();
