import { Injectable, Logger } from '@nestjs/common';
import { ReportData } from '../interfaces/report-data.interface';

// Importación compatible con CommonJS y ES modules
const PDFDocument = require('pdfkit');

type PDFDoc = InstanceType<typeof PDFDocument>;

@Injectable()
export class PdfReportService {
  private readonly logger = new Logger(PdfReportService.name);

  // Configuración de la tabla
  private readonly tableConfig = {
    startX: 50,
    startY: 120,
    rowHeight: 18, // Reducido para que quepa más contenido
    headerHeight: 22, // Reducido para que quepa más contenido
    columnWidths: {
      numero: 30,
      nombres: 100,
      apellidos: 100,
      edad: 35,
      sexo: 40,
      day1: 35,
      day2: 35,
      day3: 35,
      day4: 35,
      day5: 35,
      day6: 35,
      day7: 35,
      day8: 35,
      day9: 35,
      total: 50,
    },
  };

  async generateReport(data: ReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Formato horizontal (landscape)
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (error) => reject(error));

        // Encabezado
        this.addHeader(doc, data);

        // Tabla de datos
        this.addTable(doc, data);

        // Pie de página - agregar justo antes de cerrar, solo en la última página
        const pageCount = doc.bufferedPageRange().count;
        if (pageCount > 0) {
          const lastPageIndex = pageCount - 1;
          doc.switchToPage(lastPageIndex);
          const footerY = doc.page.height - 25;
          doc
            .fontSize(7)
            .font('Helvetica')
            .text(
              `Página ${lastPageIndex + 1} de ${pageCount}`,
              doc.page.width / 2,
              footerY,
              { align: 'center', width: doc.page.width - 60 },
            );
        }

        doc.end();
      } catch (error) {
        this.logger.error('Error al generar PDF:', error);
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFDoc, data: ReportData): void {
    // Título
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('Reporte de Asistencias - Novena del Niño Dios', {
        align: 'center',
        y: 50,
      })
      .moveDown(0.3);

    // Subtítulo
    doc
      .fontSize(12)
      .font('Helvetica')
      .text('Iglesia Santa María de los Ángeles', { align: 'center' })
      .moveDown(0.5);

    // Información
    doc
      .fontSize(9)
      .text(
        `Total de niños: ${data.totalKids} | Fecha de generación: ${this.formatDate(data.generatedAt)}`,
        { align: 'right' },
      )
      .moveDown(0.8);
  }

  private addTable(doc: PDFDoc, data: ReportData): void {
    const config = this.tableConfig;
    let currentY = config.startY;

    // Calcular posiciones X de las columnas
    const columns = this.getColumnPositions();

    // Dibujar encabezados
    this.drawTableHeader(doc, columns, currentY);
    currentY += config.headerHeight;

    // Dibujar filas de datos
    data.kids.forEach((kid, index) => {
      // Verificar si necesitamos una nueva página (dejar más espacio para el pie de página)
      if (currentY > doc.page.height - 60) {
        doc.addPage();
        this.addHeader(doc, data);
        currentY = config.startY;
        this.drawTableHeader(doc, columns, currentY);
        currentY += config.headerHeight;
      }

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

      // Color alternado para filas
      const isEven = index % 2 === 0;
      if (isEven) {
        doc
          .rect(columns.numero.x, currentY, this.getTableWidth(), config.rowHeight)
          .fillColor('#F5F5F5')
          .fill()
          .fillColor('black');
      }

      // Dibujar bordes de la fila
      this.drawRowBorders(doc, columns, currentY, config.rowHeight);

      // Contenido de la fila - fuente más pequeña para que quepa mejor
      doc.fontSize(7).font('Helvetica');
      
      // Número
      doc.text(String(index + 1), columns.numero.x + 5, currentY + 4, {
        width: columns.numero.width - 10,
        align: 'center',
      });
      
      // Nombres combinados
      const nombresCompletos = [kid.primerNombre, kid.segundoNombre]
        .filter(Boolean)
        .join(' ');
      doc.text(nombresCompletos, columns.nombres.x + 3, currentY + 4, {
        width: columns.nombres.width - 6,
      });
      
      // Apellidos combinados
      const apellidosCompletos = [kid.primerApellido, kid.segundoApellido]
        .filter(Boolean)
        .join(' ');
      doc.text(apellidosCompletos, columns.apellidos.x + 3, currentY + 4, {
        width: columns.apellidos.width - 6,
      });
      
      // Edad y sexo
      doc.text(String(kid.edad), columns.edad.x + 5, currentY + 4, {
        width: columns.edad.width - 10,
        align: 'center',
      });
      doc.text(kid.sexo, columns.sexo.x + 3, currentY + 4, {
        width: columns.sexo.width - 6,
        align: 'center',
      });
      
      // Días de asistencia - solo mostrar check si es explícitamente true
      // No escribir nada si es false, null o undefined
      const days = [
        { day: asistencia?.day1, col: columns.day1 },
        { day: asistencia?.day2, col: columns.day2 },
        { day: asistencia?.day3, col: columns.day3 },
        { day: asistencia?.day4, col: columns.day4 },
        { day: asistencia?.day5, col: columns.day5 },
        { day: asistencia?.day6, col: columns.day6 },
        { day: asistencia?.day7, col: columns.day7 },
        { day: asistencia?.day8, col: columns.day8 },
        { day: asistencia?.day9, col: columns.day9 },
      ];

      days.forEach(({ day, col }) => {
        if (day === true) {
          doc.text('Asistió', col.x + 5, currentY + 4, {
            width: col.width - 10,
            align: 'center',
          });
        }
        // Si no es true, no escribir nada (celda vacía)
      });
      
      // Total
      doc.text(String(totalAsistencias), columns.total.x + 5, currentY + 4, {
        width: columns.total.width - 10,
        align: 'center',
      });

      currentY += config.rowHeight;
    });
  }

  private getColumnPositions() {
    const config = this.tableConfig;
    let currentX = config.startX;

    const columns: Record<string, { x: number; width: number }> = {};

    columns.numero = { x: currentX, width: config.columnWidths.numero };
    currentX += config.columnWidths.numero;

    columns.nombres = { x: currentX, width: config.columnWidths.nombres };
    currentX += config.columnWidths.nombres;

    columns.apellidos = { x: currentX, width: config.columnWidths.apellidos };
    currentX += config.columnWidths.apellidos;

    columns.edad = { x: currentX, width: config.columnWidths.edad };
    currentX += config.columnWidths.edad;

    columns.sexo = { x: currentX, width: config.columnWidths.sexo };
    currentX += config.columnWidths.sexo;

    columns.day1 = { x: currentX, width: config.columnWidths.day1 };
    currentX += config.columnWidths.day1;

    columns.day2 = { x: currentX, width: config.columnWidths.day2 };
    currentX += config.columnWidths.day2;

    columns.day3 = { x: currentX, width: config.columnWidths.day3 };
    currentX += config.columnWidths.day3;

    columns.day4 = { x: currentX, width: config.columnWidths.day4 };
    currentX += config.columnWidths.day4;

    columns.day5 = { x: currentX, width: config.columnWidths.day5 };
    currentX += config.columnWidths.day5;

    columns.day6 = { x: currentX, width: config.columnWidths.day6 };
    currentX += config.columnWidths.day6;

    columns.day7 = { x: currentX, width: config.columnWidths.day7 };
    currentX += config.columnWidths.day7;

    columns.day8 = { x: currentX, width: config.columnWidths.day8 };
    currentX += config.columnWidths.day8;

    columns.day9 = { x: currentX, width: config.columnWidths.day9 };
    currentX += config.columnWidths.day9;

    columns.total = { x: currentX, width: config.columnWidths.total };
    currentX += config.columnWidths.total;

    return columns;
  }

  private getTableWidth(): number {
    const config = this.tableConfig;
    return (
      config.columnWidths.numero +
      config.columnWidths.nombres +
      config.columnWidths.apellidos +
      config.columnWidths.edad +
      config.columnWidths.sexo +
      config.columnWidths.day1 +
      config.columnWidths.day2 +
      config.columnWidths.day3 +
      config.columnWidths.day4 +
      config.columnWidths.day5 +
      config.columnWidths.day6 +
      config.columnWidths.day7 +
      config.columnWidths.day8 +
      config.columnWidths.day9 +
      config.columnWidths.total
    );
  }

  private drawTableHeader(doc: PDFDoc, columns: any, y: number): void {
    const config = this.tableConfig;

    // Fondo gris para el encabezado
    doc
      .rect(columns.numero.x, y, this.getTableWidth(), config.headerHeight)
      .fillColor('#E0E0E0')
      .fill()
      .fillColor('black');

    // Bordes del encabezado
    this.drawRowBorders(doc, columns, y, config.headerHeight);

    // Texto de los encabezados - fuente más pequeña
    doc.fontSize(7).font('Helvetica-Bold');

    doc.text('N°', columns.numero.x + 5, y + 7, {
      width: columns.numero.width - 10,
      align: 'center',
    });
    doc.text('Nombres', columns.nombres.x + 3, y + 7, {
      width: columns.nombres.width - 6,
    });
    doc.text('Apellidos', columns.apellidos.x + 3, y + 7, {
      width: columns.apellidos.width - 6,
    });
    doc.text('Edad', columns.edad.x + 5, y + 7, {
      width: columns.edad.width - 10,
      align: 'center',
    });
    doc.text('Sexo', columns.sexo.x + 3, y + 7, {
      width: columns.sexo.width - 6,
      align: 'center',
    });
    doc.text('Día 1', columns.day1.x + 5, y + 7, {
      width: columns.day1.width - 10,
      align: 'center',
    });
    doc.text('Día 2', columns.day2.x + 5, y + 7, {
      width: columns.day2.width - 10,
      align: 'center',
    });
    doc.text('Día 3', columns.day3.x + 5, y + 7, {
      width: columns.day3.width - 10,
      align: 'center',
    });
    doc.text('Día 4', columns.day4.x + 5, y + 7, {
      width: columns.day4.width - 10,
      align: 'center',
    });
    doc.text('Día 5', columns.day5.x + 5, y + 7, {
      width: columns.day5.width - 10,
      align: 'center',
    });
    doc.text('Día 6', columns.day6.x + 5, y + 7, {
      width: columns.day6.width - 10,
      align: 'center',
    });
    doc.text('Día 7', columns.day7.x + 5, y + 7, {
      width: columns.day7.width - 10,
      align: 'center',
    });
    doc.text('Día 8', columns.day8.x + 5, y + 7, {
      width: columns.day8.width - 10,
      align: 'center',
    });
    doc.text('Día 9', columns.day9.x + 5, y + 7, {
      width: columns.day9.width - 10,
      align: 'center',
    });
    doc.text('Total', columns.total.x + 5, y + 7, {
      width: columns.total.width - 10,
      align: 'center',
    });
  }

  private drawRowBorders(
    doc: PDFDoc,
    columns: any,
    y: number,
    height: number,
  ): void {
    const tableWidth = this.getTableWidth();
    const startX = columns.numero.x;

    // Líneas horizontales
    doc.moveTo(startX, y).lineTo(startX + tableWidth, y).stroke();
    doc.moveTo(startX, y + height).lineTo(startX + tableWidth, y + height).stroke();

    // Líneas verticales
    Object.values(columns).forEach((col: any) => {
      doc.moveTo(col.x, y).lineTo(col.x, y + height).stroke();
    });

    // Línea final
    doc
      .moveTo(startX + tableWidth, y)
      .lineTo(startX + tableWidth, y + height)
      .stroke();
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
