import React from 'react';
import { Users, Plus, Search, Pencil, Trash2, Check, X } from 'lucide-react';
import { useGMAOClientes } from '../hooks/useGMAOClientes';
import { GMAOClienteDrawer } from '../components/GMAOClienteDrawer';
import type { GMAOProps } from '../types/gmao.d';

export const GMAOClientesView: React.FC<GMAOProps> = ({ darkMode = false }) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;
  const c = useGMAOClientes();

  const cardCls  = `rounded-2xl md:rounded-[2rem] shadow-soft border ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`;
  const inputCls = `w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400/20 transition-colors ${d('border-gray-200 text-gray-800 bg-white', 'border-gray-600 text-gray-100 bg-gray-700')}`;
  const thCls    = `text-[10px] font-black uppercase tracking-wider px-4 py-3 text-left ${d('text-gray-400', 'text-gray-500')}`;
  const tdCls    = `px-4 py-3 text-sm ${d('text-slate-700', 'text-gray-200')}`;
  const editInputCls = `w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-400/20 ${d('border-gray-200 bg-white text-gray-800', 'border-gray-600 bg-gray-700 text-gray-100')}`;

  return (
    <div className="flex flex-col gap-6 fade-in pb-24 px-2 sm:px-0">

      {/* ── ENCABEZADO ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className={`flex-shrink-0 ${d('text-slate-700', 'text-gray-200')}`} size={28} />
          <div>
            <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${d('text-slate-800', 'text-white')}`}>
              Clientes
            </h1>
            <p className={`text-sm font-medium mt-0.5 ${d('text-slate-400', 'text-gray-400')}`}>
              {c.total} cliente{c.total !== 1 ? 's' : ''} registrado{c.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => c.setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 shadow-soft hover:-translate-y-0.5 transition-all"
        >
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      {/* ── DRAWER NUEVO ── */}
      {c.drawerOpen && (
        <GMAOClienteDrawer
          form={c.form}
          plantas={c.plantas}
          onField={c.setField}
          onSubmit={c.submitNuevo}
          onClose={() => { c.setDrawerOpen(false); c.setError(null); }}
          saving={c.saving}
          error={c.error}
          darkMode={darkMode}
        />
      )}

      {/* ── MODAL ELIMINAR ── */}
      {c.deleteId !== null && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => c.setDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 ${d('bg-white', 'bg-gray-800')}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${d('bg-red-50', 'bg-red-900/20')}`}>
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className={`text-lg font-black text-center mb-1 ${d('text-slate-800', 'text-white')}`}>Eliminar cliente</h3>
              <p className={`text-sm text-center mb-5 ${d('text-slate-400', 'text-gray-400')}`}>
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => c.setDeleteId(null)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${d('bg-gray-100 text-gray-600 hover:bg-gray-200', 'bg-gray-700 text-gray-300 hover:bg-gray-600')}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={c.confirmDelete}
                  disabled={c.saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {c.saving ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── BUSCADOR ── */}
      <div className={`${cardCls} px-4 py-3`}>
        <div className="relative">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${d('text-gray-400', 'text-gray-500')}`} />
          <input
            type="text"
            placeholder="Buscar por razón social, RFC, contacto o planta..."
            value={c.search}
            onChange={e => c.setSearch(e.target.value)}
            className={`${inputCls} pl-9`}
          />
        </div>
      </div>

      {/* ── TABLA ── */}
      <div className={`${cardCls} overflow-hidden`}>
        {c.loading ? (
          <div className={`text-center py-16 text-sm ${d('text-gray-400', 'text-gray-500')}`}>Cargando clientes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className={`border-b ${d('border-gray-50 bg-gray-50/50', 'border-gray-700 bg-gray-900/30')}`}>
                  <th className={thCls}>ID</th>
                  <th className={thCls}>Razón Social</th>
                  <th className={thCls}>RFC</th>
                  <th className={thCls}>Contacto Principal</th>
                  <th className={thCls}>Teléfono</th>
                  <th className={thCls}>Planta</th>
                  <th className={thCls}></th>
                </tr>
              </thead>
              <tbody className={`divide-y ${d('divide-gray-50', 'divide-gray-700/60')}`}>
                {c.filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className={`text-center py-12 text-sm ${d('text-gray-400', 'text-gray-500')}`}>
                      {c.search ? 'Sin resultados para la búsqueda.' : 'No hay clientes registrados.'}
                    </td>
                  </tr>
                )}
                {c.filtered.map(cliente => {
                  const isEditing = c.editingId === cliente.id_gmao_cliente;
                  return (
                    <tr key={cliente.id_gmao_cliente} className={`transition-colors ${d('hover:bg-gray-50/60', 'hover:bg-gray-700/30')}`}>

                      {/* ID */}
                      <td className={`${tdCls} font-bold text-blue-500 whitespace-nowrap`}>{cliente.folio}</td>

                      {/* Razón Social */}
                      <td className={`${tdCls} font-semibold`}>
                        {isEditing
                          ? <input value={c.editDraft.nombre_fiscal} onChange={e => c.setEditField('nombre_fiscal', e.target.value)} className={editInputCls} />
                          : cliente.nombre_fiscal
                        }
                      </td>

                      {/* RFC */}
                      <td className={`${tdCls} font-mono`}>
                        {isEditing
                          ? <input value={c.editDraft.rfc} onChange={e => c.setEditField('rfc', e.target.value.toUpperCase())} maxLength={13} className={editInputCls} />
                          : <span className={`text-xs ${d('text-gray-500', 'text-gray-400')}`}>{cliente.rfc || '—'}</span>
                        }
                      </td>

                      {/* Contacto */}
                      <td className={tdCls}>
                        {isEditing
                          ? <input value={c.editDraft.contacto_principal} onChange={e => c.setEditField('contacto_principal', e.target.value)} className={editInputCls} />
                          : cliente.contacto_principal || <span className={d('text-gray-300', 'text-gray-600')}>—</span>
                        }
                      </td>

                      {/* Teléfono */}
                      <td className={tdCls}>
                        {isEditing
                          ? <input value={c.editDraft.telefono_mantenimiento} onChange={e => c.setEditField('telefono_mantenimiento', e.target.value)} className={editInputCls} />
                          : cliente.telefono_mantenimiento || <span className={d('text-gray-300', 'text-gray-600')}>—</span>
                        }
                      </td>

                      {/* Planta */}
                      <td className={tdCls}>
                        {isEditing ? (
                          <select value={c.editDraft.id_planta} onChange={e => c.setEditField('id_planta', e.target.value)} className={editInputCls}>
                            <option value="">Sin planta</option>
                            {c.plantas.map(p => <option key={p.id_planta} value={p.id_planta}>{p.nombre_planta}</option>)}
                          </select>
                        ) : cliente.nombre_planta ? (
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${d('bg-blue-50 text-blue-600', 'bg-blue-900/20 text-blue-400')}`}>
                            {cliente.nombre_planta}
                          </span>
                        ) : <span className={d('text-gray-300', 'text-gray-600')}>—</span>}
                      </td>

                      {/* Acciones */}
                      <td className={`${tdCls} whitespace-nowrap`}>
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={c.submitEdit}
                              disabled={c.saving}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={c.cancelEdit}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${d('bg-gray-100 text-gray-500 hover:bg-gray-200', 'bg-gray-700 text-gray-400 hover:bg-gray-600')}`}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => c.startEdit(cliente)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${d('hover:bg-blue-50 text-gray-400 hover:text-blue-500', 'hover:bg-blue-900/20 text-gray-500 hover:text-blue-400')}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => c.setDeleteId(cliente.id_gmao_cliente)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${d('hover:bg-red-50 text-gray-400 hover:text-red-500', 'hover:bg-red-900/20 text-gray-500 hover:text-red-400')}`}
                            >
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
