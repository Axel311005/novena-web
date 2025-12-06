import { Injectable, Logger } from '@nestjs/common';
import { ReportsDataService } from './services/reports-data.service';
import { PdfReportService } from './services/pdf-report.service';
import { ExcelReportService } from './services/excel-report.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly reportsDataService: ReportsDataService,
    private readonly pdfReportService: PdfReportService,
    private readonly excelReportService: ExcelReportService,
  ) {}

  async generatePdfReport(): Promise<Buffer> {
    try {
      const data = await this.reportsDataService.getReportData();
      return await this.pdfReportService.generateReport(data);
    } catch (error) {
      this.logger.error('Error al generar reporte PDF:', error);
      throw error;
    }
  }

  async generateExcelReport(): Promise<Buffer> {
    try {
      const data = await this.reportsDataService.getReportData();
      return await this.excelReportService.generateReport(data);
    } catch (error) {
      this.logger.error('Error al generar reporte Excel:', error);
      throw error;
    }
  }
}

