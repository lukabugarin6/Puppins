import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger konfiguracija
  const config = new DocumentBuilder()
    .setTitle('Puppins API')
    .setDescription('API dokumentacija za Puppins aplikaciju')
    .setVersion('1.0')
    // .addTag('Puppins')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
