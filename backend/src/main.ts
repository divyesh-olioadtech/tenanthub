import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Secure HTTP headers (B4).
  app.use(helmet());

  // CORS configured per environment (B4): allowed origins come from .env.
  // Development defaults to the Next.js dev server; production must be explicit.
  const isProd = process.env.NODE_ENV === 'production';
  const origins = (process.env.CORS_ORIGINS ?? (isProd ? '' : 'http://localhost:3000'))
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins, credentials: true });

  // Validate every request body against its DTO; reject unknown fields.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  await app.listen(process.env.PORT ?? 4000);
}
await bootstrap();
