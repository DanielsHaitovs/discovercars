import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { EntityNotFoundFilter } from './common/entity-not-found.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidUnknownValues: true,
      validateCustomDecorators: true,
    }),
  );

  app.useGlobalFilters(new EntityNotFoundFilter());

  const config = new DocumentBuilder()
    .setTitle('DiscoverCars API')
    .setDescription('API documentation for DiscoverCars backend')
    .setVersion('1.0')
    .addTag('Users', 'User management operations')
    .addTag('Bookings', 'Booking management operations')
    .addTag('Reservation', 'Car reservation operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
