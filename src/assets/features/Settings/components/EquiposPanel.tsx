import React, { useState, useEffect, useMemo } from 'react';
import { Wrench, Plus, Pencil, Trash2, Check, X, ChevronRight } from 'lucide-react';
import { apiFetch } from '../../../../lib/apiFetch';
import { emptyEquipoForm, fmtMXN } from '../constants/settings.constants';
import type { Equipo } from '../types/settings.d';

interface EquiposPanelProps {
  darkMode?: boolean;
}

export const EquiposPanel: React.FC<EquiposPanelProps> = ({ darkMode = false }) => {
  const [equipos,       setEquipos]       = useState<Equipo[]>([]);
  const [busqueda,      setBusqueda]      = useState('');
  const [expandedId,    setExpandedId]    = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [drawerMode,    setDrawerMode]    = useState<'new' | 'edit'>('new');
  const [editingId,     setEditingId]     = useState<number | null>(null);
  const [form,          setForm]          = useState({ ...emptyEquipoForm });
  const [saving,        setSaving]        = useState(false);

  const d = (light: string, dark: string) => darkMode ? dark : light;

  const cargar = () =>
    apiFetch('/api/equipos').then(r => r.json()).then(setEquipos).catch(console.error);

  useEffect(() => { cargar(); }, []);

  const equiposFiltrados = useMemo(() =>
    equipos.filter(e =>
      e.nombre_equipo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (e.tag ?? '').toLowerCase().includes(busqueda.toLowerCase())
    ),
  [equipos, busqueda]);

  const setField = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const openNew = () => {
    setForm({ ...emptyEquipoForm });
    setDrawerMode('new');
    setEditingId(null);
    setDrawerOpen(true);
  };

  const openEdit = (e: Equipo) => {
    setForm({
      tag: e.tag ?? '', nombre_equipo: e.nombre_equipo ?? '', tipo: e.tipo ?? '',
      flujo_referencia: e.flujo_referencia ?? '', unidad: e.unidad ?? 'GPM',
      costo: e.costo ?? '', factor_n: e.factor_n ?? '',
      proveedor: e.proveedor ?? '', notas: e.notas ?? '',
    });
    setDrawerMode('edit');
    setEditingId(e.id_equipo);
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.nombre_equipo.toString().trim()) return;
    setSaving(true);
    const body = JSON.stringify({
      ...form,
      flujo_referencia: Number(form.flujo_referencia) || 0,
      costo:            Number(form.costo) || 0,
      factor_n:         Number(form.factor_n) || 0,
    });
    if (drawerMode === 'new') {
      await apiFetch('/api/equipos', { method: 'POST', body });
    } else if (editingId !== null) {
      await apiFetch(`/api/equipos/${editingId}`, { method: 'PUT', body });
    }
    setSaving(false);
    setDrawerOpen(false);
    cargar();
  };

  const deleteEquipo = async (id: number) => {
    await apiFetch(`/api/equipos/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    if (expandedId === id) setExpandedId(null);
    cargar();
  };

  const drawerInputCls = d(
    'border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-amber-400 transition-colors',
    'border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-100 bg-gray-700 outline-none focus:border-amber-400 transition-colors'
  );

  return (
    <div className="flex flex-col gap-4">

      {/* Barra: buscador + botón */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar equipo o tag..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-amber-400 transition-colors ${d('border-gray-200 text-gray-800', 'border-gray-600 text-gray-100 bg-gray-700')}`}
          />
          <Wrench size={15} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={14} /> Nuevo equipo
        </button>
      </div>

      <p className={`text-xs font-medium ${d('text-slate-400', 'text-gray-500')}`}>
        {equiposFiltrados.length} de {equipos.length} equipo{equipos.length !== 1 ? 's' : ''}
      </p>

      {/* Lista */}
      <div className={`border rounded-2xl overflow-hidden shadow-sm ${d('bg-white border-gray-100', 'bg-gray-800/50 border-gray-700')}`}>
        <div className={`hidden sm:grid sm:grid-cols-[3rem_1fr_1fr_auto] gap-4 px-5 py-3 border-b text-xs font-bold uppercase tracking-wide ${d('bg-gray-50 border-gray-100 text-gray-400', 'bg-gray-900/50 border-gray-700 text-gray-500')}`}>
          <span>TAG</span><span>Nombre</span><span>Tipo</span><span />
        </div>

        {equiposFiltrados.length === 0 ? (
          <p className={`text-center text-sm py-10 ${d('text-gray-400', 'text-gray-500')}`}>
            {busqueda ? 'Sin resultados para esa búsqueda' : 'Sin equipos registrados'}
          </p>
        ) : (
          <div className={`divide-y ${d('divide-gray-100', 'divide-gray-700')}`}>
            {equiposFiltrados.map(e => {
              const isExpanded = expandedId === e.id_equipo;
              return (
                <React.Fragment key={e.id_equipo}>
                  <div
                    className={`grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[3rem_1fr_1fr_auto] gap-4 px-5 py-3 items-center cursor-pointer transition-colors select-none ${d('hover:bg-amber-50/40', 'hover:bg-amber-900/10')}`}
                    onClick={() => setExpandedId(isExpanded ? null : e.id_equipo)}
                  >
                    <span className="text-xs font-bold text-amber-500 truncate">{e.tag || '—'}</span>
                    <span className={`text-sm font-semibold truncate ${d('text-slate-700', 'text-gray-200')}`}>{e.nombre_equipo}</span>
                    <span className={`hidden sm:block text-xs truncate ${d('text-gray-400', 'text-gray-500')}`}>{e.tipo || '—'}</span>
                    <ChevronRight size={15} className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90 text-amber-400' : d('text-gray-300', 'text-gray-600')}`} />
                  </div>

                  {isExpanded && (
                    <div className={`px-5 py-4 border-t ${d('bg-amber-50/30 border-amber-100', 'bg-amber-900/10 border-amber-800/30')}`}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3 mb-4">
                        {[
                          { label: 'TAG',              value: e.tag || '—' },
                          { label: 'Tipo',             value: e.tipo || '—' },
                          { label: 'Flujo Referencia', value: e.flujo_referencia ? `${e.flujo_referencia} ${e.unidad}` : '—' },
                          { label: 'Costo Referencia', value: fmtMXN(e.costo) },
                          { label: 'Factor N',         value: e.factor_n ?? '—' },
                          { label: 'Proveedor',        value: e.proveedor || '—' },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${d('text-gray-400', 'text-gray-500')}`}>{label}</p>
                            <p className={`text-sm font-semibold ${d('text-slate-700', 'text-gray-200')}`}>{value}</p>
                          </div>
                        ))}
                        {e.notas && (
                          <div className="col-span-2 sm:col-span-3 md:col-span-4">
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${d('text-gray-400', 'text-gray-500')}`}>Notas</p>
                            <p className={`text-sm ${d('text-slate-600', 'text-gray-300')}`}>{e.notas}</p>
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center gap-2 pt-3 border-t ${d('border-amber-100', 'border-amber-800/30')}`}>
                        <button
                          onClick={ev => { ev.stopPropagation(); openEdit(e); }}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-amber-600 bg-amber-100 hover:bg-amber-200 transition-colors"
                        >
                          <Pencil size={12} /> Editar
                        </button>
                        {confirmDelete === e.id_equipo ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-red-500">¿Eliminar?</span>
                            <button onClick={ev => { ev.stopPropagation(); deleteEquipo(e.id_equipo); }} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Check size={13} /></button>
                            <button onClick={ev => { ev.stopPropagation(); setConfirmDelete(null); }} className={`p-1.5 rounded-lg ${d('bg-gray-50 text-gray-400 hover:bg-gray-100', 'bg-gray-700 text-gray-400 hover:bg-gray-600')}`}><X size={13} /></button>
                          </div>
                        ) : (
                          <button
                            onClick={ev => { ev.stopPropagation(); setConfirmDelete(e.id_equipo); }}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={12} /> Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer nuevo / editar equipo */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className={`relative w-full max-w-md h-full shadow-2xl flex flex-col ${d('bg-white', 'bg-gray-900')}`}>
            <div className={`flex items-center justify-between p-6 border-b ${d('border-gray-100', 'border-gray-700')}`}>
              <div>
                <h2 className={`text-xl font-black ${d('text-slate-800', 'text-white')}`}>{drawerMode === 'new' ? 'Nuevo equipo' : 'Editar equipo'}</h2>
                <p className={`text-sm mt-0.5 ${d('text-slate-400', 'text-gray-400')}`}>{drawerMode === 'new' ? 'Agrega un nuevo equipo al catálogo' : 'Modifica los datos del equipo'}</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className={`p-2 rounded-xl transition-colors ${d('hover:bg-gray-100 text-gray-400', 'hover:bg-gray-800 text-gray-500')}`}><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-4 p-6 flex-1 overflow-y-auto">
              {([
                { key: 'nombre_equipo', label: 'Nombre del equipo *', placeholder: 'Ej. Osmosis Inversa', type: 'text' },
                { key: 'tag',          label: 'TAG',                  placeholder: 'Ej. OI-25',          type: 'text' },
                { key: 'tipo',         label: 'Tipo',                 placeholder: 'Ej. Filtración',     type: 'text' },
                { key: 'proveedor',    label: 'Proveedor',            placeholder: 'Ej. Hydranautics',   type: 'text' },
              ] as const).map(({ key, label, placeholder, type }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>{label}</label>
                  <input
                    autoFocus={key === 'nombre_equipo'}
                    type={type}
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={ev => setField(key, ev.target.value)}
                    className={drawerInputCls}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Flujo Referencia</label>
                  <input type="number" placeholder="Ej. 25" value={form.flujo_referencia} onChange={ev => setField('flujo_referencia', ev.target.value)} className={drawerInputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Unidad</label>
                  <input type="text" placeholder="Ej. GPM" value={form.unidad} onChange={ev => setField('unidad', ev.target.value)} className={drawerInputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Costo Referencia (MXN)</label>
                  <input type="number" placeholder="Ej. 453125" value={form.costo} onChange={ev => setField('costo', ev.target.value)} className={drawerInputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Factor N</label>
                  <input type="number" step="0.01" placeholder="Ej. 0.72" value={form.factor_n} onChange={ev => setField('factor_n', ev.target.value)} className={drawerInputCls} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Notas</label>
                <textarea rows={3} placeholder="Observaciones adicionales..." value={form.notas} onChange={ev => setField('notas', ev.target.value)} className={`${drawerInputCls} resize-none`} />
              </div>
            </div>
            <div className={`p-6 border-t flex gap-3 ${d('border-gray-100', 'border-gray-700')}`}>
              <button onClick={() => setDrawerOpen(false)} className={`flex-1 border font-bold py-2.5 rounded-xl text-sm transition-colors ${d('border-gray-200 text-gray-600 hover:bg-gray-50', 'border-gray-600 text-gray-300 hover:bg-gray-800')}`}>Cancelar</button>
              <button
                onClick={handleSubmit}
                disabled={!form.nombre_equipo.toString().trim() || saving}
                className="flex-1 bg-amber-500 text-white font-bold py-2.5 rounded-xl hover:bg-amber-600 text-sm disabled:opacity-40"
              >
                {saving ? 'Guardando...' : drawerMode === 'new' ? 'Crear equipo' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
