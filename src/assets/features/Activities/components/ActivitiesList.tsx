import React from 'react';
import { CheckSquare, ChevronRight, CalendarDays, Building2, User } from 'lucide-react';
import { typeConfig, defaultType, formatDate, isOverdue } from '../constants/activities.constants';
import type { Activity } from '../types/activities';

interface ActivitiesListProps {
  filtered: Activity[];
  highlightId?: number;
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
  onToggleComplete: (id: number) => void;
  darkMode?: boolean;
}

export const ActivitiesList: React.FC<ActivitiesListProps> = ({
  filtered, highlightId, expandedId, onToggleExpand, onToggleComplete, darkMode = false,
}) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="flex flex-col items-center justify-center text-center max-w-sm opacity-60">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${d('bg-gray-50', 'bg-gray-700')}`}>
            <CheckSquare size={32} className="text-gray-400" />
          </div>
          <h3 className={`text-xl font-black mb-2 ${d('text-gray-800', 'text-gray-200')}`}>Todo al día</h3>
          <p className={`text-sm font-medium ${d('text-gray-500', 'text-gray-400')}`}>
            No hay actividades en esta vista por el momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`divide-y overflow-y-auto ${d('divide-gray-50', 'divide-gray-700')}`}>
      {filtered.map(a => {
        const cfg = typeConfig[a.type] ?? defaultType;
        const isExpanded = expandedId === a.id;

        return (
          <div key={a.id} className={`transition-colors ${a.completed ? 'opacity-50' : ''} ${
            a.id === highlightId
              ? d('bg-blue-50 ring-1 ring-inset ring-blue-300', 'bg-blue-900/20 ring-1 ring-inset ring-blue-500')
              : ''
          }`}>

            {/* Fila principal */}
            <div
              onClick={() => onToggleExpand(a.id)}
              className={`flex items-center gap-4 px-5 sm:px-6 py-4 cursor-pointer select-none transition-colors ${d('hover:bg-slate-50/50', 'hover:bg-gray-700/50')}`}
            >
              <button
                onClick={e => { e.stopPropagation(); onToggleComplete(a.id); }}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  a.completed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : d('border-gray-300 hover:border-emerald-400', 'border-gray-600 hover:border-emerald-400')
                }`}
              >
                {a.completed && <CheckSquare size={14} />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${
                  a.completed ? 'line-through text-gray-400' : d('text-slate-800', 'text-gray-100')
                }`}>
                  {a.title}
                </p>
                <p className={`text-xs font-medium truncate mt-0.5 ${d('text-slate-400', 'text-gray-400')}`}>
                  {a.company} · {a.user}
                </p>
              </div>

              <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${cfg.color}`}>
                {cfg.icon} {a.type.charAt(0).toUpperCase() + a.type.slice(1)}
              </span>

              <span className={`text-xs font-bold flex-shrink-0 px-3 py-1.5 rounded-lg ${
                a.completed    ? d('bg-gray-50 text-gray-400',   'bg-gray-700 text-gray-400')
                : isOverdue(a) ? 'bg-red-50 text-red-600'
                               : d('bg-slate-50 text-slate-600', 'bg-gray-700 text-gray-300')
              }`}>
                {isOverdue(a) && !a.completed ? 'Vencida · ' : ''}{formatDate(a.date)}
              </span>

              <ChevronRight
                size={16}
                className={`flex-shrink-0 transition-transform duration-200 ${d('text-gray-300', 'text-gray-600')} ${isExpanded ? 'rotate-90' : ''}`}
              />
            </div>

            {/* Panel expandido */}
            {isExpanded && (
              <div className={`px-5 sm:px-6 pb-4 pt-1 border-t ${d('bg-slate-50/60 border-gray-100', 'bg-gray-700/40 border-gray-700')}`}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Tipo</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border w-fit ${cfg.color}`}>
                      {cfg.icon} {a.type.charAt(0).toUpperCase() + a.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Empresa / Planta</span>
                    <span className={`flex items-center gap-1.5 text-sm font-semibold ${d('text-slate-700', 'text-gray-200')}`}>
                      <Building2 size={13} className="text-gray-400" />
                      {a.company || <span className={`italic ${d('text-gray-300', 'text-gray-500')}`}>Sin empresa</span>}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Usuario asignado</span>
                    <span className={`flex items-center gap-1.5 text-sm font-semibold ${d('text-slate-700', 'text-gray-200')}`}>
                      <User size={13} className="text-gray-400" />
                      {a.user || <span className={`italic ${d('text-gray-300', 'text-gray-500')}`}>Sin asignar</span>}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Fecha</span>
                    <span className={`flex items-center gap-1.5 text-sm font-semibold ${isOverdue(a) && !a.completed ? 'text-red-500' : d('text-slate-700', 'text-gray-200')}`}>
                      <CalendarDays size={13} className="text-gray-400" />
                      {formatDate(a.date)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    a.completed ? 'bg-emerald-100 text-emerald-700' : isOverdue(a) ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {a.completed ? 'Completada' : isOverdue(a) ? 'Vencida' : 'Pendiente'}
                  </span>
                  <span className="text-xs text-gray-400">ID #{a.id}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
