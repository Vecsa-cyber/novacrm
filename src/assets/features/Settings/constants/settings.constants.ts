import { Users, Factory, Wrench, Shield, LayoutDashboard, Activity, Target } from 'lucide-react';
import type { Vista } from '../types/settings.d';
import React from 'react';

export const ROL_COLORS: Record<number, string> = {
  1: 'bg-blue-50 text-blue-700 border-blue-200',
  2: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};
export const ROL_COLOR_DEFAULT = 'bg-gray-50 text-gray-600 border-gray-200';

export const settingsMenu = [
  {
    id: 'usuarios',
    label: 'Usuarios y Accesos',
    icon: Users,
    description: 'Gestiona roles y permisos del equipo',
    title: 'Gestión de Usuarios',
    iconBg: 'bg-blue-50',    iconText: 'text-blue-600',    border: 'border-blue-200',
    ring: 'ring-blue-100',   headerBg: 'bg-blue-50',       headerText: 'text-blue-700',
    tabActive: 'bg-blue-50 border-blue-200 text-blue-700', dashed: 'border-blue-200 text-blue-400',
  },
  {
    id: 'plantas',
    label: 'Plantas',
    icon: Factory,
    description: 'Administra las instalaciones y ubicaciones',
    title: 'Directorio de Plantas',
    iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', border: 'border-emerald-200',
    ring: 'ring-emerald-100', headerBg: 'bg-emerald-50',   headerText: 'text-emerald-700',
    tabActive: 'bg-emerald-50 border-emerald-200 text-emerald-700', dashed: 'border-emerald-200 text-emerald-400',
  },
  {
    id: 'equipos',
    label: 'Equipos',
    icon: Wrench,
    description: 'Catálogo de equipos y componentes',
    title: 'Catálogo de Equipos',
    iconBg: 'bg-amber-50',   iconText: 'text-amber-600',   border: 'border-amber-200',
    ring: 'ring-amber-100',  headerBg: 'bg-amber-50',      headerText: 'text-amber-700',
    tabActive: 'bg-amber-50 border-amber-200 text-amber-700', dashed: 'border-amber-200 text-amber-400',
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    icon: Shield,
    description: 'Políticas de contraseñas y sesiones',
    title: 'Políticas de Seguridad',
    iconBg: 'bg-rose-50',    iconText: 'text-rose-600',    border: 'border-rose-200',
    ring: 'ring-rose-100',   headerBg: 'bg-rose-50',       headerText: 'text-rose-700',
    tabActive: 'bg-rose-50 border-rose-200 text-rose-700', dashed: 'border-rose-200 text-rose-400',
  },
];

export const VISTAS_DISPONIBLES = ['dashboard', 'contacts', 'activities', 'pipeline'] as const;

export const VISTA_LABELS: Record<Vista, { label: string; icon: React.ElementType }> = {
  dashboard:  { label: 'Dashboard',   icon: LayoutDashboard },
  contacts:   { label: 'Contactos',   icon: Users           },
  activities: { label: 'Actividades', icon: Activity        },
  pipeline:   { label: 'Pipeline',    icon: Target          },
};

export const emptyEquipoForm = {
  tag: '', nombre_equipo: '', tipo: '',
  flujo_referencia: '' as string | number,
  unidad: 'GPM',
  costo: '' as string | number,
  factor_n: '' as string | number,
  proveedor: '', notas: '',
};

export const fmtMXN = (n: number) =>
  Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
