import React from 'react';
import { Phone, Users, FileText, Clock } from 'lucide-react';
import type { Activity, ActivityForm } from '../types/activities';

export const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  llamada:     { icon: React.createElement(Phone,    { size: 14 }), color: 'bg-blue-50 text-blue-600 border-blue-200'          },
  visita:      { icon: React.createElement(Users,    { size: 14 }), color: 'bg-purple-50 text-purple-600 border-purple-200'    },
  reunión:     { icon: React.createElement(Users,    { size: 14 }), color: 'bg-purple-50 text-purple-600 border-purple-200'    },
  tarea:       { icon: React.createElement(FileText, { size: 14 }), color: 'bg-amber-50 text-amber-600 border-amber-200'       },
  seguimiento: { icon: React.createElement(Clock,    { size: 14 }), color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
};
export const defaultType = {
  icon: React.createElement(FileText, { size: 14 }),
  color: 'bg-gray-50 text-gray-600 border-gray-200',
};

export const EMPTY_FORM: ActivityForm = {
  id_catalogo: '', id_planta: '', id_usuario: '', date: '',
};

export const mapActivity = (row: any): Activity => ({
  id:        row.id_actividad,
  title:     row.tipo_actividad ?? 'Actividad',
  type:      (row.tipo_actividad ?? '').toLowerCase() as Activity['type'],
  company:   row.nombre_planta ?? row.empresa ?? '',
  user:      row.nombre_usuario ?? '',
  date:      row.fecha_actividad ? String(row.fecha_actividad).split('T')[0] : '',
  completed: !!row.completada,
});

export const today = (): Date => {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d;
};

export const addDays = (base: Date, n: number): Date => {
  const d = new Date(base); d.setDate(d.getDate() + n); return d;
};

export const formatDate = (s: string): string =>
  new Date(s + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

export const isOverdue = (a: Activity): boolean =>
  !a.completed && new Date(a.date + 'T00:00:00') < today();
