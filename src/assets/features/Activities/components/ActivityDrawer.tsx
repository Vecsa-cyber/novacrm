import React from 'react';
import { X, ChevronDown, Check, Plus } from 'lucide-react';
import type { ActivityForm, CatalogoActividad, Planta, UsuarioBasic } from '../types/activities';

interface ActivityDrawerProps {
  form: ActivityForm;
  setField: (k: keyof ActivityForm, v: string) => void;
  saving: boolean;
  isAdmin: boolean;
  addingType: boolean;
  setAddingType: (v: boolean) => void;
  newType: string;
  setNewType: (v: string) => void;
  addType: () => void;
  catalogoActividades: CatalogoActividad[];
  plantas: Planta[];
  usuarios: UsuarioBasic[];
  onSubmit: () => void;
  onClose: () => void;
  darkMode?: boolean;
}

export const ActivityDrawer: React.FC<ActivityDrawerProps> = ({
  form, setField, saving, isAdmin,
  addingType, setAddingType, newType, setNewType, addType,
  catalogoActividades, plantas, usuarios,
  onSubmit, onClose, darkMode = false,
}) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;

  const selectCls = `w-full appearance-none border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors pr-9 ${
    d('border-gray-200 text-gray-800 bg-white', 'border-gray-600 text-gray-100 bg-gray-700')
  }`;
  const labelCls = `text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md h-full shadow-2xl flex flex-col overflow-y-auto ${d('bg-white', 'bg-gray-800')}`}>

        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${d('border-gray-100', 'border-gray-700')}`}>
          <div>
            <h2 className={`text-xl font-black ${d('text-slate-800', 'text-white')}`}>Nueva actividad</h2>
            <p className={`text-sm mt-0.5 ${d('text-slate-400', 'text-gray-400')}`}>Completa los datos de la actividad</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors text-gray-400 ${d('hover:bg-gray-100', 'hover:bg-gray-700')}`}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6 flex-1">

          {/* Tipo de actividad */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Tipo de actividad *</label>
            <div className="relative">
              <select value={form.id_catalogo} onChange={e => setField('id_catalogo', e.target.value)} className={selectCls}>
                <option value="">Seleccionar tipo...</option>
                {catalogoActividades.map(c => (
                  <option key={c.id_catalogo} value={c.id_catalogo}>{c.nombre_actividad}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>

            {isAdmin && (addingType ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  autoFocus
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addType(); if (e.key === 'Escape') setAddingType(false); }}
                  placeholder="Nuevo tipo..."
                  className={`flex-1 text-xs font-medium border rounded-lg px-3 py-2 outline-none focus:border-blue-400 ${d('bg-gray-50 border-gray-200 text-gray-800', 'bg-gray-700 border-gray-600 text-gray-100')}`}
                />
                <button onClick={addType} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Check size={14} /></button>
                <button onClick={() => setAddingType(false)} className={`p-1.5 text-gray-400 rounded-lg ${d('hover:bg-gray-100', 'hover:bg-gray-700')}`}><X size={14} /></button>
              </div>
            ) : (
              <button
                onClick={() => setAddingType(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors border border-blue-200 w-fit mt-1"
              >
                <Plus size={13} /> Agregar tipo
              </button>
            ))}
          </div>

          {/* Empresa / Planta */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Empresa / Planta</label>
            <div className="relative">
              <select value={form.id_planta} onChange={e => setField('id_planta', e.target.value)} className={selectCls}>
                <option value="">Seleccionar empresa...</option>
                {plantas.map(p => (
                  <option key={p.id_planta} value={p.id_planta}>{p.nombre_planta}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Usuario */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Usuario asignado</label>
            <div className="relative">
              <select value={form.id_usuario} onChange={e => setField('id_usuario', e.target.value)} className={selectCls}>
                <option value="">Seleccionar usuario...</option>
                {usuarios.map(u => (
                  <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Fecha */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Fecha *</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setField('date', e.target.value)}
              className={`border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors ${d('border-gray-200 text-gray-800 bg-white', 'border-gray-600 text-gray-100 bg-gray-700')}`}
            />
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
            disabled={!form.id_catalogo || !form.date || saving}
            className="flex-1 bg-emerald-500 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-600 transition-colors text-sm disabled:opacity-40"
          >
            {saving ? 'Guardando...' : 'Agregar actividad'}
          </button>
        </div>

      </div>
    </div>
  );
};
