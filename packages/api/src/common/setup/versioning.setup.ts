import { INestApplication, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function setupVersioning(app: INestApplication) {
  const configService = app.get(ConfigService);
  const apiVersion = configService.get<string>('API_VERSION') || '1';

  app.setGlobalPrefix(`api`);
  app.enableVersioning({
    defaultVersion: apiVersion,
    type: VersioningType.URI,
  });
}
