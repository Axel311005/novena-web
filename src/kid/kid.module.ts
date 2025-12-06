import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KidService } from './kid.service';
import { KidController } from './kid.controller';
import { Kid } from './entities/kid.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [KidController],
  providers: [KidService],
  imports: [TypeOrmModule.forFeature([Kid]), AuthModule],
  exports: [KidService, TypeOrmModule],
})
export class KidModule {}

