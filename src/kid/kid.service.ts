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

      const savedKid = await this.kidRepository.save(kid);

      // El trigger de la base de datos creará automáticamente la asistencia
      // Recargar el niño con la asistencia creada por el trigger
      return await this.findOne(savedKid.id);
    } catch (error) {
      this.logger.error('Error al crear niño:', error);
      throw new BadRequestException('Error al crear el registro del niño');
    }
  }

  async findAll(
    paginationDto: PaginationQueryDto = {},
  ): Promise<{ data: Kid[]; total: number; limit: number; offset: number }> {
    const { limit = 10, offset = 0, q } = paginationDto;

    // QueryBuilder para obtener los datos con relaciones
    const queryBuilder = this.kidRepository
      .createQueryBuilder('kid')
      .leftJoinAndSelect('kid.createdBy', 'createdBy')
      .leftJoinAndSelect('kid.updatedBy', 'updatedBy')
      .leftJoinAndSelect('kid.asistencia', 'asistencia');

    // QueryBuilder para contar (sin relaciones ni ordenamiento)
    const countQueryBuilder = this.kidRepository
      .createQueryBuilder('kid');

    // Aplicar búsqueda si se proporciona el parámetro q
    // Buscar en campos que pueden ser null
    if (q) {
      const searchCondition = '(COALESCE(kid.primerNombre, \'\') ILIKE :q OR COALESCE(kid.segundoNombre, \'\') ILIKE :q OR COALESCE(kid.primerApellido, \'\') ILIKE :q OR COALESCE(kid.segundoApellido, \'\') ILIKE :q)';
      queryBuilder.where(searchCondition, { q: `%${q}%` });
      countQueryBuilder.where(searchCondition, { q: `%${q}%` });
    }

    // Ordenar por el último registro creado (más reciente primero)
    queryBuilder.orderBy('kid.createdAt', 'DESC');

    // Obtener el total antes de aplicar paginación
    const total = await countQueryBuilder.getCount();

    // Aplicar paginación y obtener los datos
    const data = await queryBuilder
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
      relations: ['createdBy', 'updatedBy', 'asistencia'],
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

