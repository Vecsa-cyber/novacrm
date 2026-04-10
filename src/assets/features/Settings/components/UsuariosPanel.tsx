import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, Pencil, Trash2, Check, X, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '../../../../lib/apiFetch';
import { ROL_COLORS, ROL_COLOR_DEFAULT } from '../constants/settings.constants';
import { AccesosPanel } from './AccesosPanel';
import type { Usuario, Rol } from '../types/settings.d';

interface UsuariosPanelProps {
  currentUser: any;
  darkMode?: boolean;
}

export const UsuariosPanel: React.FC<UsuariosPanelProps> = ({ currentUser, darkMode = false }) => {
  const [usuarios,      setUsuarios]      = useState<Usuario[]>([]);
  const [roles,         setRoles]         = useState<Rol[]>([]);
  const [filtroRol,     setFiltroRol]     = useState<number | ''>('');
  const [editingId,     setEditingId]     = useState<number | null>(null);
  const [draft,         setDraft]         = useState<Partial<Usuario>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const emptyForm = { nombre: '', correo: '', contrasena: '', id_rol: 2 };
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form,       setForm]       = useState(emptyForm);
  const [showPass,   setShowPass]   = useState(false);
  const [saving,     setSaving]     = useState(false);

  const d = (light: string, dark: string) => darkMode ? dark : light;

  const setField = (k: keyof typeof emptyForm, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }));

  const cargar = () => {
    apiFetch('/api/usuarios/todos').then(r => r.json()).then(setUsuarios).catch(console.error);
  };

  useEffect(() => {
    cargar();
    apiFetch('/api/roles').then(r => r.json()).then(setRoles).catch(console.error);
  }, []);

  const usuariosFiltrados = useMemo(() =>
    filtroRol === '' ? usuarios : usuarios.filter(u => u.id_rol === filtroRol),
  [usuarios, filtroRol]);

  const startEdit  = (u: Usuario) => { setEditingId(u.id_usuario); setDraft({ nombre: u.nombre, correo: u.correo, id_rol: u.id_rol }); };
  const cancelEdit = () => { setEditingId(null); setDraft({}); };

  const saveEdit = async (id: number) => {
    await apiFetch(`/api/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    setEditingId(null);
    setDraft({});
    cargar();
  };

  const deleteUsuario = async (id: number) => {
    await apiFetch(`/api/usuarios/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    cargar();
  };

  const submitNuevo = async () => {
    if (!form.nombre || !form.correo || !form.contrasena) return;
    setSaving(true);
    await apiFetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setDrawerOpen(false);
    setForm(emptyForm);
    cargar();
  };

  const inputCls = d(
    'border border-blue-300 rounded-lg px-3 py-1.5 text-sm text-slate-800 outline-none focus:ring-2 ring-blue-100',
    'border border-blue-500 rounded-lg px-3 py-1.5 text-sm text-gray-100 bg-gray-700 outline-none focus:ring-2 ring-blue-800'
  );

  const drawerInputCls = d(
    'border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors',
    'border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-100 bg-gray-700 outline-none focus:border-blue-400 transition-colors'
  );

  return (
    <div className="flex flex-col gap-4">

      {/* Barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${d('text-slate-400', 'text-gray-400')}`}>
            {usuariosFiltrados.length} de {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
          </p>
          <select
            value={filtroRol}
            onChange={e => setFiltroRol(e.target.value === '' ? '' : Number(e.target.value))}
            className={`border rounded-xl px-3 py-1.5 text-xs font-semibold outline-none focus:border-blue-400 transition-colors ${d('border-gray-200 text-gray-700 bg-white', 'border-gray-600 text-gray-200 bg-gray-700')}`}
          >
            <option value="">Todos los roles</option>
            {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setDrawerOpen(true); }}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          <UserPlus size={14} /> Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      <div className={`border rounded-2xl overflow-hidden shadow-sm ${d('bg-white border-gray-100', 'bg-gray-800/50 border-gray-700')}`}>
        <div className={`hidden sm:grid sm:grid-cols-[2fr_2fr_1fr_auto] gap-4 px-5 py-3 border-b text-xs font-bold uppercase tracking-wide ${d('bg-gray-50 border-gray-100 text-gray-400', 'bg-gray-900/50 border-gray-700 text-gray-500')}`}>
          <span>Nombre</span><span>Correo</span><span>Rol</span><span />
        </div>

        {usuariosFiltrados.length === 0 ? (
          <p className={`text-center text-sm py-10 ${d('text-gray-400', 'text-gray-500')}`}>
            {filtroRol === '' ? 'Sin usuarios registrados' : 'No hay usuarios con este rol'}
          </p>
        ) : (
          <div className={`divide-y ${d('divide-gray-50', 'divide-gray-700')}`}>
            {usuariosFiltrados.map(u => {
              const isEditing = editingId === u.id_usuario;
              const isMe = currentUser?.id === u.id_usuario;
              return (
                <div key={u.id_usuario} className={`flex flex-col sm:grid sm:grid-cols-[2fr_2fr_1fr_auto] gap-3 sm:gap-4 px-5 py-4 items-start sm:items-center transition-colors ${d('hover:bg-slate-50/50', 'hover:bg-gray-700/30')}`}>

                  {/* Nombre */}
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.nombre}`} alt={u.nombre} />
                    </div>
                    {isEditing ? (
                      <input autoFocus value={draft.nombre ?? ''} onChange={e => setDraft(dd => ({ ...dd, nombre: e.target.value }))} className={`flex-1 ${inputCls}`} />
                    ) : (
                      <span className={`text-sm font-bold truncate ${d('text-slate-800', 'text-gray-100')}`}>
                        {u.nombre} {isMe && <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full ml-1">Tú</span>}
                      </span>
                    )}
                  </div>

                  {/* Correo */}
                  <div className="w-full">
                    {isEditing ? (
                      <input value={draft.correo ?? ''} onChange={e => setDraft(dd => ({ ...dd, correo: e.target.value }))} className={`w-full ${inputCls}`} />
                    ) : (
                      <span className={`text-sm truncate block ${d('text-slate-500', 'text-gray-400')}`}>{u.correo}</span>
                    )}
                  </div>

                  {/* Rol */}
                  <div className="w-full sm:w-auto">
                    {isEditing ? (
                      <select
                        value={draft.id_rol ?? roles[0]?.id_rol ?? ''}
                        onChange={e => setDraft(dd => ({ ...dd, id_rol: Number(e.target.value) }))}
                        className={`border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 ring-blue-100 ${d('border-blue-300 text-slate-800 bg-white', 'border-blue-500 text-gray-100 bg-gray-700')}`}
                      >
                        {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${ROL_COLORS[u.id_rol] ?? ROL_COLOR_DEFAULT}`}>
                        {u.nombre_rol ?? `Rol ${u.id_rol}`}
                      </span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(u.id_usuario)} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"><Check size={15} /></button>
                        <button onClick={cancelEdit} className={`p-2 rounded-xl transition-colors ${d('bg-gray-50 text-gray-400 hover:bg-gray-100', 'bg-gray-700 text-gray-400 hover:bg-gray-600')}`}><X size={15} /></button>
                      </>
                    ) : confirmDelete === u.id_usuario ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-red-500">¿Eliminar?</span>
                        <button onClick={() => deleteUsuario(u.id_usuario)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><Check size={13} /></button>
                        <button onClick={() => setConfirmDelete(null)} className={`p-1.5 rounded-lg transition-colors ${d('bg-gray-50 text-gray-400 hover:bg-gray-100', 'bg-gray-700 text-gray-400 hover:bg-gray-600')}`}><X size={13} /></button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => startEdit(u)} className={`p-2 rounded-xl transition-colors ${d('text-gray-400 hover:bg-blue-50 hover:text-blue-500', 'text-gray-500 hover:bg-blue-900/40 hover:text-blue-400')}`}><Pencil size={15} /></button>
                        <button onClick={() => setConfirmDelete(u.id_usuario)} disabled={isMe} className={`p-2 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${d('text-gray-400 hover:bg-red-50 hover:text-red-500', 'text-gray-500 hover:bg-red-900/40 hover:text-red-400')}`}><Trash2 size={15} /></button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Panel de accesos */}
      <AccesosPanel roles={roles} darkMode={darkMode} />

      {/* Drawer nuevo usuario */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className={`relative w-full max-w-md h-full shadow-2xl flex flex-col ${d('bg-white', 'bg-gray-900')}`}>
            <div className={`flex items-center justify-between p-6 border-b ${d('border-gray-100', 'border-gray-700')}`}>
              <div>
                <h2 className={`text-xl font-black ${d('text-slate-800', 'text-white')}`}>Nuevo usuario</h2>
                <p className={`text-sm mt-0.5 ${d('text-slate-400', 'text-gray-400')}`}>Completa los datos del nuevo miembro</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className={`p-2 rounded-xl transition-colors ${d('hover:bg-gray-100 text-gray-400', 'hover:bg-gray-800 text-gray-500')}`}><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-5 p-6 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Nombre completo</label>
                <input type="text" placeholder="Ej. Juan Pérez" value={form.nombre} onChange={e => setField('nombre', e.target.value)} className={drawerInputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Correo electrónico</label>
                <input type="email" placeholder="correo@empresa.com" value={form.correo} onChange={e => setField('correo', e.target.value)} className={drawerInputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Contraseña</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={form.contrasena} onChange={e => setField('contrasena', e.target.value)} className={`w-full pr-11 ${drawerInputCls}`} />
                  <button type="button" onClick={() => setShowPass(p => !p)} className={`absolute right-3 top-2.5 transition-colors ${d('text-gray-400 hover:text-gray-600', 'text-gray-500 hover:text-gray-300')}`}>
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold uppercase tracking-wide ${d('text-gray-500', 'text-gray-400')}`}>Rol</label>
                <select value={form.id_rol} onChange={e => setField('id_rol', Number(e.target.value))} className={drawerInputCls}>
                  {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
                </select>
              </div>
            </div>
            <div className={`p-6 border-t flex gap-3 ${d('border-gray-100', 'border-gray-700')}`}>
              <button onClick={() => setDrawerOpen(false)} className={`flex-1 border font-bold py-2.5 rounded-xl text-sm transition-colors ${d('border-gray-200 text-gray-600 hover:bg-gray-50', 'border-gray-600 text-gray-300 hover:bg-gray-800')}`}>Cancelar</button>
              <button onClick={submitNuevo} disabled={!form.nombre || !form.correo || !form.contrasena || saving} className="flex-1 bg-blue-500 text-white font-bold py-2.5 rounded-xl hover:bg-blue-600 transition-colors text-sm disabled:opacity-40">
                {saving ? 'Guardando...' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
