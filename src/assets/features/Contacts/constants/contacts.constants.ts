import type { Contact } from '../types/contacts';

export const INIT_COLORS = [
  'bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',   'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700',     'bg-teal-100 text-teal-700',
];

export const STATUS_OPTIONS      = ['Todos', 'Cliente', 'Prospecto', 'Interesado', 'Inactivo'];
export const EDIT_STATUS_OPTIONS = ['Cliente', 'Prospecto', 'Interesado', 'Inactivo'];

export const STATUS_DOT_COLOR: Record<string, string> = {
  Cliente:    'bg-emerald-400',
  Prospecto:  'bg-blue-400',
  Interesado: 'bg-amber-400',
  Inactivo:   'bg-gray-400',
};

export const STATUS_COLOR_MAP: Record<string, string> = {
  Cliente:    'bg-emerald-100 text-emerald-700',
  Prospecto:  'bg-blue-100 text-blue-700',
  Interesado: 'bg-amber-100 text-amber-700',
  Inactivo:   'bg-gray-100 text-gray-500',
};

export const INPUT_CLS = 'border border-blue-300 rounded-lg px-2 py-1 text-sm text-gray-800 outline-none focus:border-blue-500 w-full bg-white';

export const getInitials = (name: string): string =>
  name.trim().split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

export const mapContact = (row: any, idx: number): Contact => ({
  id:          row.id_contacto,
  init:        getInitials(row.nombre_contacto ?? ''),
  color:       INIT_COLORS[idx % INIT_COLORS.length],
  name:        row.nombre_contacto ?? '',
  company:     row.empresa ?? '',
  email:       row.correo ?? '',
  phone:       row.telefono ?? '',
  status:      row.estado ?? '',
  statusColor: STATUS_COLOR_MAP[row.estado] ?? 'bg-gray-100 text-gray-500',
  value:       row.valor != null ? `$${Number(row.valor).toLocaleString('en-US')}` : '',
});
