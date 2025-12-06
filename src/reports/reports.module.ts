import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsDataService } from './services/reports-data.service';
import { PdfReportService } from './services/pdf-report.service';
import { ExcelReportService } from './services/excel-report.service';
import { Kid } from '../kid/entities/kid.entity';
import { Asistencia } from '../asistencia/entities/asistencia.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportsDataService,
    PdfReportService,
    ExcelReportService,
  ],
  imports: [
    TypeOrmModule.forFeature([Kid, Asistencia]),
    AuthModule,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}

