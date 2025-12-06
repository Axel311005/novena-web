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
import { KidService } from './kid.service';
import { CreateKidDto, UpdateKidDto } from './dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Kids')
@Controller('kids')
@ApiBearerAuth('JWT-auth')
export class KidController {
  constructor(private readonly kidService: KidService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({ summary: 'Crear un nuevo registro de niño' })
  create(@Body() createKidDto: CreateKidDto, @GetUser() user: User) {
    return this.kidService.create(createKidDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({
    summary: 'Obtener todos los registros de niños',
    description: 'Soporta paginación (limit, offset) y búsqueda por parámetro q',
  })
  findAll(@Query() paginationDto: PaginationQueryDto) {
    return this.kidService.findAll(paginationDto);
  } 

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({ summary: 'Obtener un registro de niño por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kidService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.apuntador)
  @ApiOperation({ summary: 'Actualizar un registro de niño' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKidDto: UpdateKidDto,
    @GetUser() user: User,
  ) {
    return this.kidService.update(id, updateKidDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Eliminar un registro de niño' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.kidService.remove(id);
  }
}

