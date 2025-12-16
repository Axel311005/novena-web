import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@ApiTags('Estadísticas')
@Controller('stats')
@ApiBearerAuth('JWT-auth')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({ 
    summary: 'Obtener estadísticas principales del dashboard',
    description: 'Retorna las métricas principales: total de niños, registros de asistencia, niños con asistencia y promedio de días'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del dashboard obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalKids: { type: 'number', example: 2 },
        totalAsistencias: { type: 'number', example: 1 },
        kidsWithAttendance: { type: 'number', example: 1 },
        averageDays: { type: 'number', example: 1.0 },
      },
    },
  })
  getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  @Get('by-day')
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({ 
    summary: 'Obtener estadísticas de asistencia por día',
    description: 'Retorna la cantidad de niños que asistieron cada día (day1 a day9)'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas por día obtenidas exitosamente',
  })
  getStatsByDay() {
    return this.statsService.getStatsByDay();
  }

  @Get('kids-without-attendance')
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({ 
    summary: 'Obtener lista de niños sin asistencia',
    description: 'Retorna todos los niños que no tienen ningún registro de asistencia'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de niños sin asistencia obtenida exitosamente',
  })
  getKidsWithoutAttendance() {
    return this.statsService.getKidsWithoutAttendance();
  }

  @Get('kid/:id')
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({ 
    summary: 'Obtener estadísticas detalladas de un niño',
    description: 'Retorna estadísticas completas de asistencia para un niño específico'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del niño obtenidas exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Niño no encontrado',
  })
  getKidStats(@Param('id', ParseIntPipe) id: number) {
    return this.statsService.getKidStats(id);
  }

  @Get('attendance-summary')
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({ 
    summary: 'Obtener resumen completo de asistencia',
    description: 'Retorna un resumen detallado con estadísticas generales, por día, top días y niños con mejor asistencia'
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de asistencia obtenido exitosamente',
  })
  getAttendanceSummary() {
    return this.statsService.getAttendanceSummary();
  }

  @Get('by-age')
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({ 
    summary: 'Obtener conteo de niños por edad',
    description: 'Retorna la cantidad de niños agrupados por edad'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas por edad obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        byAge: {
          type: 'object',
          description: 'Objeto con edad como clave y conteo como valor',
          example: { '5': 3, '6': 5, '7': 2 },
        },
        byAgeArray: {
          type: 'array',
          description: 'Array ordenado por edad con objetos {edad, count}',
          items: {
            type: 'object',
            properties: {
              edad: { type: 'number', example: 5 },
              count: { type: 'number', example: 3 },
            },
          },
        },
        totalKids: { type: 'number', example: 10 },
      },
    },
  })
  getKidsByAge() {
    return this.statsService.getKidsByAge();
  }

  @Get('by-sex')
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({ 
    summary: 'Obtener conteo de niños por sexo',
    description: 'Retorna la cantidad de niños agrupados por sexo (masculino/femenino)'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas por sexo obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        bySex: {
          type: 'object',
          description: 'Objeto con sexo como clave y conteo como valor',
          example: { 'masculino': 15, 'femenino': 12 },
        },
        bySexArray: {
          type: 'array',
          description: 'Array con objetos {sexo, count}',
          items: {
            type: 'object',
            properties: {
              sexo: { type: 'string', example: 'masculino' },
              count: { type: 'number', example: 15 },
            },
          },
        },
        totalKids: { type: 'number', example: 27 },
      },
    },
  })
  getKidsBySex() {
    return this.statsService.getKidsBySex();
  }
}

