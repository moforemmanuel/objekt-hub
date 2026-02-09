import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const configService = app.get(ConfigService);
  const appName = configService.get<string>('APP_NAME') || 'ObjektHub API';
  const apiVersion = configService.get<string>('API_VERSION') || '1';

  const config = new DocumentBuilder()
    .setTitle(`${appName} Documentation`)
    .setDescription(
      `The ${appName} API documentation - Manage objects with real-time synchronization`,
    )
    .setVersion(apiVersion)
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
    },
  });
}
