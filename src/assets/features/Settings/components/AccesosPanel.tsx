import React, { useState, useEffect } from 'react';
import { Briefcase, Check, X, Pencil, Trash2, LayoutDashboard } from 'lucide-react';
import { apiFetch } from '../../../../lib/apiFetch';
import { ROL_COLORS, ROL_COLOR_DEFAULT, VISTAS_DISPONIBLES, VISTA_LABELS } from '../constants/settings.constants';
import type { Rol, Acceso, Vista } from '../types/settings.d';

interface AccesosPanelProps {
  roles: Rol[];
  darkMode?: boolean;
}

export const AccesosPanel: React.FC<AccesosPanelProps> = ({ roles, darkMode = false }) => {
  const [accesos,        setAccesos]        = useState<Acceso[]>([]);
  const [editingId,      setEditingId]      = useState<number | null>(null);
  const [draftRol,       setDraftRol]       = useState<number>(0);
  const [confirmDelete,  setConfirmDelete]  = useState<number | null>(null);
  const [newVista,       setNewVista]       = useState<Vista>('dashboard');
  const [newRol,         setNewRol]         = useState<number>(roles[0]?.id_rol ?? 1);
  const [addingRow,      setAddingRow]      = useState(false);

  const d = (light: string, dark: string) => darkMode ? dark : light;

  const cargar = () =>
    apiFetch('/api/accesos').then(r => r.json()).then(setAccesos).catch(console.error);

  useEffect(() => { cargar(); }, []);
  useEffect(() => { if (roles.length > 0) setNewRol(roles[0].id_rol); }, [roles]);

  const saveEdit = async (id: number) => {
    await apiFetch(`/api/accesos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_rol: draftRol }),
    });
    setEditingId(null);
    cargar();
  };

  const deleteAcceso = async (id: number) => {
    await apiFetch(`/api/accesos/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    cargar();
  };

  const addAcceso = async () => {
    await apiFetch('/api/accesos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_rol: newRol, vista: newVista }),
    });
    setAddingRow(false);
    cargar();
  };

  const selectCls = d(
    'border border-blue-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 ring-blue-100 bg-white',
    'border border-blue-500 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 ring-blue-800 bg-gray-700 text-gray-100'
  );

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-black ${d('text-slate-700', 'text-gray-200')}`}>Accesos por Rol</h3>
          <p className={`text-xs mt-0.5 ${d('text-slate-400', 'text-gray-400')}`}>Define qué vistas puede ver cada rol</p>
        </div>
        <button
          onClick={() => setAddingRow(true)}
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
        >
          <Briefcase size={13} /> Nuevo acceso
        </button>
      </div>

      <div className={`border rounded-2xl overflow-hidden shadow-sm ${d('bg-white border-gray-100', 'bg-gray-800/50 border-gray-700')}`}>
        {/* Cabecera */}
        <div className={`grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-5 py-3 border-b text-xs font-bold uppercase tracking-wide ${d('bg-gray-50 border-gray-100 text-gray-400', 'bg-gray-900/50 border-gray-700 text-gray-500')}`}>
          <span>ID</span><span>Vista</span><span>Rol</span><span />
        </div>

        {/* Fila nueva */}
        {addingRow && (
          <div className={`grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-5 py-3 items-center border-b ${d('border-blue-100 bg-blue-50/40', 'border-blue-800/50 bg-blue-900/10')}`}>
            <span className={`text-xs font-bold ${d('text-gray-400', 'text-gray-500')}`}>—</span>
            <select value={newVista} onChange={e => setNewVista(e.target.value as Vista)} className={selectCls}>
              {VISTAS_DISPONIBLES.map(v => (
                <option key={v} value={v}>{VISTA_LABELS[v].label}</option>
              ))}
            </select>
            <select value={newRol} onChange={e => setNewRol(Number(e.target.value))} className={selectCls}>
              {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
            </select>
            <div className="flex gap-1.5">
              <button onClick={addAcceso} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"><Check size={14} /></button>
              <button onClick={() => setAddingRow(false)} className={`p-1.5 rounded-lg ${d('bg-gray-50 text-gray-400 hover:bg-gray-100', 'bg-gray-700 text-gray-400 hover:bg-gray-600')}`}><X size={14} /></button>
            </div>
          </div>
        )}

        {accesos.length === 0 && !addingRow ? (
          <p className={`text-center text-sm py-8 ${d('text-gray-400', 'text-gray-500')}`}>Sin accesos registrados</p>
        ) : (
          <div className={`divide-y ${d('divide-gray-50', 'divide-gray-700')}`}>
            {accesos.map(a => {
              const isEditing = editingId === a.id_acceso;
              const vistaInfo = VISTA_LABELS[a.vista];
              const Icon = vistaInfo?.icon ?? LayoutDashboard;
              return (
                <div key={a.id_acceso} className={`grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-5 py-3 items-center transition-colors ${d('hover:bg-slate-50/50', 'hover:bg-gray-700/30')}`}>
                  <span className={`text-xs font-bold w-6 ${d('text-gray-300', 'text-gray-600')}`}>#{a.id_acceso}</span>

                  <div className="flex items-center gap-2">
                    <Icon size={14} className={d('text-gray-400', 'text-gray-500')} />
                    <span className={`text-sm font-semibold ${d('text-slate-700', 'text-gray-200')}`}>{vistaInfo?.label ?? a.vista}</span>
                  </div>

                  {isEditing ? (
                    <select value={draftRol} onChange={e => setDraftRol(Number(e.target.value))} className={selectCls}>
                      {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border w-fit ${ROL_COLORS[a.id_rol] ?? ROL_COLOR_DEFAULT}`}>
                      {a.nombre_rol}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(a.id_acceso)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"><Check size={13} /></button>
                        <button onClick={() => setEditingId(null)} className={`p-1.5 rounded-lg ${d('bg-gray-50 text-gray-400 hover:bg-gray-100', 'bg-gray-700 text-gray-400 hover:bg-gray-600')}`}><X size={13} /></button>
                      </>
                    ) : confirmDelete === a.id_acceso ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-red-500">¿Eliminar?</span>
                        <button onClick={() => deleteAcceso(a.id_acceso)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Check size={13} /></button>
                        <button onClick={() => setConfirmDelete(null)} className={`p-1.5 rounded-lg ${d('bg-gray-50 text-gray-400 hover:bg-gray-100', 'bg-gray-700 text-gray-400 hover:bg-gray-600')}`}><X size={13} /></button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(a.id_acceso); setDraftRol(a.id_rol); }} className={`p-1.5 rounded-lg transition-colors ${d('text-gray-400 hover:bg-blue-50 hover:text-blue-500', 'text-gray-500 hover:bg-blue-900/40 hover:text-blue-400')}`}><Pencil size={13} /></button>
                        <button onClick={() => setConfirmDelete(a.id_acceso)} className={`p-1.5 rounded-lg transition-colors ${d('text-gray-400 hover:bg-red-50 hover:text-red-500', 'text-gray-500 hover:bg-red-900/40 hover:text-red-400')}`}><Trash2 size={13} /></button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
