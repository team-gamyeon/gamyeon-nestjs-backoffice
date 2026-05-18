import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { loadConsulKvToEnv } from './consul/consul-kv.loader';
import { loadSecretsManagerToEnv } from './secrets/secrets-manager.loader';

async function bootstrap() {
  // Load Consul KV before creating the Nest application so ConfigModule can see merged envs.
  await loadConsulKvToEnv();
  await loadSecretsManagerToEnv();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

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

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('가면 백오피스 API')
    .setDescription('AI 면접 플랫폼 백오피스 관리 API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  app.enableShutdownHooks(); // Consul 서비스 해제(deregister)를 위해 필요

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
