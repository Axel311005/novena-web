import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ReportData } from '../interfaces/report-data.interface';

@Injectable()
export class ExcelReportService {
  private readonly logger = new Logger(ExcelReportService.name);

  async generateReport(data: ReportData): Promise<Buffer> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte de Asistencias');

      // Configurar columnas
      this.setupColumns(worksheet);

      // Agregar encabezado
      this.addHeader(worksheet, data);

      // Agregar datos
      this.addData(worksheet, data);

      // Aplicar estilos
      this.applyStyles(worksheet, data);

      // Generar buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      this.logger.error('Error al generar Excel:', error);
      throw error;
    }
  }

  private setupColumns(worksheet: ExcelJS.Worksheet): void {
    worksheet.columns = [
      { header: 'N°', key: 'numero', width: 5 },
      { header: 'Nombres', key: 'nombres', width: 25 },
      { header: 'Apellidos', key: 'apellidos', width: 25 },
      { header: 'Edad', key: 'edad', width: 8 },
      { header: 'Sexo', key: 'sexo', width: 10 },
      { header: 'Día 1', key: 'day1', width: 12 },
      { header: 'Día 2', key: 'day2', width: 12 },
      { header: 'Día 3', key: 'day3', width: 12 },
      { header: 'Día 4', key: 'day4', width: 12 },
      { header: 'Día 5', key: 'day5', width: 12 },
      { header: 'Día 6', key: 'day6', width: 12 },
      { header: 'Día 7', key: 'day7', width: 12 },
      { header: 'Día 8', key: 'day8', width: 12 },
      { header: 'Día 9', key: 'day9', width: 12 },
      { header: 'Total Asistencias', key: 'total', width: 15 },
    ];
  }

  private addHeader(worksheet: ExcelJS.Worksheet, data: ReportData): void {
    // Título
    worksheet.mergeCells('A1:O1');
    worksheet.getCell('A1').value = 'Reporte de Asistencias - Novena del Niño Dios';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    // Subtítulo
    worksheet.mergeCells('A2:O2');
    worksheet.getCell('A2').value = 'Iglesia Santa María de los Ángeles';
    worksheet.getCell('A2').font = { size: 12 };
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

    // Información
    worksheet.mergeCells('A3:O3');
    worksheet.getCell('A3').value = `Total de niños: ${data.totalKids} | Fecha de generación: ${this.formatDate(data.generatedAt)}`;
    worksheet.getCell('A3').font = { size: 10 };
    worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'right' };

    // Fila vacía
    worksheet.addRow([]);

    // Encabezados de columnas
    const headerRow = worksheet.addRow([
      'N°',
      'Nombres',
      'Apellidos',
      'Edad',
      'Sexo',
      'Día 1',
      'Día 2',
      'Día 3',
      'Día 4',
      'Día 5',
      'Día 6',
      'Día 7',
      'Día 8',
      'Día 9',
      'Total Asistencias',
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
  }

  private addData(worksheet: ExcelJS.Worksheet, data: ReportData): void {
    data.kids.forEach((kid, index) => {
      const asistencia = kid.asistencia || null;

      const totalAsistencias = asistencia
        ? [
            asistencia.day1,
            asistencia.day2,
            asistencia.day3,
            asistencia.day4,
            asistencia.day5,
            asistencia.day6,
            asistencia.day7,
            asistencia.day8,
            asistencia.day9,
          ].filter(Boolean).length
        : 0;

      // Combinar nombres y apellidos
      const nombresCompletos = [kid.primerNombre, kid.segundoNombre]
        .filter(Boolean)
        .join(' ');
      const apellidosCompletos = [kid.primerApellido, kid.segundoApellido]
        .filter(Boolean)
        .join(' ');

      const row = worksheet.addRow([
        index + 1,
        nombresCompletos,
        apellidosCompletos,
        kid.edad,
        kid.sexo,
        asistencia?.day1 ? '✓' : '',
        asistencia?.day2 ? '✓' : '',
        asistencia?.day3 ? '✓' : '',
        asistencia?.day4 ? '✓' : '',
        asistencia?.day5 ? '✓' : '',
        asistencia?.day6 ? '✓' : '',
        asistencia?.day7 ? '✓' : '',
        asistencia?.day8 ? '✓' : '',
        asistencia?.day9 ? '✓' : '',
        totalAsistencias,
      ]);

      // Alternar colores de fila
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' },
        };
      }

      // Centrar columnas numéricas y de días
      row.getCell(1).alignment = { horizontal: 'center' }; // N°
      row.getCell(4).alignment = { horizontal: 'center' }; // Edad
      row.getCell(5).alignment = { horizontal: 'center' }; // Sexo
      for (let i = 6; i <= 14; i++) {
        row.getCell(i).alignment = { horizontal: 'center' }; // Días 1-9
      }
      row.getCell(15).alignment = { horizontal: 'center' }; // Total
    });
  }

  private applyStyles(worksheet: ExcelJS.Worksheet, data: ReportData): void {
    // Congelar primera fila de encabezados
    worksheet.views = [
      {
        state: 'frozen',
        ySplit: 5, // Congelar hasta la fila de encabezados de columnas
      },
    ];

    // Aplicar bordes a todas las celdas con datos
    const dataStartRow = 6; // Después de los encabezados
    const dataEndRow = dataStartRow + data.kids.length;

    for (let row = 1; row <= dataEndRow; row++) {
      for (let col = 1; col <= 15; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    }
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-NI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Managua',
    }).format(date);
  }
}

