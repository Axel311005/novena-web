import { Kid } from '../../kid/entities/kid.entity';
import { Asistencia } from '../../asistencia/entities/asistencia.entity';

export interface KidWithAsistencia extends Omit<Kid, 'asistencia'> {
  asistencia: Asistencia | null;
}

export interface ReportData {
  kids: KidWithAsistencia[];
  generatedAt: Date;
  totalKids: number;
}

