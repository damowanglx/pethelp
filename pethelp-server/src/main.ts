import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // Validate required environment variables before startup
  const required = ['JWT_SECRET', 'WECHAT_APPID', 'WECHAT_SECRET'];
  const missing = required.filter((k) => !process.env[k] || process.env[k]!.startsWith('your_'));
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api/v1');

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  app.enableCors({ origin: corsOrigin, credentials: true });

  // Security headers
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // Serve static HTML demo page
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/' });

  // Health check endpoint
  app.getHttpAdapter().get('/health', (_req: unknown, res: { json: (v: Record<string, unknown>) => void }) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor(), new LoggingInterceptor());

  await app.listen(process.env.PORT ?? 3000);
  console.log(`PetHelp running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
