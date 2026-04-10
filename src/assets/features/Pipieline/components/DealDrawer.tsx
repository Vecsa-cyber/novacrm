import React, { useState } from 'react';
import { X, ChevronDown, Calendar } from 'lucide-react';
import { addDaysToDate } from '../constants/pipeline.constants';
import type { Stage, Usuario, Planta, DealForm } from '../types/pipeline.d';

export interface DealDrawerProps {
  title: string;
  subtitle: string;
  form: DealForm;
  setField: (k: keyof DealForm, v: string) => void;
  stages: Stage[];
  usuarios: Usuario[];
  plantas: Planta[];
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  darkMode?: boolean;
}

export const DealDrawer: React.FC<DealDrawerProps> = ({
  title, subtitle, form, setField, stages, usuarios, plantas, saving, onClose, onSubmit, submitLabel, darkMode = false,
}) => {
  const [query,        setQuery]        = useState(form.company);
  const [showDropdown, setShowDropdown] = useState(false);

  const d = (light: string, dark: string) => darkMode ? dark : light;

  const suggestions = query.length > 0
    ? plantas.filter(p => p.nombre_planta.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  const fechaVenc = form.fecha ? addDaysToDate(form.fecha, 3) : null;
  const fechaVencLabel = fechaVenc
    ? new Date(fechaVenc + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  const fieldCls = `border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors ${
    d('border-gray-200 text-gray-800 bg-white', 'border-gray-600 text-gray-100 bg-gray-700 placeholder:text-gray-500')
  }`;
  const labelCls = `text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md h-full shadow-2xl flex flex-col overflow-y-auto ${d('bg-white', 'bg-gray-800')}`}>

        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${d('border-gray-100', 'border-gray-700')}`}>
          <div>
            <h2 className={`text-xl font-black ${d('text-slate-800', 'text-white')}`}>{title}</h2>
            <p className={`text-sm mt-0.5 ${d('text-slate-400', 'text-gray-400')}`}>{subtitle}</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors text-gray-400 ${d('hover:bg-gray-100', 'hover:bg-gray-700')}`}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6 flex-1">

          {/* Servicio */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Servicio</label>
            <input
              type="text"
              placeholder="Ej. Servicio correctivo, Póliza anual..."
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              className={fieldCls}
            />
          </div>

          {/* Compañía con autocomplete */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Compañía</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar o escribir empresa..."
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setField('company', e.target.value);
                  setField('id_planta', '');
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className={`w-full ${fieldCls}`}
              />
              {form.id_planta && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Planta vinculada
                </span>
              )}
              {showDropdown && suggestions.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-1 border rounded-xl shadow-lg z-10 overflow-hidden ${d('bg-white border-gray-200', 'bg-gray-700 border-gray-600')}`}>
                  {suggestions.map(p => (
                    <button
                      key={p.id_planta}
                      onMouseDown={() => {
                        setField('company', p.nombre_planta);
                        setField('id_planta', String(p.id_planta));
                        setQuery(p.nombre_planta);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${d('text-gray-700 hover:bg-blue-50 hover:text-blue-600', 'text-gray-200 hover:bg-gray-600 hover:text-blue-400')}`}
                    >
                      {p.nombre_planta}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Persona asignada */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Persona asignada</label>
            <div className="relative">
              <select
                value={form.id_usuario}
                onChange={e => setField('id_usuario', e.target.value)}
                className={`w-full appearance-none pr-9 ${fieldCls}`}
              >
                <option value="">Sin asignar</option>
                {usuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Presupuesto */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Costo / Presupuesto</label>
            <input
              type="text"
              placeholder="$0"
              value={form.value}
              onChange={e => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                if (!raw) { setField('value', ''); return; }
                setField('value', '$' + Number(raw).toLocaleString('en-US'));
              }}
              className={fieldCls}
            />
          </div>

          {/* Fecha visita */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Fecha de visita</label>
            <input
              type="date"
              value={form.fecha}
              onChange={e => setField('fecha', e.target.value)}
              className={fieldCls}
            />
            {fechaVencLabel && (
              <div className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 mt-1 ${d('bg-amber-50 border-amber-200', 'bg-amber-900/20 border-amber-700')}`}>
                <Calendar size={14} className="text-amber-500 flex-shrink-0" />
                <span className={`text-xs font-bold ${d('text-amber-700', 'text-amber-400')}`}>
                  Vencimiento automático: <span className="font-black">{fechaVencLabel}</span>
                </span>
              </div>
            )}
          </div>

          {/* Etapa */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Etapa</label>
            <div className="relative">
              <select
                value={form.stageId}
                onChange={e => setField('stageId', e.target.value)}
                className={`w-full appearance-none pr-9 ${fieldCls}`}
              >
                {stages.map((s, i) => <option key={s.id} value={s.id}>{i + 1}. {s.name}</option>)}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-6 border-t flex gap-3 ${d('border-gray-100', 'border-gray-700')}`}>
          <button
            onClick={onClose}
            className={`flex-1 border font-bold py-2.5 rounded-xl transition-colors text-sm ${d('border-gray-200 text-gray-600 hover:bg-gray-50', 'border-gray-600 text-gray-300 hover:bg-gray-700')}`}
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.title || !form.company || saving}
            className="flex-1 bg-emerald-500 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-600 transition-colors text-sm disabled:opacity-40"
          >
            {saving ? 'Guardando...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
