import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Project description
  app.setGlobalPrefix('api/v1');

  //set Global Pipes
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

  //Fix CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? 'http://localhost:3000',
    credential: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  //Import Swagger docs
  const config = new DocumentBuilder()
    .setTitle('API Docs')
    .setDescription('API Docs')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication for the application')
    .addTag('users', 'User management')
    .addTag('products', 'Product management')
    .addTag('orders', 'Order management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'jwt-auth',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'refreshtoken-JWT',
        description: 'Enter refresh token',
        in: 'header',
      },
      'refreshtoken-jwt-auth',
    )
    .addServer('http://localhost:3000', 'Local server')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'API Docs',
    customCss:
      '.swagger-ui .topbar { display: none } .swagger-ui .infor {margin:50px 0;} .swagger-ui .infor .title {front-size:20px;}',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  Logger.error('Error starting server', err);
  process.exit(1);
});
