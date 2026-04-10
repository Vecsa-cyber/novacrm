import React from 'react';
import { X, ClipboardList, AlertCircle, RefreshCw, Calendar } from 'lucide-react';
import { TIPOS_MANT, PRIORIDADES, ESTADOS_OT, PERIODICIDADES } from '../hooks/useGMAOOrdenes';
import type { OrdenForm, CatalogoActividad } from '../hooks/useGMAOOrdenes';

interface Props {
  form: OrdenForm;
  activos:  { id_activo: number; nombre_activo: string; tag_activo: string }[];
  usuarios: { id_usuario: number; nombre: string }[];
  catalogo: CatalogoActividad[];
  onField:  (k: keyof OrdenForm, v: string) => void;
  onSubmit: () => void;
  onClose:  () => void;
  saving?:  boolean;
  error?:   string | null;
  darkMode?: boolean;
  title?:   string;
}

export const GMAOOrdenDrawer: React.FC<Props> = ({
  form, activos, usuarios, catalogo, onField, onSubmit, onClose,
  saving = false, error = null, darkMode = false, title = 'Nueva Orden de Trabajo',
}) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;
  const inputCls = `w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400/20 transition-colors ${d('border-gray-200 text-gray-800 bg-white', 'border-gray-600 text-gray-100 bg-gray-700')}`;
  const labelCls = `text-xs font-bold mb-1 block ${d('text-gray-500', 'text-gray-400')}`;
  const sectionCls = `text-[10px] font-black uppercase tracking-wider mb-3 ${d('text-slate-400', 'text-gray-500')}`;

  const isPreventivo = form.tipo_mantenimiento === 'Preventivo';

  // Filtra catálogo según el tipo seleccionado (muestra todos si no es preventivo)
  const catalogoFiltrado = catalogo.filter(c =>
    !c.tipo_mantenimiento || c.tipo_mantenimiento === form.tipo_mantenimiento
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg shadow-2xl flex flex-col ${d('bg-white', 'bg-gray-900')}`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b flex-shrink-0 ${d('border-gray-100', 'border-gray-700')}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${d('bg-orange-50', 'bg-orange-900/30')}`}>
              <ClipboardList size={18} className="text-orange-500" />
            </div>
            <h2 className={`text-lg font-black ${d('text-slate-800', 'text-white')}`}>{title}</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${d('hover:bg-gray-100 text-gray-400', 'hover:bg-gray-700 text-gray-500')}`}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Identificación */}
          <div>
            <p className={sectionCls}>Identificación</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Folio <span className={`font-normal ${d('text-gray-400','text-gray-500')}`}>(auto si vacío)</span></label>
                <input value={form.folio} onChange={e => onField('folio', e.target.value.toUpperCase())}
                  placeholder="OT-2026-XXXXXX" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Activo</label>
                <select value={form.id_activo} onChange={e => onField('id_activo', e.target.value)} className={inputCls}>
                  <option value="">Sin activo</option>
                  {activos.map(a => (
                    <option key={a.id_activo} value={a.id_activo}>
                      {a.tag_activo ? `${a.tag_activo} · ` : ''}{a.nombre_activo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Clasificación */}
          <div>
            <p className={sectionCls}>Clasificación</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Tipo <span className="text-red-400">*</span></label>
                <select value={form.tipo_mantenimiento} onChange={e => onField('tipo_mantenimiento', e.target.value)} className={inputCls}>
                  {TIPOS_MANT.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Prioridad</label>
                <select value={form.prioridad} onChange={e => onField('prioridad', e.target.value)} className={inputCls}>
                  {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Estado</label>
                <select value={form.estado_ot} onChange={e => onField('estado_ot', e.target.value)} className={inputCls}>
                  {ESTADOS_OT.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── PERIODICIDAD (solo Preventivo) ── */}
          {isPreventivo && (
            <div className={`rounded-xl p-4 border ${d('bg-blue-50/60 border-blue-100', 'bg-blue-900/10 border-blue-800/30')}`}>
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw size={14} className={d('text-blue-500', 'text-blue-400')} />
                <p className={`text-[10px] font-black uppercase tracking-wider ${d('text-blue-500', 'text-blue-400')}`}>Periodicidad</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={form.periodicidad === '0' ? '' : 'col-span-2'}>
                  <label className={labelCls}>Frecuencia <span className="text-red-400">*</span></label>
                  <select value={form.periodicidad} onChange={e => onField('periodicidad', e.target.value)} className={inputCls}>
                    <option value="">Seleccionar...</option>
                    {PERIODICIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                {form.periodicidad === '0' && (
                  <div>
                    <label className={labelCls}>Días personalizados</label>
                    <input
                      type="number" min="1" max="3650"
                      value={form.periodicidad_custom}
                      onChange={e => onField('periodicidad_custom', e.target.value)}
                      placeholder="Ej: 45"
                      className={inputCls}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── FECHA PROGRAMADA (Correctivo / Predictivo) ── */}
          {!isPreventivo && (
            <div>
              <p className={sectionCls}>Fechas</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> Fecha programada
                    </span>
                  </label>
                  <input type="datetime-local" value={form.fecha_programada}
                    onChange={e => onField('fecha_programada', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Fecha cierre</label>
                  <input type="date" value={form.fecha_cierre}
                    onChange={e => onField('fecha_cierre', e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {/* ── FECHA CIERRE para Preventivo (sin fecha programada) ── */}
          {isPreventivo && (
            <div>
              <label className={labelCls}>Fecha cierre</label>
              <input type="date" value={form.fecha_cierre}
                onChange={e => onField('fecha_cierre', e.target.value)} className={inputCls} />
            </div>
          )}

          {/* Catálogo de actividades */}
          <div>
            <p className={sectionCls}>Actividad del catálogo</p>
            <select value={form.id_actividad} onChange={e => onField('id_actividad', e.target.value)} className={inputCls}>
              <option value="">Sin actividad asignada</option>
              {catalogoFiltrado.map(c => (
                <option key={c.id_actividad} value={c.id_actividad}>{c.nombre}</option>
              ))}
            </select>
            {catalogoFiltrado.length === 0 && (
              <p className={`text-xs mt-1 ${d('text-gray-400','text-gray-500')}`}>
                No hay actividades en el catálogo para este tipo. Puedes agregar desde configuración.
              </p>
            )}
          </div>

          {/* Personal */}
          <div>
            <p className={sectionCls}>Personal asignado</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Técnico</label>
                <select value={form.id_tecnico} onChange={e => onField('id_tecnico', e.target.value)} className={inputCls}>
                  <option value="">Sin asignar</option>
                  {usuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Supervisor</label>
                <select value={form.id_supervisor} onChange={e => onField('id_supervisor', e.target.value)} className={inputCls}>
                  <option value="">Sin asignar</option>
                  {usuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <p className={sectionCls}>Detalle técnico</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelCls}>Descripción de la falla</label>
                <textarea rows={3} value={form.descripcion_falla}
                  onChange={e => onField('descripcion_falla', e.target.value)}
                  placeholder="Describe el problema o falla detectada..."
                  className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>Acciones realizadas</label>
                <textarea rows={3} value={form.acciones_realizadas}
                  onChange={e => onField('acciones_realizadas', e.target.value)}
                  placeholder="Describe las acciones ejecutadas..."
                  className={`${inputCls} resize-none`} />
              </div>
            </div>
          </div>
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
          <button onClick={onSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving ? 'Guardando...' : 'Guardar OT'}
          </button>
        </div>

      </div>
    </>
  );
};
