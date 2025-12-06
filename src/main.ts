import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';

// Configurar zona horaria de Nicaragua (America/Managua, UTC-6)
process.env.TZ = 'America/Managua';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: false,
  });


  const port = process.env.PORT ?? 3000;
  const isProd = process.env.STAGE === 'prod';
  
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5175',
    `http://localhost:${port}`, // Permitir el mismo servidor (para Swagger)
    // Agregar aquí otros orígenes permitidos en producción
    // 'https://tudominio.com',
  ];


  app.enableCors({
    origin: (origin, callback) => {
      // En desarrollo, permitir todos los localhost
      if (!isProd && origin && origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }

      // Permitir requests sin origin (mobile apps, Postman, etc.) solo en desarrollo
      if (!origin && !isProd) {
        return callback(null, true);
      }

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // 24 horas
  });
  app.use((req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength > maxSize) {
      return res.status(413).json({
        statusCode: 413,
        message: 'El tamaño del payload excede el límite permitido (10MB)',
        error: 'Payload Too Large',
      });
    }

    // Logging de requests grandes
    if (contentLength > 5 * 1024 * 1024) {
      // 5MB
      logger.warn(
        `Request grande detectado: ${(contentLength / 1024 / 1024).toFixed(2)}MB desde ${req.ip}`,
      );
    }

    // Timeout de 30 segundos
    req.setTimeout(30000, () => {
      res.status(408).json({
        statusCode: 408,
        message: 'Request timeout',
        error: 'Request Timeout',
      });
    });

    next();
  });

  // ========== ValidationPipe mejorado ==========
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en DTOs
      forbidNonWhitelisted: true, // Rechaza requests con propiedades extra
      transform: true, // Transforma automáticamente tipos
      transformOptions: {
        enableImplicitConversion: true, // Conversión implícita de tipos
      },
    }),
  );
  
  // Filtros globales de excepciones (comentados hasta que se implementen)
  // app.useGlobalFilters(
  //   new ValidationExceptionFilter(),
  //   new GlobalExceptionFilter(),
  // );


  const config = new DocumentBuilder()
    .setTitle('Novena RESTFul API')
    .setDescription('Novena endpoints')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT',
        in: 'header',
      },
      'JWT-auth', // Este nombre se usará en los decoradores @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Mantiene el token después de refrescar la página
    },
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
