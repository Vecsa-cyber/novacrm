import React from 'react';
import { Hourglass, Circle, CalendarDays, CheckSquare } from 'lucide-react';

interface FilterItem {
  id: string;
  label: string;
  count: number;
  icon: React.ReactNode;
}

interface ActivitiesFiltersProps {
  activeFilter: string;
  onFilterChange: (id: string) => void;
  counts: Record<string, number>;
  darkMode?: boolean;
}

export const ActivitiesFilters: React.FC<ActivitiesFiltersProps> = ({
  activeFilter, onFilterChange, counts, darkMode = false,
}) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;

  const filters: FilterItem[] = [
    { id: 'pendientes',  label: 'Pendientes',  count: counts.pendientes,  icon: <Hourglass size={16} className="text-amber-500" /> },
    { id: 'vencidas',    label: 'Vencidas',     count: counts.vencidas,    icon: <Circle size={14} className="text-red-500 fill-red-500" /> },
    { id: 'hoy',         label: 'Hoy',          count: counts.hoy,         icon: <Circle size={14} className="text-orange-400 fill-orange-400" /> },
    { id: '7dias',       label: '7 días',       count: counts['7dias'],    icon: <CalendarDays size={16} className="text-blue-400" /> },
    { id: '30dias',      label: '30 días',      count: counts['30dias'],   icon: <CalendarDays size={16} className="text-slate-400" /> },
    { id: 'completadas', label: 'Completadas',  count: counts.completadas, icon: <CheckSquare size={16} className="text-emerald-500" /> },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
      <div className={`flex rounded-2xl p-1.5 shadow-sm border min-w-max w-fit ${d('bg-white border-gray-100', 'bg-gray-800 border-gray-700')}`}>
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeFilter === filter.id
                ? d('bg-nova-bg text-slate-800 shadow-sm', 'bg-gray-700 text-white shadow-sm')
                : d('text-slate-500 hover:bg-gray-50',     'text-gray-400 hover:bg-gray-700')
            }`}
          >
            {filter.icon}
            <span>{filter.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeFilter === filter.id
                ? d('bg-white text-slate-700 shadow-sm', 'bg-gray-600 text-gray-200')
                : d('bg-gray-100 text-gray-400',         'bg-gray-700 text-gray-500')
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
