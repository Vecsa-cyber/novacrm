import React from 'react';
import { X, Box, AlertCircle } from 'lucide-react';
import { ESTADOS_ACTIVO } from '../hooks/useGMAOActivos';
import type { ActivoForm } from '../hooks/useGMAOActivos';

interface Props {
  form: ActivoForm;
  plantas: { id_planta: number; nombre_planta: string }[];
  equipos: { id_equipo: number; nombre_equipo: string }[];
  onField: (k: keyof ActivoForm, v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  saving?: boolean;
  error?: string | null;
  darkMode?: boolean;
  title?: string;
}

export const GMAOActivoDrawer: React.FC<Props> = ({
  form, plantas, equipos, onField, onSubmit, onClose,
  saving = false, error = null, darkMode = false, title = 'Nuevo Activo',
}) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;
  const inputCls = `w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400/20 transition-colors ${d('border-gray-200 text-gray-800 bg-white', 'border-gray-600 text-gray-100 bg-gray-700')}`;
  const labelCls = `text-xs font-bold mb-1 block ${d('text-gray-500', 'text-gray-400')}`;

  const estadoColors: Record<string, string> = {
    'Operativo':    'bg-emerald-50 text-emerald-600 border-emerald-200',
    'En Reparación':'bg-amber-50 text-amber-600 border-amber-200',
    'Baja':         'bg-red-50 text-red-500 border-red-200',
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-2xl flex flex-col ${d('bg-white', 'bg-gray-900')}`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b flex-shrink-0 ${d('border-gray-100', 'border-gray-700')}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${d('bg-cyan-50', 'bg-cyan-900/30')}`}>
              <Box size={18} className="text-cyan-500" />
            </div>
            <h2 className={`text-lg font-black ${d('text-slate-800', 'text-white')}`}>{title}</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${d('hover:bg-gray-100 text-gray-400', 'hover:bg-gray-700 text-gray-500')}`}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

          {/* Tag + Nombre */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>TAG / Código</label>
              <input value={form.tag_activo} onChange={e => onField('tag_activo', e.target.value.toUpperCase())}
                placeholder="Ej. FIL-001" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select value={form.estado_activo} onChange={e => onField('estado_activo', e.target.value)} className={inputCls}>
                {ESTADOS_ACTIVO.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Nombre del Activo <span className="text-red-400">*</span></label>
            <input value={form.nombre_activo} onChange={e => onField('nombre_activo', e.target.value)}
              placeholder="Ej. Caldera Industrial CB-200" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Modelo</label>
              <input value={form.modelo} onChange={e => onField('modelo', e.target.value)}
                placeholder="Ej. CB-200" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Número de serie</label>
              <input value={form.serie} onChange={e => onField('serie', e.target.value)}
                placeholder="Ej. SN-2024-001" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Planta / Ubicación</label>
            <select value={form.id_planta} onChange={e => onField('id_planta', e.target.value)} className={inputCls}>
              <option value="">Sin planta asignada</option>
              {plantas.map(p => <option key={p.id_planta} value={p.id_planta}>{p.nombre_planta}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Fecha de instalación</label>
            <input type="date" value={form.fecha_instalacion} onChange={e => onField('fecha_instalacion', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Equipo del catálogo <span className={`font-normal ${d('text-gray-400','text-gray-500')}`}>(opcional)</span></label>
            <select value={form.id_equipo_catalogo} onChange={e => onField('id_equipo_catalogo', e.target.value)} className={inputCls}>
              <option value="">Sin relación al catálogo</option>
              {equipos.map(e => <option key={e.id_equipo} value={e.id_equipo}>{e.nombre_equipo}</option>)}
            </select>
          </div>

          {/* Preview estado */}
          {form.estado_activo && (
            <div className={`text-xs font-bold px-3 py-2 rounded-xl border w-fit ${estadoColors[form.estado_activo] ?? ''}`}>
              Estado: {form.estado_activo}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-2 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer */}
        <div className={`flex items-center gap-3 px-6 py-4 border-t flex-shrink-0 ${d('border-gray-100', 'border-gray-700')}`}>
          <button onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${d('bg-gray-100 text-gray-600 hover:bg-gray-200', 'bg-gray-700 text-gray-300 hover:bg-gray-600')}`}>
            Cancelar
          </button>
          <button onClick={onSubmit} disabled={saving || !form.nombre_activo.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

      </div>
    </>
  );
};
