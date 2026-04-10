import React from 'react';
import { Box, Plus, Search, Pencil, Trash2, Check, X, ChevronDown } from 'lucide-react';
import { useGMAOActivos, ESTADOS_ACTIVO } from '../hooks/useGMAOActivos';
import { GMAOActivoDrawer } from '../components/GMAOActivoDrawer';
import type { GMAOProps } from '../types/gmao.d';

const estadoBadge = (e: string, dark: boolean) => {
  const d = (l: string, k: string) => dark ? k : l;
  if (e === 'Operativo')     return d('bg-emerald-50 text-emerald-600 border border-emerald-100', 'bg-emerald-900/20 text-emerald-400 border border-emerald-800/30');
  if (e === 'En Reparación') return d('bg-amber-50 text-amber-600 border border-amber-100',       'bg-amber-900/20 text-amber-400 border border-amber-800/30');
  return                            d('bg-red-50 text-red-500 border border-red-100',              'bg-red-900/20 text-red-400 border border-red-800/30');
};

export const GMAOActivosView: React.FC<GMAOProps> = ({ darkMode = false }) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;
  const a = useGMAOActivos();

  const cardCls     = `rounded-2xl md:rounded-[2rem] shadow-soft border ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`;
  const inputCls    = `w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/20 transition-colors ${d('border-gray-200 text-gray-800 bg-white', 'border-gray-600 text-gray-100 bg-gray-700')}`;
  const selectCls   = `border rounded-xl pl-3 pr-7 py-2 text-sm appearance-none outline-none cursor-pointer transition-colors ${d('border-gray-200 text-gray-700 bg-white', 'border-gray-600 text-gray-200 bg-gray-700')}`;
  const thCls       = `text-[10px] font-black uppercase tracking-wider px-4 py-3 text-left ${d('text-gray-400', 'text-gray-500')}`;
  const tdCls       = `px-4 py-3 text-sm ${d('text-slate-700', 'text-gray-200')}`;
  const editInpCls  = `w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/20 ${d('border-gray-200 bg-white text-gray-800', 'border-gray-600 bg-gray-700 text-gray-100')}`;

  return (
    <div className="flex flex-col gap-6 fade-in pb-24 px-2 sm:px-0">

      {/* ── ENCABEZADO ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Box className={`flex-shrink-0 ${d('text-slate-700', 'text-gray-200')}`} size={28} />
          <div>
            <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${d('text-slate-800', 'text-white')}`}>Activos</h1>
            <p className={`text-sm font-medium mt-0.5 ${d('text-slate-400', 'text-gray-400')}`}>
              {a.total} activo{a.total !== 1 ? 's' : ''} registrado{a.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => a.setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-cyan-500 text-white hover:bg-cyan-600 shadow-soft hover:-translate-y-0.5 transition-all"
        >
          <Plus size={16} /> Nuevo Activo
        </button>
      </div>

      {/* ── DRAWER NUEVO ── */}
      {a.drawerOpen && (
        <GMAOActivoDrawer
          form={a.form} plantas={a.plantas} equipos={a.equipos}
          onField={a.setField} onSubmit={a.submitNuevo}
          onClose={() => { a.setDrawerOpen(false); a.setError(null); }}
          saving={a.saving} error={a.error} darkMode={darkMode}
        />
      )}

      {/* ── MODAL ELIMINAR ── */}
      {a.deleteId !== null && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => a.setDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 ${d('bg-white', 'bg-gray-800')}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${d('bg-red-50', 'bg-red-900/20')}`}>
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className={`text-lg font-black text-center mb-1 ${d('text-slate-800', 'text-white')}`}>Eliminar activo</h3>
              <p className={`text-sm text-center mb-5 ${d('text-slate-400', 'text-gray-400')}`}>Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={() => a.setDeleteId(null)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${d('bg-gray-100 text-gray-600 hover:bg-gray-200', 'bg-gray-700 text-gray-300 hover:bg-gray-600')}`}>
                  Cancelar
                </button>
                <button onClick={a.confirmDelete} disabled={a.saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors">
                  {a.saving ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── BUSCADOR + FILTRO ── */}
      <div className={`${cardCls} px-4 py-3 flex flex-col sm:flex-row gap-3`}>
        <div className="relative flex-1">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${d('text-gray-400', 'text-gray-500')}`} />
          <input type="text" placeholder="Buscar por nombre, TAG, modelo o planta..."
            value={a.search} onChange={e => a.setSearch(e.target.value)}
            className={`${inputCls} pl-9`} />
        </div>
        <div className="relative flex-shrink-0">
          <select value={a.filtroEstado} onChange={e => a.setFiltroEstado(e.target.value)} className={selectCls}>
            <option value="todos">Todos los estados</option>
            {ESTADOS_ACTIVO.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <ChevronDown size={13} className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 ${d('text-gray-400','text-gray-500')}`} />
        </div>
      </div>

      {/* ── TABLA ── */}
      <div className={`${cardCls} overflow-hidden`}>
        {a.loading ? (
          <div className={`text-center py-16 text-sm ${d('text-gray-400', 'text-gray-500')}`}>Cargando activos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className={`border-b ${d('border-gray-50 bg-gray-50/50', 'border-gray-700 bg-gray-900/30')}`}>
                  {['TAG','Nombre del Activo','Modelo','Serie','Planta','Instalación','Estado',''].map(h => (
                    <th key={h} className={thCls}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${d('divide-gray-50', 'divide-gray-700/60')}`}>
                {a.filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className={`text-center py-12 text-sm ${d('text-gray-400', 'text-gray-500')}`}>
                      {a.search || a.filtroEstado !== 'todos' ? 'Sin resultados.' : 'No hay activos registrados.'}
                    </td>
                  </tr>
                )}
                {a.filtered.map(activo => {
                  const isEditing = a.editingId === activo.id_activo;
                  return (
                    <tr key={activo.id_activo} className={`transition-colors ${d('hover:bg-gray-50/60', 'hover:bg-gray-700/30')}`}>

                      {/* TAG */}
                      <td className={`${tdCls} font-mono font-bold text-cyan-500`}>
                        {isEditing
                          ? <input value={a.editDraft.tag_activo} onChange={e => a.setEditField('tag_activo', e.target.value.toUpperCase())} className={editInpCls} />
                          : activo.tag_activo || <span className={d('text-gray-300','text-gray-600')}>—</span>
                        }
                      </td>

                      {/* Nombre */}
                      <td className={`${tdCls} font-semibold`}>
                        {isEditing
                          ? <input value={a.editDraft.nombre_activo} onChange={e => a.setEditField('nombre_activo', e.target.value)} className={editInpCls} />
                          : activo.nombre_activo
                        }
                      </td>

                      {/* Modelo */}
                      <td className={tdCls}>
                        {isEditing
                          ? <input value={a.editDraft.modelo} onChange={e => a.setEditField('modelo', e.target.value)} className={editInpCls} />
                          : activo.modelo || <span className={d('text-gray-300','text-gray-600')}>—</span>
                        }
                      </td>

                      {/* Serie */}
                      <td className={tdCls}>
                        {isEditing
                          ? <input value={a.editDraft.serie} onChange={e => a.setEditField('serie', e.target.value)} className={editInpCls} />
                          : activo.serie || <span className={d('text-gray-300','text-gray-600')}>—</span>
                        }
                      </td>

                      {/* Planta */}
                      <td className={tdCls}>
                        {isEditing ? (
                          <select value={a.editDraft.id_planta} onChange={e => a.setEditField('id_planta', e.target.value)} className={editInpCls}>
                            <option value="">—</option>
                            {a.plantas.map(p => <option key={p.id_planta} value={p.id_planta}>{p.nombre_planta}</option>)}
                          </select>
                        ) : activo.nombre_planta ? (
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${d('bg-blue-50 text-blue-600','bg-blue-900/20 text-blue-400')}`}>
                            {activo.nombre_planta}
                          </span>
                        ) : <span className={d('text-gray-300','text-gray-600')}>—</span>}
                      </td>

                      {/* Fecha instalación */}
                      <td className={`${tdCls} whitespace-nowrap`}>
                        {isEditing
                          ? <input type="date" value={a.editDraft.fecha_instalacion} onChange={e => a.setEditField('fecha_instalacion', e.target.value)} className={editInpCls} />
                          : activo.fecha_instalacion ? activo.fecha_instalacion.slice(0,10) : <span className={d('text-gray-300','text-gray-600')}>—</span>
                        }
                      </td>

                      {/* Estado */}
                      <td className={tdCls}>
                        {isEditing ? (
                          <select value={a.editDraft.estado_activo} onChange={e => a.setEditField('estado_activo', e.target.value)} className={editInpCls}>
                            {ESTADOS_ACTIVO.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                        ) : (
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${estadoBadge(activo.estado_activo, darkMode)}`}>
                            {activo.estado_activo}
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className={`${tdCls} whitespace-nowrap`}>
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={a.submitEdit} disabled={a.saving}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                              <Check size={14} />
                            </button>
                            <button onClick={a.cancelEdit}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${d('bg-gray-100 text-gray-500 hover:bg-gray-200','bg-gray-700 text-gray-400 hover:bg-gray-600')}`}>
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => a.startEdit(activo)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${d('hover:bg-cyan-50 text-gray-400 hover:text-cyan-500','hover:bg-cyan-900/20 text-gray-500 hover:text-cyan-400')}`}>
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => a.setDeleteId(activo.id_activo)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${d('hover:bg-red-50 text-gray-400 hover:text-red-500','hover:bg-red-900/20 text-gray-500 hover:text-red-400')}`}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
