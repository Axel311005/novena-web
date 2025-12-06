import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { CreateAsistenciaDto, UpdateAsistenciaDto } from './dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Asistencias')
@Controller('asistencias')
@ApiBearerAuth('JWT-auth')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({ summary: 'Crear un nuevo registro de asistencia' })
  create(
    @Body() createAsistenciaDto: CreateAsistenciaDto,
    @GetUser() user: User,
  ) {
    return this.asistenciaService.create(createAsistenciaDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({
    summary: 'Obtener todos los registros de asistencia',
    description: 'Soporta paginación (limit, offset), búsqueda por parámetro q (nombre del niño) y filtro por kidId',
  })
  @ApiQuery({
    name: 'kidId',
    required: false,
    type: Number,
    description: 'Filtrar asistencias por ID de niño',
  })
  findAll(
    @Query() paginationDto: PaginationQueryDto,
    @Query('kidId') kidId?: string,
  ) {
    if (kidId) {
      return this.asistenciaService.findByKidId(parseInt(kidId, 10));
    }
    return this.asistenciaService.findAll(paginationDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({ summary: 'Obtener un registro de asistencia por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({ summary: 'Actualizar un registro de asistencia' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsistenciaDto: UpdateAsistenciaDto,
    @GetUser() user: User,
  ) {
    return this.asistenciaService.update(id, updateAsistenciaDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Eliminar un registro de asistencia' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaService.remove(id);
  }
}

