export interface Activity {
  id: number;
  title: string;
  type: 'llamada' | 'reunión' | 'tarea' | 'seguimiento';
  company: string;
  user: string;
  date: string;
  completed: boolean;
}

export interface CatalogoActividad {
  id_catalogo: number;
  nombre_actividad: string;
}

export interface Planta {
  id_planta: number;
  nombre_planta: string;
}

export interface UsuarioBasic {
  id_usuario: number;
  nombre: string;
}

export interface ActivityForm {
  id_catalogo: string;
  id_planta: string;
  id_usuario: string;
  date: string;
}

export interface ActivitiesProps {
  currentUser: any;
  highlightId?: number;
  darkMode?: boolean;
}
