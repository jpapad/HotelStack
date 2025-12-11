import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const config = app.get(ConfigService);
  const port = Number(config.get<string>('PORT') ?? 3001);

  await app.listen(port, '0.0.0.0');
}

void bootstrap();
