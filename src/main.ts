import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:8081'], // web and mobile
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    //preflightContinue: false,
    //optionsSuccessStatus: 204,
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Health Pal')
    .setDescription('The Health Pal API description')
    .setVersion('1.0')
    .addTag('health-pal')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
