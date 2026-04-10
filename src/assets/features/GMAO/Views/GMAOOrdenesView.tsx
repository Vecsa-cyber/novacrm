import React from 'react';
import {
  ClipboardList, Plus, Search, Pencil, Trash2, Check, X,
  ChevronDown, AlertTriangle, Download, Eye,
} from 'lucide-react';
import { useGMAOOrdenes, ESTADOS_OT, PRIORIDADES, TIPOS_MANT } from '../hooks/useGMAOOrdenes';
import { GMAOOrdenDrawer } from '../components/GMAOOrdenDrawer';
import type { GMAOProps } from '../types/gmao.d';
import type { GMAOOrden } from '../hooks/useGMAOOrdenes';

// ── Helpers de color ──────────────────────────────────────────────────────────
const prioridadCls = (p: string, dark: boolean) => {
  const d = (l: string, k: string) => dark ? k : l;
  if (p === 'Crítica') return d('bg-red-100 text-red-600 border border-red-200',       'bg-red-900/20 text-red-400 border border-red-800/30');
  if (p === 'Alta')    return d('bg-orange-50 text-orange-600 border border-orange-200','bg-orange-900/20 text-orange-400 border border-orange-800/30');
  if (p === 'Media')   return d('bg-amber-50 text-amber-600 border border-amber-100',  'bg-amber-900/20 text-amber-400 border border-amber-800/30');
  return                      d('bg-gray-100 text-gray-500 border border-gray-200',    'bg-gray-700 text-gray-400 border border-gray-600');
};

const estadoCls = (e: string, dark: boolean) => {
  const d = (l: string, k: string) => dark ? k : l;
  if (e === 'Cerrada')               return d('bg-emerald-50 text-emerald-600',       'bg-emerald-900/20 text-emerald-400');
  if (e === 'En Proceso')            return d('bg-blue-50 text-blue-600',             'bg-blue-900/20 text-blue-400');
  if (e === 'Pendiente Repuestos')   return d('bg-purple-50 text-purple-600',         'bg-purple-900/20 text-purple-400');
  return                                    d('bg-gray-100 text-gray-500',            'bg-gray-700 text-gray-400');
};

const isVencida = (o: GMAOOrden) =>
  !!o.fecha_programada && new Date(o.fecha_programada) < new Date() && o.estado_ot !== 'Cerrada';

// ── Vista ─────────────────────────────────────────────────────────────────────
export const GMAOOrdenesView: React.FC<GMAOProps> = ({ darkMode = false }) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;
  const o = useGMAOOrdenes();

  const cardCls    = `rounded-2xl md:rounded-[2rem] shadow-soft border ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`;
  const inputCls   = `w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400/20 transition-colors ${d('border-gray-200 text-gray-800 bg-white', 'border-gray-600 text-gray-100 bg-gray-700')}`;
  const selectCls  = `border rounded-xl pl-3 pr-7 py-2 text-sm appearance-none outline-none cursor-pointer transition-colors ${d('border-gray-200 text-gray-700 bg-white', 'border-gray-600 text-gray-200 bg-gray-700')}`;
  const thCls      = `text-[10px] font-black uppercase tracking-wider px-4 py-3 text-left ${d('text-gray-400', 'text-gray-500')}`;
  const tdCls      = `px-4 py-3 text-sm ${d('text-slate-700', 'text-gray-200')}`;
  const editInpCls = `w-full border rounded-lg px-2 py-1.5 text-sm outline-none ${d('border-gray-200 bg-white text-gray-800', 'border-gray-600 bg-gray-700 text-gray-100')}`;

  return (
    <div className="flex flex-col gap-6 fade-in pb-24 px-2 sm:px-0">

      {/* ── ENCABEZADO ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList className={`flex-shrink-0 ${d('text-slate-700', 'text-gray-200')}`} size={28} />
          <div>
            <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${d('text-slate-800', 'text-white')}`}>
              Órdenes de Trabajo
            </h1>
            <p className={`text-sm font-medium mt-0.5 ${d('text-slate-400', 'text-gray-400')}`}>
              {o.total} OT{o.total !== 1 ? 's' : ''} registrada{o.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Exportar Excel (CSV) */}
          <button
            onClick={o.exportExcel}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors border ${d('border-gray-200 text-gray-600 hover:bg-gray-50', 'border-gray-600 text-gray-300 hover:bg-gray-700')}`}
          >
            <Download size={15} /> Exportar
          </button>
          <button
            onClick={() => o.setDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 shadow-soft hover:-translate-y-0.5 transition-all"
          >
            <Plus size={16} /> Nueva OT
          </button>
        </div>
      </div>

      {/* ── DRAWER NUEVA OT ── */}
      {o.drawerOpen && (
        <GMAOOrdenDrawer
          form={o.form} activos={o.activos} usuarios={o.usuarios}
          onField={o.setField} onSubmit={o.submitNuevo}
          onClose={() => { o.setDrawerOpen(false); o.setError(null); }}
          saving={o.saving} error={o.error} darkMode={darkMode}
        />
      )}

      {/* ── MODAL DETALLE ── */}
      {o.detailOT && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => o.setDetailOT(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${d('bg-white', 'bg-gray-800')}`}>
              <div className={`flex items-center justify-between px-6 py-4 border-b ${d('border-gray-100 bg-orange-50', 'border-gray-700 bg-orange-900/20')}`}>
                <div>
                  <p className="text-xs font-black text-orange-500 uppercase tracking-wider">{o.detailOT.folio}</p>
                  <h3 className={`text-lg font-black ${d('text-slate-800', 'text-white')}`}>{o.detailOT.tipo_mantenimiento}</h3>
                </div>
                <button onClick={() => o.setDetailOT(null)} className={`p-2 rounded-xl ${d('hover:bg-orange-100 text-gray-400', 'hover:bg-gray-700 text-gray-500')}`}>
                  <X size={18} />
                </button>
              </div>
              <div className={`px-6 py-4 grid grid-cols-2 gap-3 text-sm ${d('text-slate-700', 'text-gray-200')}`}>
                {[
                  ['Activo',      o.detailOT.nombre_activo || '—'],
                  ['TAG',         o.detailOT.tag_activo    || '—'],
                  ['Cliente',     o.detailOT.nombre_cliente|| '—'],
                  ['Planta',      o.detailOT.nombre_planta || '—'],
                  ['Prioridad',   o.detailOT.prioridad],
                  ['Estado',      o.detailOT.estado_ot],
                  ['Técnico',     o.detailOT.nombre_tecnico|| 'Sin asignar'],
                  ['Supervisor',  o.detailOT.nombre_supervisor || '—'],
                  ['F. Programada', o.detailOT.fecha_programada?.slice(0,10) || '—'],
                  ['F. Cierre',   o.detailOT.fecha_cierre?.slice(0,10)     || '—'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${d('text-gray-400','text-gray-500')}`}>{label}</p>
                    <p className="font-medium">{val}</p>
                  </div>
                ))}
                {o.detailOT.descripcion_falla && (
                  <div className="col-span-2">
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${d('text-gray-400','text-gray-500')}`}>Descripción</p>
                    <p className="font-medium">{o.detailOT.descripcion_falla}</p>
                  </div>
                )}
                {o.detailOT.acciones_realizadas && (
                  <div className="col-span-2">
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${d('text-gray-400','text-gray-500')}`}>Acciones</p>
                    <p className="font-medium">{o.detailOT.acciones_realizadas}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── MODAL ELIMINAR ── */}
      {o.deleteId !== null && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => o.setDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 ${d('bg-white', 'bg-gray-800')}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${d('bg-red-50','bg-red-900/20')}`}>
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className={`text-lg font-black text-center mb-1 ${d('text-slate-800','text-white')}`}>Eliminar OT</h3>
              <p className={`text-sm text-center mb-5 ${d('text-slate-400','text-gray-400')}`}>Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={() => o.setDeleteId(null)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${d('bg-gray-100 text-gray-600 hover:bg-gray-200','bg-gray-700 text-gray-300 hover:bg-gray-600')}`}>
                  Cancelar
                </button>
                <button onClick={o.confirmDelete} disabled={o.saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors">
                  {o.saving ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── FILTROS ── */}
      <div className={`${cardCls} px-4 py-3 flex flex-col sm:flex-row gap-3`}>
        <div className="relative flex-1">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${d('text-gray-400','text-gray-500')}`} />
          <input type="text" placeholder="Buscar por folio, activo, cliente, técnico o tipo..."
            value={o.search} onChange={e => o.setSearch(e.target.value)}
            className={`${inputCls} pl-9`} />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select value={o.filtroEstado} onChange={e => o.setFiltroEstado(e.target.value)} className={selectCls}>
              <option value="todos">Todos los estados</option>
              {ESTADOS_OT.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <ChevronDown size={13} className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 ${d('text-gray-400','text-gray-500')}`} />
          </div>
          <div className="relative">
            <select value={o.filtroPrior} onChange={e => o.setFiltroPrior(e.target.value)} className={selectCls}>
              <option value="todos">Todas las prioridades</option>
              {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown size={13} className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 ${d('text-gray-400','text-gray-500')}`} />
          </div>
        </div>
      </div>

      {/* ── TABLA ── */}
      <div className={`${cardCls} overflow-hidden`}>
        {o.loading ? (
          <div className={`text-center py-16 text-sm ${d('text-gray-400','text-gray-500')}`}>Cargando órdenes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className={`border-b ${d('border-gray-50 bg-gray-50/50','border-gray-700 bg-gray-900/30')}`}>
                  {['Folio','Activo','Tipo','Prioridad','Estado','Técnico','Supervisor','F. Programada',''].map(h => (
                    <th key={h} className={thCls}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${d('divide-gray-50','divide-gray-700/60')}`}>
                {o.filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className={`text-center py-12 text-sm ${d('text-gray-400','text-gray-500')}`}>
                      {o.search || o.filtroEstado !== 'todos' || o.filtroPrior !== 'todos'
                        ? 'Sin resultados.' : 'No hay órdenes de trabajo registradas.'}
                    </td>
                  </tr>
                )}
                {o.filtered.map(orden => {
                  const isEditing = o.editingId === orden.id_ot;
                  const vencida   = isVencida(orden);
                  return (
                    <tr key={orden.id_ot}
                      className={`transition-colors ${d('hover:bg-gray-50/60','hover:bg-gray-700/30')} ${vencida ? `border-l-2 ${d('border-l-red-500','border-l-red-600')}` : ''}`}>

                      {/* Folio */}
                      <td className={`${tdCls} font-bold text-orange-500 whitespace-nowrap`}>
                        {isEditing
                          ? <input value={o.editDraft.folio} onChange={e => o.setEditField('folio', e.target.value.toUpperCase())} className={editInpCls} />
                          : orden.folio
                        }
                      </td>

                      {/* Activo */}
                      <td className={tdCls}>
                        {isEditing ? (
                          <select value={o.editDraft.id_activo} onChange={e => o.setEditField('id_activo', e.target.value)} className={editInpCls}>
                            <option value="">—</option>
                            {o.activos.map(a => <option key={a.id_activo} value={a.id_activo}>{a.nombre_activo}</option>)}
                          </select>
                        ) : (
                          <div>
                            <div className="font-medium text-sm">{orden.nombre_activo || '—'}</div>
                            {orden.tag_activo && <div className={`text-[11px] font-mono ${d('text-gray-400','text-gray-500')}`}>{orden.tag_activo}</div>}
                          </div>
                        )}
                      </td>

                      {/* Tipo */}
                      <td className={tdCls}>
                        {isEditing ? (
                          <select value={o.editDraft.tipo_mantenimiento} onChange={e => o.setEditField('tipo_mantenimiento', e.target.value)} className={editInpCls}>
                            {TIPOS_MANT.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        ) : (
                          <span className={`text-xs font-medium ${d('text-slate-600','text-gray-300')}`}>{orden.tipo_mantenimiento}</span>
                        )}
                      </td>

                      {/* Prioridad */}
                      <td className={tdCls}>
                        {isEditing ? (
                          <select value={o.editDraft.prioridad} onChange={e => o.setEditField('prioridad', e.target.value)} className={editInpCls}>
                            {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        ) : (
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${prioridadCls(orden.prioridad, darkMode)}`}>
                            {orden.prioridad}
                          </span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className={tdCls}>
                        {isEditing ? (
                          <select value={o.editDraft.estado_ot} onChange={e => o.setEditField('estado_ot', e.target.value)} className={editInpCls}>
                            {ESTADOS_OT.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                        ) : (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${estadoCls(orden.estado_ot, darkMode)}`}>
                              {orden.estado_ot}
                            </span>
                            {vencida && (
                              <span className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${d('bg-red-50 text-red-500','bg-red-900/20 text-red-400')}`}>
                                <AlertTriangle size={9} /> VENCIDA
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Técnico */}
                      <td className={tdCls}>
                        {isEditing ? (
                          <select value={o.editDraft.id_tecnico} onChange={e => o.setEditField('id_tecnico', e.target.value)} className={editInpCls}>
                            <option value="">Sin asignar</option>
                            {o.usuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
                          </select>
                        ) : (
                          <span className={!orden.nombre_tecnico ? d('text-gray-300','text-gray-600') : ''}>
                            {orden.nombre_tecnico || 'Sin asignar'}
                          </span>
                        )}
                      </td>

                      {/* Supervisor */}
                      <td className={tdCls}>
                        {isEditing ? (
                          <select value={o.editDraft.id_supervisor} onChange={e => o.setEditField('id_supervisor', e.target.value)} className={editInpCls}>
                            <option value="">—</option>
                            {o.usuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
                          </select>
                        ) : orden.nombre_supervisor || <span className={d('text-gray-300','text-gray-600')}>—</span>}
                      </td>

                      {/* Fecha */}
                      <td className={`${tdCls} whitespace-nowrap font-medium ${vencida ? 'text-red-500 font-bold' : ''}`}>
                        {isEditing ? (
                          <input type="datetime-local" value={o.editDraft.fecha_programada}
                            onChange={e => o.setEditField('fecha_programada', e.target.value)} className={editInpCls} />
                        ) : orden.fecha_programada ? orden.fecha_programada.slice(0,10) : <span className={d('text-gray-300','text-gray-600')}>—</span>}
                      </td>

                      {/* Acciones */}
                      <td className={`${tdCls} whitespace-nowrap`}>
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={o.submitEdit} disabled={o.saving}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50">
                              <Check size={14} />
                            </button>
                            <button onClick={o.cancelEdit}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${d('bg-gray-100 text-gray-500 hover:bg-gray-200','bg-gray-700 text-gray-400 hover:bg-gray-600')}`}>
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => o.setDetailOT(orden)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${d('hover:bg-orange-50 text-gray-400 hover:text-orange-500','hover:bg-orange-900/20 text-gray-500 hover:text-orange-400')}`}>
                              <Eye size={14} />
                            </button>
                            <button onClick={() => o.startEdit(orden)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${d('hover:bg-blue-50 text-gray-400 hover:text-blue-500','hover:bg-blue-900/20 text-gray-500 hover:text-blue-400')}`}>
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => o.setDeleteId(orden.id_ot)}
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
