// Clases de Tailwind reutilizables para el módulo Quoter.
// Importa las que necesites en tus componentes/vistas.

export const card =
  'bg-white rounded-2xl shadow-soft border border-slate-100 p-6';

export const sectionTitle =
  'text-base font-bold text-slate-700 mb-4';

export const inputBase =
  'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition';

export const selectBase =
  'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition';

export const btnPrimary =
  'flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition';

export const btnSecondary =
  'flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition';

export const btnDanger =
  'text-red-400 hover:text-red-600 transition-colors';

export const tableHeader =
  'text-left text-slate-500 border-b border-slate-100 text-sm';

export const tableRow =
  'border-b border-slate-50 text-sm';

export const badge = (color: 'blue' | 'green' | 'amber' | 'red') => {
  const map = {
    blue:  'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red:   'bg-red-50 text-red-700',
  };
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[color]}`;
};
