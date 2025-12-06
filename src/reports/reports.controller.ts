import {
  Controller,
  Get,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@ApiTags('Reportes')
@Controller('reports')
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('pdf')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Generar reporte en formato PDF' })
  @ApiResponse({
    status: 200,
    description: 'Reporte PDF generado exitosamente',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="reporte-asistencias.pdf"')
  async generatePdf(@Res() res: Response) {
    try {
      const buffer = await this.reportsService.generatePdfReport();
      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: 'Error al generar el reporte PDF',
      });
    }
  }

  @Get('excel')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Generar reporte en formato Excel' })
  @ApiResponse({
    status: 200,
    description: 'Reporte Excel generado exitosamente',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="reporte-asistencias.xlsx"')
  async generateExcel(@Res() res: Response) {
    try {
      const buffer = await this.reportsService.generateExcelReport();
      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: 'Error al generar el reporte Excel',
      });
    }
  }
}

