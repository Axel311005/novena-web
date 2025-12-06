import { Kid } from '../../kid/entities/kid.entity';
import { Asistencia } from '../../asistencia/entities/asistencia.entity';

export interface KidWithAsistencias extends Kid {
  asistencias: Asistencia[];
}

export interface ReportData {
  kids: KidWithAsistencias[];
  generatedAt: Date;
  totalKids: number;
}

