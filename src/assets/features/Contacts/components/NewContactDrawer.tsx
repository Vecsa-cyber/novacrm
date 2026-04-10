import React from 'react';
import { X } from 'lucide-react';
import { EDIT_STATUS_OPTIONS } from '../constants/contacts.constants';
import type { NewContactForm } from '../types/contacts';

interface NewContactDrawerProps {
  form: NewContactForm;
  onChangeField: (k: keyof NewContactForm, v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  darkMode?: boolean;
}

export const NewContactDrawer: React.FC<NewContactDrawerProps> = ({
  form, onChangeField, onSubmit, onClose, darkMode = false,
}) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;

  const fieldCls = `border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors ${
    d('border-gray-200 text-gray-800 bg-white', 'border-gray-600 text-gray-100 bg-gray-700 placeholder:text-gray-500')
  }`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md h-full shadow-2xl flex flex-col overflow-y-auto ${d('bg-white', 'bg-gray-800')}`}>

        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${d('border-gray-100', 'border-gray-700')}`}>
          <div>
            <h2 className={`text-xl font-black ${d('text-slate-800', 'text-white')}`}>Nuevo contacto</h2>
            <p className={`text-sm mt-0.5 ${d('text-slate-400', 'text-gray-400')}`}>Completa los datos del contacto</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors text-gray-400 ${d('hover:bg-gray-100', 'hover:bg-gray-700')}`}>
            <X size={20} />
          </button>
        </div>

        {/* Campos */}
        <div className="flex flex-col gap-5 p-6 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Nombre</label>
              <input type="text" placeholder="Ej. Laura" value={form.nombre}
                onChange={e => onChangeField('nombre', e.target.value)} className={fieldCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Apellido</label>
              <input type="text" placeholder="Ej. Méndez" value={form.apellido}
                onChange={e => onChangeField('apellido', e.target.value)} className={fieldCls} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Empresa</label>
            <input type="text" placeholder="Ej. Grupo Alfa" value={form.company}
              onChange={e => onChangeField('company', e.target.value)} className={fieldCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Email</label>
            <input type="email" placeholder="correo@empresa.com" value={form.email}
              onChange={e => onChangeField('email', e.target.value)} className={fieldCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Teléfono</label>
            <input type="tel" placeholder="81-0000-0000" value={form.phone}
              onChange={e => onChangeField('phone', e.target.value)} className={fieldCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Estado</label>
            <select value={form.status} onChange={e => onChangeField('status', e.target.value)}
              className={fieldCls}>
              <option value="">Seleccionar estado</option>
              {EDIT_STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Valor estimado</label>
            <input
              type="text"
              placeholder="$0"
              value={form.value}
              onChange={e => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                onChangeField('value', raw ? '$' + Number(raw).toLocaleString('en-US') : '');
              }}
              className={fieldCls}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t flex gap-3 ${d('border-gray-100', 'border-gray-700')}`}>
          <button onClick={onClose}
            className={`flex-1 border font-bold py-2.5 rounded-xl transition-colors text-sm ${d('border-gray-200 text-gray-600 hover:bg-gray-50', 'border-gray-600 text-gray-300 hover:bg-gray-700')}`}>
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.nombre}
            className="flex-1 bg-emerald-500 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-600 transition-colors text-sm disabled:opacity-40">
            Guardar contacto
          </button>
        </div>

      </div>
    </div>
  );
};
