import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TimeOutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix( process.env.API_VERSION );
  app.useGlobalInterceptors( new TimeOutInterceptor() ); // Manejo de maximo tiempo de espera , 2min
  app.useGlobalPipes( new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      validateCustomDecorators: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    })
  );
  app.enableCors();

  await app.listen( process.env.PORT );
  /** to connect with backend in the same network, "dev mode" http://192.168.100.15:3000/ */
}
bootstrap();
