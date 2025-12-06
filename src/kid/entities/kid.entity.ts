import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  RelationId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Asistencia } from '../../asistencia/entities/asistencia.entity';
import { Sexo } from '../../common/enums';

@Entity()
export class Kid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true, default: null })
  primerNombre: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  segundoNombre: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  primerApellido: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  segundoApellido: string | null;

  @Column()
  edad: number;

  @Column({
    type: 'varchar',
    enum: Sexo,
  })
  sexo: Sexo;

  @ManyToOne(() => User, (user) => user.kids, { nullable: false })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User;

  @RelationId((kid: Kid) => kid.createdBy)
  createdByUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_user_id' })
  updatedBy: User | null;

  @RelationId((kid: Kid) => kid.updatedBy)
  updatedByUserId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Asistencia, (asistencia) => asistencia.kid)
  asistencias: Asistencia[];
}

