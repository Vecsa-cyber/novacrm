export interface GMAOProps {
  darkMode?: boolean;
}

export type Prioridad = 'Alto' | 'Medio' | 'Bajo';
export type EstadoOT = 'Planificada' | 'En ejecución' | 'Completada' | 'Cancelada';

export interface OTRow {
  folio: string;
  actividad: string;
  activo: string;
  cliente: string;
  prioridad: Prioridad;
  estado: EstadoOT;
  vencida?: boolean;
  tecnico: string;
  supervisor: string;
  fecha: string;
}

export interface GMAOStats {
  clientesActivos: number;
  clientesTotal: number;
  activosRegistrados: number;
  activosFueraServicio: number;
  otsAbiertas: number;
  otsVencidas: number;
  tasaCompletado: number;
  completadas: number;
  totalOTs: number;
}
