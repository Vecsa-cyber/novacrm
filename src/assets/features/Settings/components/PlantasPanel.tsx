import React, { useState, useEffect, useMemo } from 'react';
import { Factory, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { apiFetch } from '../../../../lib/apiFetch';
import type { Planta } from '../types/settings.d';

interface PlantasPanelProps {
  darkMode?: boolean;
}

export const PlantasPanel: React.FC<PlantasPanelProps> = ({ darkMode = false }) => {
  const [plantas,       setPlantas]       = useState<Planta[]>([]);
  const [busqueda,      setBusqueda]      = useState('');
  const [editingId,     setEditingId]     = useState<number | null>(null);
  const [draft,         setDraft]         = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [nuevaNombre,   setNuevaNombre]   = useState('');
  const [saving,        setSaving]        = useState(false);

  const d = (light: string, dark: string) => darkMode ? dark : light;

  const cargar = () =>
    apiFetch('/api/plantas').then(r => r.json()).then(setPlantas).catch(console.error);

  useEffect(() => { cargar(); }, []);

  const plantasFiltradas = useMemo(() =>
    plantas.filter(p => p.nombre_planta.toLowerCase().includes(busqueda.toLowerCase())),
  [plantas, busqueda]);

  const saveEdit = async (id: number) => {
    await apiFetch(`/api/plantas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre_planta: draft }),
    });
    setEditingId(null);
    cargar();
  };

  const deletePlanta = async (id: number) => {
    await apiFetch(`/api/plantas/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    cargar();
  };

  const submitNueva = async () => {
    if (!nuevaNombre.trim()) return;
    setSaving(true);
    await apiFetch('/api/plantas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre_planta: nuevaNombre.trim() }),
    });
    setSaving(false);
    setDrawerOpen(false);
    setNuevaNombre('');
    cargar();
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Barra: buscador + botón */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar planta..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-400 transition-colors ${d('border-gray-200 text-gray-800', 'border-gray-600 text-gray-100 bg-gray-700')}`}
          />
          <Factory size={15} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
        </div>
        <button
          onClick={() => { setNuevaNombre(''); setDrawerOpen(true); }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={14} /> Nueva planta
        </button>
      </div>

      <p className={`text-xs font-medium ${d('text-slate-400', 'text-gray-500')}`}>
        {plantasFiltradas.length} de {plantas.length} planta{plantas.length !== 1 ? 's' : ''}
      </p>

      {/* Lista */}
      <div className={`border rounded-2xl overflow-hidden shadow-sm ${d('bg-white border-gray-100', 'bg-gray-800/50 border-gray-700')}`}>
        <div className={`hidden sm:grid sm:grid-cols-[auto_1fr_auto] gap-4 px-5 py-3 border-b text-xs font-bold uppercase tracking-wide ${d('bg-gray-50 border-gray-100 text-gray-400', 'bg-gray-900/50 border-gray-700 text-gray-500')}`}>
          <span>ID</span><span>Nombre</span><span />
        </div>

        {plantasFiltradas.length === 0 ? (
          <p className={`text-center text-sm py-10 ${d('text-gray-400', 'text-gray-500')}`}>
            {busqueda ? 'Sin resultados para esa búsqueda' : 'Sin plantas registradas'}
          </p>
        ) : (
          <div className={`divide-y ${d('divide-gray-50', 'divide-gray-700')}`}>
            {plantasFiltradas.map(p => {
              const isEditing = editingId === p.id_planta;
              return (
                <div key={p.id_planta} className={`grid grid-cols-[auto_1fr_auto] gap-4 px-5 py-3 items-center transition-colors ${d('hover:bg-slate-50/50', 'hover:bg-gray-700/30')}`}>
                  <span className={`text-xs font-bold w-6 ${d('text-gray-300', 'text-gray-600')}`}>#{p.id_planta}</span>

                  {isEditing ? (
                    <input
                      autoFocus
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(p.id_planta); if (e.key === 'Escape') setEditingId(null); }}
                      className={`border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 ${d('border-emerald-300 text-slate-800 ring-emerald-100', 'border-emerald-500 text-gray-100 bg-gray-700 ring-emerald-800')}`}
                    />
                  ) : (
                    <span className={`text-sm font-semibold ${d('text-slate-700', 'text-gray-200')}`}>{p.nombre_planta}</span>
                  )}

                  <div className="flex items-center gap-1.5">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(p.id_planta)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"><Check size={13} /></button>
                        <button onClick={() => setEditingId(null)} className={`p-1.5 rounded-lg ${d('bg-gray-50 text-gray-400 hover:bg-gray-100', 'bg-gray-700 text-gray-400 hover:bg-gray-600')}`}><X size={13} /></button>
                      </>
                    ) : confirmDelete === p.id_planta ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-red-500">¿Eliminar?</span>
                        <button onClick={() => deletePlanta(p.id_planta)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Check size={13} /></button>
                        <button onClick={() => setConfirmDelete(null)} className={`p-1.5 rounded-lg ${d('bg-gray-50 text-gray-400 hover:bg-gray-100', 'bg-gray-700 text-gray-400 hover:bg-gray-600')}`}><X size={13} /></button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(p.id_planta); setDraft(p.nombre_planta); }} className={`p-1.5 rounded-lg transition-colors ${d('text-gray-400 hover:bg-emerald-50 hover:text-emerald-500', 'text-gray-500 hover:bg-emerald-900/40 hover:text-emerald-400')}`}><Pencil size={13} /></button>
                        <button onClick={() => setConfirmDelete(p.id_planta)} className={`p-1.5 rounded-lg transition-colors ${d('text-gray-400 hover:bg-red-50 hover:text-red-500', 'text-gray-500 hover:bg-red-900/40 hover:text-red-400')}`}><Trash2 size={13} /></button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer nueva planta */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className={`relative w-full max-w-md h-full shadow-2xl flex flex-col ${d('bg-white', 'bg-gray-900')}`}>
            <div className={`flex items-center justify-between p-6 border-b ${d('border-gray-100', 'border-gray-700')}`}>
              <div>
                <h2 className={`text-xl font-black ${d('text-slate-800', 'text-white')}`}>Nueva planta</h2>
                <p className={`text-sm mt-0.5 ${d('text-slate-400', 'text-gray-400')}`}>Agrega una nueva instalación</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className={`p-2 rounded-xl transition-colors ${d('hover:bg-gray-100 text-gray-400', 'hover:bg-gray-800 text-gray-500')}`}><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-5 p-6 flex-1">
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Nombre de la planta</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Ej. Planta Norte, Sucursal Centro..."
                  value={nuevaNombre}
                  onChange={e => setNuevaNombre(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitNueva(); }}
                  className={`border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors ${d('border-gray-200 text-gray-800', 'border-gray-600 text-gray-100 bg-gray-700')}`}
                />
              </div>
            </div>
            <div className={`p-6 border-t flex gap-3 ${d('border-gray-100', 'border-gray-700')}`}>
              <button onClick={() => setDrawerOpen(false)} className={`flex-1 border font-bold py-2.5 rounded-xl text-sm transition-colors ${d('border-gray-200 text-gray-600 hover:bg-gray-50', 'border-gray-600 text-gray-300 hover:bg-gray-800')}`}>Cancelar</button>
              <button
                onClick={submitNueva}
                disabled={!nuevaNombre.trim() || saving}
                className="flex-1 bg-emerald-500 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-600 text-sm disabled:opacity-40"
              >
                {saving ? 'Guardando...' : 'Crear planta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
