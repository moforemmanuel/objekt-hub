import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupGlobalMiddleware } from '@/common/setup/global-middleware.setup';
import { setupVersioning } from '@/common/setup/versioning.setup';
import { setupSwagger } from '@/common/setup/swagger.setup';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 8000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Setup middleware, versioning, and Swagger
  setupGlobalMiddleware(app);
  setupVersioning(app);
  setupSwagger(app);

  await app.listen(port);

  logger.log(`Application running on: http://localhost:${port}`);
  logger.log(`Swagger docs available at: http://localhost:${port}/docs`);
  logger.log(`Environment: ${nodeEnv}`);
}

bootstrap();
