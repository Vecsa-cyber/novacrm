export interface SettingsProps {
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

export interface Rol {
  id_rol: number;
  nombre_rol: string;
}

export interface Acceso {
  id_acceso: number;
  vista: Vista;
  id_rol: number;
  nombre_rol: string;
}

export interface Planta {
  id_planta: number;
  nombre_planta: string;
}

export interface Equipo {
  id_equipo: number;
  tag: string;
  nombre_equipo: string;
  tipo: string;
  flujo_referencia: number;
  unidad: string;
  costo: number;
  factor_n: number;
  proveedor: string;
  notas: string;
}

export type Vista = 'dashboard' | 'contacts' | 'activities' | 'pipeline';
