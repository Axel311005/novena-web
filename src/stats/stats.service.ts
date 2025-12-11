import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kid } from '../kid/entities/kid.entity';
import { Asistencia } from '../asistencia/entities/asistencia.entity';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    @InjectRepository(Kid)
    private readonly kidRepository: Repository<Kid>,
    @InjectRepository(Asistencia)
    private readonly asistenciaRepository: Repository<Asistencia>,
  ) {}

  /**
   * Calcula el número de días asistidos en un registro de asistencia
   */
  private countDaysAttended(asistencia: Asistencia): number {
    let count = 0;
    for (let day = 1; day <= 9; day++) {
      if (asistencia[`day${day}` as keyof Asistencia] === true) {
        count++;
      }
    }
    return count;
  }

  /**
   * Obtiene las estadísticas principales del dashboard
   */
  async getDashboardStats() {
    const totalKids = await this.kidRepository.count();
    const totalAsistencias = await this.asistenciaRepository.count();

    // Obtener todos los niños con su asistencia
    const kids = await this.kidRepository.find({
      relations: ['asistencia'],
    });

    // Calcular niños con asistencia
    const kidsWithAttendance = kids.filter(
      (kid) => kid.asistencia !== null && kid.asistencia !== undefined,
    ).length;

    // Calcular el promedio de días asistidos
    const allAsistencias = await this.asistenciaRepository.find();
    let totalDays = 0;
    allAsistencias.forEach((asistencia) => {
      totalDays += this.countDaysAttended(asistencia);
    });

    const averageDays =
      totalKids > 0 ? (totalDays / totalKids).toFixed(1) : '0.0';

    return {
      totalKids,
      totalAsistencias,
      kidsWithAttendance,
      averageDays: parseFloat(averageDays),
    };
  }

  /**
   * Obtiene estadísticas de asistencia por día (day1 a day9)
   */
  async getStatsByDay() {
    const stats = {
      day1: 0,
      day2: 0,
      day3: 0,
      day4: 0,
      day5: 0,
      day6: 0,
      day7: 0,
      day8: 0,
      day9: 0,
    };

    const asistencias = await this.asistenciaRepository.find();

    asistencias.forEach((asistencia) => {
      for (let day = 1; day <= 9; day++) {
        const dayKey = `day${day}` as keyof Asistencia;
        if (asistencia[dayKey] === true) {
          stats[`day${day}` as keyof typeof stats]++;
        }
      }
    });

    // Convertir a array para facilitar el uso en frontend
    const statsArray = Object.entries(stats).map(([day, count]) => ({
      day,
      dayNumber: parseInt(day.replace('day', '')),
      count,
    }));

    return {
      byDay: stats,
      byDayArray: statsArray,
      total: asistencias.length,
    };
  }

  /**
   * Obtiene la lista de niños sin ningún registro de asistencia
   */
  async getKidsWithoutAttendance() {
    const kids = await this.kidRepository.find({
      relations: ['asistencia'],
    });

    const kidsWithoutAttendance = kids.filter(
      (kid) => !kid.asistencia || kid.asistencia === null,
    );

    return {
      count: kidsWithoutAttendance.length,
      kids: kidsWithoutAttendance.map((kid) => ({
        id: kid.id,
        primerNombre: kid.primerNombre,
        segundoNombre: kid.segundoNombre,
        primerApellido: kid.primerApellido,
        segundoApellido: kid.segundoApellido,
        edad: kid.edad,
        sexo: kid.sexo,
        createdAt: kid.createdAt,
      })),
    };
  }

  /**
   * Obtiene estadísticas detalladas de un niño específico
   */
  async getKidStats(kidId: number) {
    const kid = await this.kidRepository.findOne({
      where: { id: kidId },
      relations: ['asistencia'],
    });

    if (!kid) {
      throw new NotFoundException(`Niño con id ${kidId} no encontrado`);
    }

    const asistencia = kid.asistencia;
    const hasAsistencia = asistencia !== null && asistencia !== undefined;

    // Calcular días totales asistidos
    let totalDaysAttended = 0;
    const daysBreakdown = {
      day1: 0,
      day2: 0,
      day3: 0,
      day4: 0,
      day5: 0,
      day6: 0,
      day7: 0,
      day8: 0,
      day9: 0,
    };

    if (hasAsistencia) {
      totalDaysAttended = this.countDaysAttended(asistencia);

      for (let day = 1; day <= 9; day++) {
        const dayKey = `day${day}` as keyof Asistencia;
        if (asistencia[dayKey] === true) {
          daysBreakdown[`day${day}` as keyof typeof daysBreakdown] = 1;
        }
      }
    }

    const attendanceRate = hasAsistencia && totalDaysAttended > 0 
      ? ((totalDaysAttended / 9) * 100).toFixed(1) 
      : '0.0';

    return {
      kid: {
        id: kid.id,
        primerNombre: kid.primerNombre,
        segundoNombre: kid.segundoNombre,
        primerApellido: kid.primerApellido,
        segundoApellido: kid.segundoApellido,
        edad: kid.edad,
        sexo: kid.sexo,
      },
      stats: {
        hasAsistencia,
        totalDaysAttended,
        daysBreakdown,
        attendanceRate: parseFloat(attendanceRate),
      },
      asistencia: hasAsistencia ? {
        id: asistencia.id,
        day1: asistencia.day1,
        day2: asistencia.day2,
        day3: asistencia.day3,
        day4: asistencia.day4,
        day5: asistencia.day5,
        day6: asistencia.day6,
        day7: asistencia.day7,
        day8: asistencia.day8,
        day9: asistencia.day9,
        createdAt: asistencia.createdAt,
        updatedAt: asistencia.updatedAt,
      } : null,
    };
  }

  /**
   * Obtiene un resumen general de asistencia con información detallada
   */
  async getAttendanceSummary() {
    const kids = await this.kidRepository.find({
      relations: ['asistencia'],
    });

    const allAsistencias = await this.asistenciaRepository.find();

    // Estadísticas generales
    const totalKids = kids.length;
    const totalAsistencias = allAsistencias.length;
    const kidsWithAttendance = kids.filter(
      (kid) => kid.asistencia !== null && kid.asistencia !== undefined,
    ).length;
    const kidsWithoutAttendance = totalKids - kidsWithAttendance;

    // Calcular días totales asistidos
    let totalDaysAttended = 0;
    allAsistencias.forEach((asistencia) => {
      totalDaysAttended += this.countDaysAttended(asistencia);
    });

    const averageDaysPerKid =
      totalKids > 0 ? (totalDaysAttended / totalKids).toFixed(1) : '0.0';

    // Estadísticas por día
    const daysStats = {
      day1: 0,
      day2: 0,
      day3: 0,
      day4: 0,
      day5: 0,
      day6: 0,
      day7: 0,
      day8: 0,
      day9: 0,
    };

    allAsistencias.forEach((asistencia) => {
      for (let day = 1; day <= 9; day++) {
        const dayKey = `day${day}` as keyof Asistencia;
        if (asistencia[dayKey] === true) {
          daysStats[`day${day}` as keyof typeof daysStats]++;
        }
      }
    });

    // Top días con más asistencia
    const topDays = Object.entries(daysStats)
      .map(([day, count]) => ({
        day,
        dayNumber: parseInt(day.replace('day', '')),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Niños con mejor asistencia (top 5)
    const kidsWithBestAttendance = kids
      .map((kid) => {
        const kidAsistencia = kid.asistencia;
        let daysAttended = 0;
        if (kidAsistencia) {
          daysAttended = this.countDaysAttended(kidAsistencia);
        }
        return {
          kid: {
            id: kid.id,
            primerNombre: kid.primerNombre,
            segundoNombre: kid.segundoNombre,
            primerApellido: kid.primerApellido,
            segundoApellido: kid.segundoApellido,
          },
          totalDaysAttended: daysAttended,
        };
      })
      .sort((a, b) => b.totalDaysAttended - a.totalDaysAttended)
      .slice(0, 5);

    return {
      general: {
        totalKids,
        totalAsistencias,
        kidsWithAttendance,
        kidsWithoutAttendance,
        totalDaysAttended,
        averageDaysPerKid: parseFloat(averageDaysPerKid),
      },
      byDay: daysStats,
      topDays,
      kidsWithBestAttendance,
    };
  }
}

