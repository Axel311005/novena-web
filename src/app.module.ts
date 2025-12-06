import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { KidModule } from './kid/kid.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { ReportsModule } from './reports/reports.module';
import { StatsModule } from './stats/stats.module';
import { User } from './auth/entities/user.entity';
import { LoginAttempt } from './auth/entities/login-attempt.entity';
import { Kid } from './kid/entities/kid.entity';
import { Asistencia } from './asistencia/entities/asistencia.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => {
        const isProd = process.env.STAGE === 'prod';
        const sslExtra = isProd
          ? { ssl: { rejectUnauthorized: false } }
          : undefined;

        return {
          type: 'postgres',
          host: process.env.DB_HOST,
          port: +(process.env.DB_PORT || 5432),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          entities: [User, LoginAttempt, Kid, Asistencia],
          synchronize: true, // Siempre habilitado
          ssl: isProd,
          extra: {
            ...sslExtra,
            // Configurar zona horaria de Nicaragua en PostgreSQL
            // Esto se ejecutará automáticamente al conectar
            options: '-c timezone=America/Managua',
          },
          logging: process.env.NODE_ENV === 'development', // Logging en desarrollo
        };
      },
    }),
    AuthModule,
    KidModule,
    AsistenciaModule,
    ReportsModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
