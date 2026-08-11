import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Project description
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  Logger.error('Error starting server', err);
  process.exit(1);
});
