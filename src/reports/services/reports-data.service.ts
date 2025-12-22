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

  /**
   * Calcula el total de asistencias contando los días asistidos (day1-day9)
   */
  private calculateTotalAsistencias(asistencia: Asistencia | null): number {
    if (!asistencia) return 0;
    return [
      asistencia.day1,
      asistencia.day2,
      asistencia.day3,
      asistencia.day4,
      asistencia.day5,
      asistencia.day6,
      asistencia.day7,
      asistencia.day8,
      asistencia.day9,
    ].filter(Boolean).length;
  }

  async getReportData(): Promise<ReportData> {
    try {
      // Obtener todos los niños con su asistencia
      const kids = await this.kidRepository.find({
        relations: ['createdBy', 'updatedBy', 'asistencia'],
      });

      // Mapear a la interfaz con asistencia (OneToOne)
      const kidsWithAsistencia: KidWithAsistencia[] = kids.map((kid) => ({
        ...kid,
        asistencia: kid.asistencia || null,
      }));

      // Ordenar: primero por edad (menor a mayor), luego por total de asistencias (mayor a menor)
      kidsWithAsistencia.sort((a, b) => {
        // Primero ordenar por edad (menor a mayor)
        if (a.edad !== b.edad) {
          return a.edad - b.edad;
        }
        
        // Si tienen la misma edad, ordenar por total de asistencias (mayor a menor)
        const totalA = this.calculateTotalAsistencias(a.asistencia);
        const totalB = this.calculateTotalAsistencias(b.asistencia);
        return totalB - totalA;
      });

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
