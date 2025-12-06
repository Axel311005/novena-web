import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEstado } from '../../common/enums';
import { Kid } from '../../kid/entities/kid.entity';
import { Asistencia } from '../../asistencia/entities/asistencia.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('text', {
    name: 'email',
    unique: true,
  })
  email: string;

  @Column('text', {
    name: 'password',
    select: false,
  })
  password: string;

  @Column('int', {
    name: 'login_attempts',
    default: 0,
  })
  loginAttempts: number;

  @Column({
    name: 'blocked_until',
    type: 'timestamptz',
    nullable: true,
  })
  blockedUntil: Date | null;

  @Column({
    name: 'estado',
    type: 'varchar',
    length: 50,
    enum: UserEstado,
    default: UserEstado.ACTIVO,
  })
  estado: UserEstado;

  @Column('text', {
    name: 'roles',
    array: true,
    default: ['apuntador'],
  })
  roles: string[];

  @OneToMany(() => Kid, (kid) => kid.createdBy)
  kids: Kid[];

  @OneToMany(() => Asistencia, (asistencia) => asistencia.createdBy)
  asistencias: Asistencia[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.email = this.email.toLowerCase().trim();
  }
}
