import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Kid } from '../kid/entities/kid.entity';
import { Asistencia } from '../asistencia/entities/asistencia.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [StatsController],
  providers: [StatsService],
  imports: [
    TypeOrmModule.forFeature([Kid, Asistencia]),
    AuthModule,
  ],
  exports: [StatsService],
})
export class StatsModule {}

