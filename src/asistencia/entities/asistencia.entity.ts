import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kid } from '../../kid/entities/kid.entity';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Asistencia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Kid, (kid) => kid.asistencias, { nullable: false })
  @JoinColumn({ name: 'kid_id' })
  kid: Kid;

  @RelationId((asistencia: Asistencia) => asistencia.kid)
  kidId: number;

  @Column({ default: true })
  day1: boolean;

  @Column({ default: false })
  day2: boolean;

  @Column({ default: false })
  day3: boolean;

  @Column({ default: false })
  day4: boolean;

  @Column({ default: false })
  day5: boolean;

  @Column({ default: false })
  day6: boolean;

  @Column({ default: false })
  day7: boolean;

  @Column({ default: false })
  day8: boolean;

  @Column({ default: false })
  day9: boolean;

  @ManyToOne(() => User, (user) => user.asistencias, { nullable: false })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User;

  @RelationId((asistencia: Asistencia) => asistencia.createdBy)
  createdByUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_user_id' })
  updatedBy: User | null;

  @RelationId((asistencia: Asistencia) => asistencia.updatedBy)
  updatedByUserId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

