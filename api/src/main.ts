import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = configService.get<number>('API_PORT') ?? 4000;

  app.use(cookieParser());

  const rawCorsOrigins =
    configService.get<string>('CORS_ORIGINS') ??
    'http://localhost:3000,http://localhost:8081';

  const corsOrigins = rawCorsOrigins
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const swaggerEnabled =
    (configService.get<string>('SWAGGER_ENABLED') ?? 'true') === 'true';

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('happynachbar API')
      .setDescription('API docs for web + mobile clients')
      .setVersion('0.1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'bearer',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);
}

bootstrap();
