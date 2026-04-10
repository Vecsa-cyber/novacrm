export interface PipelineProps {
  currentUser: any;
  highlightId?: number;
  darkMode?: boolean;
}

export interface Stage {
  id: number;
  name: string;
  color: string;
}

export interface Deal {
  id: number;
  id_usuario: number | null;
  id_planta: number | null;
  id_contacto: number | null;
  title: string;
  company: string;
  user: string;
  value: string;
  presupuesto: number;
  stageId: number;
  status: string;
  statusType: string;
  fecha_visita: string;
  fecha_vencimiento: string;
  lossReason?: string;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  id_rol: number;
}

export interface Planta {
  id_planta: number;
  nombre_planta: string;
}

export type DealForm = {
  title: string;
  company: string;
  id_planta: string;
  id_usuario: string;
  value: string;
  fecha: string;
  stageId: string;
};
