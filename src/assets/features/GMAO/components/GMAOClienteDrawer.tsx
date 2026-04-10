import React from 'react';
import { X, Users, AlertCircle } from 'lucide-react';
import type { ClienteForm } from '../hooks/useGMAOClientes';

interface Props {
  form: ClienteForm;
  plantas: { id_planta: number; nombre_planta: string }[];
  onField: (k: keyof ClienteForm, v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  saving?: boolean;
  error?: string | null;
  darkMode?: boolean;
  title?: string;
}

export const GMAOClienteDrawer: React.FC<Props> = ({
  form, plantas, onField, onSubmit, onClose, saving = false, error = null, darkMode = false, title = 'Nuevo Cliente',
}) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;

  const inputCls = `w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400/20 transition-colors ${d('border-gray-200 text-gray-800 bg-white', 'border-gray-600 text-gray-100 bg-gray-700')}`;
  const labelCls = `text-xs font-bold mb-1 block ${d('text-gray-500', 'text-gray-400')}`;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-2xl flex flex-col ${d('bg-white', 'bg-gray-900')}`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b flex-shrink-0 ${d('border-gray-100', 'border-gray-700')}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${d('bg-blue-50', 'bg-blue-900/30')}`}>
              <Users size={18} className="text-blue-500" />
            </div>
            <h2 className={`text-lg font-black ${d('text-slate-800', 'text-white')}`}>{title}</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${d('hover:bg-gray-100 text-gray-400', 'hover:bg-gray-700 text-gray-500')}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <div>
            <label className={labelCls}>Razón Social <span className="text-red-400">*</span></label>
            <input
              value={form.nombre_fiscal}
              onChange={e => onField('nombre_fiscal', e.target.value)}
              placeholder="Ej. Aceros del Norte S.A. de C.V."
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>RFC</label>
            <input
              value={form.rfc}
              onChange={e => onField('rfc', e.target.value.toUpperCase())}
              placeholder="Ej. AND920415KL3"
              maxLength={13}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Contacto Principal</label>
            <input
              value={form.contacto_principal}
              onChange={e => onField('contacto_principal', e.target.value)}
              placeholder="Nombre del contacto"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Teléfono de Mantenimiento</label>
            <input
              value={form.telefono_mantenimiento}
              onChange={e => onField('telefono_mantenimiento', e.target.value)}
              placeholder="Ej. 81 1234 5678"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Planta / Sede</label>
            <select
              value={form.id_planta}
              onChange={e => onField('id_planta', e.target.value)}
              className={inputCls}
            >
              <option value="">Sin planta asignada</option>
              {plantas.map(p => (
                <option key={p.id_planta} value={p.id_planta}>{p.nombre_planta}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer */}
        <div className={`flex items-center gap-3 px-6 py-4 border-t flex-shrink-0 ${d('border-gray-100', 'border-gray-700')}`}>
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${d('bg-gray-100 text-gray-600 hover:bg-gray-200', 'bg-gray-700 text-gray-300 hover:bg-gray-600')}`}
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={saving || !form.nombre_fiscal.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

      </div>
    </>
  );
};
