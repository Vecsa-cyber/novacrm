import React from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { STATUS_OPTIONS, STATUS_DOT_COLOR } from '../constants/contacts.constants';

interface ContactsFiltersProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  sortOrder: string;
  onSortChange: (v: string) => void;
  dropdownOpen: boolean;
  onDropdownToggle: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  darkMode?: boolean;
}

export const ContactsFilters: React.FC<ContactsFiltersProps> = ({
  searchQuery, onSearchChange,
  statusFilter, onStatusChange,
  sortOrder, onSortChange,
  dropdownOpen, onDropdownToggle,
  dropdownRef,
  darkMode = false,
}) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">

      {/* Búsqueda */}
      <div className={`flex-1 rounded-2xl shadow-sm border flex items-center px-4 py-3 ${d('bg-white border-gray-100', 'bg-gray-800 border-gray-700')}`}>
        <Search size={18} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre, empresa o email..."
          className={`w-full bg-transparent border-none outline-none ml-3 text-sm placeholder:text-gray-400 ${d('text-gray-700', 'text-gray-200')}`}
        />
      </div>

      {/* Filtro de estado */}
      <div className="relative sm:min-w-[180px]" ref={dropdownRef}>
        <button
          onClick={onDropdownToggle}
          className={`w-full rounded-2xl shadow-sm border px-4 py-3 flex items-center justify-between gap-3 text-sm font-bold hover:border-blue-400 transition-colors ${d('bg-white border-gray-100 text-gray-700', 'bg-gray-800 border-gray-700 text-gray-200')}`}
        >
          <span className="flex items-center gap-2">
            {statusFilter !== 'Todos' && (
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT_COLOR[statusFilter]}`} />
            )}
            {statusFilter}
          </span>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && (
          <div className={`absolute right-0 top-full mt-2 w-full rounded-2xl shadow-lg border overflow-hidden z-10 ${d('bg-white border-gray-100', 'bg-gray-800 border-gray-700')}`}>
            {STATUS_OPTIONS.map(option => (
              <button key={option} onClick={() => onStatusChange(option)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${d('text-gray-700 hover:bg-slate-50', 'text-gray-200 hover:bg-gray-700')}`}>
                <span className="flex items-center gap-2">
                  {option !== 'Todos' && (
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT_COLOR[option]}`} />
                  )}
                  {option}
                </span>
                {statusFilter === option && <Check size={14} className="text-blue-500" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ordenar */}
      <select
        value={sortOrder}
        onChange={e => onSortChange(e.target.value)}
        className={`rounded-2xl shadow-sm border px-4 py-3 text-sm font-bold outline-none hover:border-blue-400 transition-colors cursor-pointer ${d('bg-white border-gray-100 text-gray-700', 'bg-gray-800 border-gray-700 text-gray-200')}`}
      >
        <option value="recientes">Más recientes</option>
        <option value="antiguos">Más antiguos</option>
        <option value="az">A → Z</option>
        <option value="valor_desc">Mayor valor</option>
        <option value="valor_asc">Menor valor</option>
      </select>

    </div>
  );
};
