import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import morgan from 'morgan';
import { ResponseTemplateInterceptor } from '../interceptors/response-template.interceptor';
import { GlobalExceptionFilter } from '../filters/http-exception.filter';
import { Reflector } from '@nestjs/core';

export function setupGlobalMiddleware(app: INestApplication) {
  const httpLogger = new Logger('HTTP');
  const configService = app.get(ConfigService);

  // Enable CORS
  const corsOrigins = configService
    .get<string>('CORS_ORIGIN', 'http://localhost:3000')
    .split(',');

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Security middleware
  app.use(helmet());

  // HTTP request logging
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => httpLogger.verbose(message.trim()),
      },
      skip: () => configService.get('NODE_ENV') !== 'development',
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global response interceptor
  app.useGlobalInterceptors(
    new ResponseTemplateInterceptor(app.get(Reflector)),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
}
