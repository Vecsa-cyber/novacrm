export interface DealsProps {
  currentUser: any;
  darkMode?: boolean;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  id_rol: number;
  nombre_rol: string;
}

export interface Trato {
  id_trato: number;
  id_usuario: number | null;
  presupuesto: number;
  estado: string;
}

export interface SellerStats {
  id: number;
  nombre: string;
  id_rol: number;
  dealsAssigned: number;
  wonAmount: number;
  lostCount: number;
  lostAmount: number;
  pipelineAmount: number;
  effectiveness: number;
}
