import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asistencia } from './entities/asistencia.entity';
import { CreateAsistenciaDto, UpdateAsistenciaDto } from './dto';
import { User } from '../auth/entities/user.entity';
import { Kid } from '../kid/entities/kid.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class AsistenciaService {
  private readonly logger = new Logger(AsistenciaService.name);

  constructor(
    @InjectRepository(Asistencia)
    private readonly asistenciaRepository: Repository<Asistencia>,
    @InjectRepository(Kid)
    private readonly kidRepository: Repository<Kid>,
  ) {}

  async create(
    createAsistenciaDto: CreateAsistenciaDto,
    user: User,
  ): Promise<Asistencia> {
    try {
      // Verificar que el niño existe
      const kid = await this.kidRepository.findOne({
        where: { id: createAsistenciaDto.kidId },
      });

      if (!kid) {
        throw new NotFoundException(
          `Niño con id ${createAsistenciaDto.kidId} no encontrado`,
        );
      }

      const asistencia = this.asistenciaRepository.create({
        ...createAsistenciaDto,
        kid,
        createdBy: user,
      });

      return await this.asistenciaRepository.save(asistencia);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error al crear asistencia:', error);
      throw new BadRequestException('Error al crear el registro de asistencia');
    }
  }

  async findAll(
    paginationDto: PaginationQueryDto = {},
  ): Promise<{
    data: Asistencia[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 10, offset = 0, q } = paginationDto;

    const queryBuilder = this.asistenciaRepository
      .createQueryBuilder('asistencia')
      .leftJoinAndSelect('asistencia.kid', 'kid')
      .leftJoinAndSelect('asistencia.createdBy', 'createdBy')
      .leftJoinAndSelect('asistencia.updatedBy', 'updatedBy');

    // Aplicar búsqueda si se proporciona el parámetro q (buscar por nombre del niño)
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
    const data = await queryBuilder
      .orderBy('asistencia.createdAt', 'DESC')
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

  async findOne(id: number): Promise<Asistencia> {
    const asistencia = await this.asistenciaRepository.findOne({
      where: { id },
      relations: ['kid', 'createdBy', 'updatedBy'],
    });

    if (!asistencia) {
      throw new NotFoundException(`Asistencia con id ${id} no encontrada`);
    }

    return asistencia;
  }

  async findByKidId(kidId: number): Promise<Asistencia[]> {
    return await this.asistenciaRepository.find({
      where: { kidId },
      relations: ['kid', 'createdBy', 'updatedBy'],
    });
  }

  async update(
    id: number,
    updateAsistenciaDto: UpdateAsistenciaDto,
    user: User,
  ): Promise<Asistencia> {
    const asistencia = await this.findOne(id);

    // Si se actualiza el kidId, verificar que el nuevo niño existe
    if (updateAsistenciaDto.kidId && updateAsistenciaDto.kidId !== asistencia.kidId) {
      const kid = await this.kidRepository.findOne({
        where: { id: updateAsistenciaDto.kidId },
      });

      if (!kid) {
        throw new NotFoundException(
          `Niño con id ${updateAsistenciaDto.kidId} no encontrado`,
        );
      }

      asistencia.kid = kid;
    }

    Object.assign(asistencia, updateAsistenciaDto);
    asistencia.updatedBy = user;

    return await this.asistenciaRepository.save(asistencia);
  }

  async remove(id: number): Promise<void> {
    const asistencia = await this.findOne(id);
    await this.asistenciaRepository.remove(asistencia);
  }
}

