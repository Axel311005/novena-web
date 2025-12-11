import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kid } from '../../kid/entities/kid.entity';
import { Asistencia } from '../../asistencia/entities/asistencia.entity';
import { ReportData, KidWithAsistencia } from '../interfaces/report-data.interface';

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
      // Obtener todos los niños con su asistencia, ordenados por edad (de menor a mayor)
      const kids = await this.kidRepository.find({
        relations: ['createdBy', 'updatedBy', 'asistencia'],
        order: {
          edad: 'ASC', // De menor a mayor edad
          primerApellido: 'ASC', // Si tienen la misma edad, ordenar por apellido
          primerNombre: 'ASC', // Si tienen la misma edad y apellido, ordenar por nombre
        },
      });

      // Mapear a la interfaz con asistencia (OneToOne)
      const kidsWithAsistencia: KidWithAsistencia[] = kids.map((kid) => ({
        ...kid,
        asistencia: kid.asistencia || null,
      }));

      return {
        kids: kidsWithAsistencia,
        generatedAt: new Date(),
        totalKids: kidsWithAsistencia.length,
      };
    } catch (error) {
      this.logger.error('Error al obtener datos para el reporte:', error);
      throw error;
    }
  }
}

