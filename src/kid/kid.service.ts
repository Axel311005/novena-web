import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Kid } from './entities/kid.entity';
import { CreateKidDto, UpdateKidDto } from './dto';
import { User } from '../auth/entities/user.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class KidService {
  private readonly logger = new Logger(KidService.name);

  constructor(
    @InjectRepository(Kid)
    private readonly kidRepository: Repository<Kid>,
  ) {}

  async create(createKidDto: CreateKidDto, user: User): Promise<Kid> {
    try {
      const kid = this.kidRepository.create({
        primerNombre: createKidDto.primerNombre ?? null,
        segundoNombre: createKidDto.segundoNombre ?? null,
        primerApellido: createKidDto.primerApellido ?? null,
        segundoApellido: createKidDto.segundoApellido ?? null,
        edad: createKidDto.edad,
        sexo: createKidDto.sexo,
        createdBy: user,
      });

      return await this.kidRepository.save(kid);
    } catch (error) {
      this.logger.error('Error al crear niño:', error);
      throw new BadRequestException('Error al crear el registro del niño');
    }
  }

  async findAll(
    paginationDto: PaginationQueryDto = {},
  ): Promise<{ data: Kid[]; total: number; limit: number; offset: number }> {
    const { limit = 10, offset = 0, q } = paginationDto;

    const queryBuilder = this.kidRepository
      .createQueryBuilder('kid')
      .leftJoinAndSelect('kid.createdBy', 'createdBy')
      .leftJoinAndSelect('kid.updatedBy', 'updatedBy')
      .leftJoinAndSelect('kid.asistencias', 'asistencias');

    // Aplicar búsqueda si se proporciona el parámetro q
    // Buscar en campos que pueden ser null
    if (q) {
      queryBuilder.where(
        '(COALESCE(kid.primerNombre, \'\') ILIKE :q OR COALESCE(kid.segundoNombre, \'\') ILIKE :q OR COALESCE(kid.primerApellido, \'\') ILIKE :q OR COALESCE(kid.segundoApellido, \'\') ILIKE :q)',
        { q: `%${q}%` },
      );
    }

    // Obtener el total antes de aplicar paginación
    const total = await queryBuilder.getCount();

    // Aplicar paginación
    // Ordenar considerando que los campos pueden ser null
    // Usar ordenamiento simple - PostgreSQL maneja nulls correctamente
    const data = await queryBuilder
      .orderBy('kid.edad', 'ASC')
      .addOrderBy('kid.primerApellido', 'ASC')
      .addOrderBy('kid.primerNombre', 'ASC')
      .skip(offset)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: number): Promise<Kid> {
    const kid = await this.kidRepository.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'asistencias'],
    });

    if (!kid) {
      throw new NotFoundException(`Niño con id ${id} no encontrado`);
    }

    return kid;
  }

  async update(id: number, updateKidDto: UpdateKidDto, user: User): Promise<Kid> {
    const kid = await this.findOne(id);

    Object.assign(kid, updateKidDto);
    kid.updatedBy = user;

    return await this.kidRepository.save(kid);
  }

  async remove(id: number): Promise<void> {
    const kid = await this.findOne(id);
    await this.kidRepository.remove(kid);
  }
}

