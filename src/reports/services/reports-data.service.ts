import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kid } from '../../kid/entities/kid.entity';
import { Asistencia } from '../../asistencia/entities/asistencia.entity';
import { ReportData, KidWithAsistencias } from '../interfaces/report-data.interface';

@Injectable()
export class ReportsDataService {
  private readonly logger = new Logger(ReportsDataService.name);

  constructor(
    @InjectRepository(Kid)
    private readonly kidRepository: Repository<Kid>,
    @InjectRepository(Asistencia)
    private readonly asistenciaRepository: Repository<Asistencia>,
  ) {}

  async getReportData(): Promise<ReportData> {
    try {
      // Obtener todos los niños con sus asistencias, ordenados por edad (de menor a mayor)
      const kids = await this.kidRepository.find({
        relations: ['createdBy', 'updatedBy', 'asistencias'],
        order: {
          edad: 'ASC', // De menor a mayor edad
          primerApellido: 'ASC', // Si tienen la misma edad, ordenar por apellido
          primerNombre: 'ASC', // Si tienen la misma edad y apellido, ordenar por nombre
        },
      });

      // Para cada niño, obtener todas sus asistencias ordenadas
      // Usamos las asistencias que ya vienen cargadas en la relación y las ordenamos
      const kidsWithAsistencias: KidWithAsistencias[] = kids.map((kid) => {
        // Ordenar las asistencias por fecha de creación (más recientes primero)
        const asistencias = (kid.asistencias || []).sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return {
          ...kid,
          asistencias,
        };
      });

      return {
        kids: kidsWithAsistencias,
        generatedAt: new Date(),
        totalKids: kidsWithAsistencias.length,
      };
    } catch (error) {
      this.logger.error('Error al obtener datos para el reporte:', error);
      throw error;
    }
  }
}

