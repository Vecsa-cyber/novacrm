import { useState, useEffect } from 'react';
import { apiFetch } from '../../../../lib/apiFetch';

export interface GMAOActivo {
  id_activo: number;
  tag_activo: string;
  nombre_activo: string;
  modelo: string;
  serie: string;
  id_planta: number | null;
  nombre_planta: string;
  fecha_instalacion: string;
  estado_activo: 'Operativo' | 'En Reparación' | 'Baja';
  id_equipo_catalogo: number | null;
  nombre_equipo: string;
}

export interface ActivoForm {
  tag_activo: string;
  nombre_activo: string;
  modelo: string;
  serie: string;
  id_planta: string;
  fecha_instalacion: string;
  estado_activo: string;
  id_equipo_catalogo: string;
}

const EMPTY_FORM: ActivoForm = {
  tag_activo: '', nombre_activo: '', modelo: '', serie: '',
  id_planta: '', fecha_instalacion: '', estado_activo: 'Operativo', id_equipo_catalogo: '',
};

export const ESTADOS_ACTIVO = ['Operativo', 'En Reparación', 'Baja'] as const;

const buildBody = (f: ActivoForm) => ({
  tag_activo:          f.tag_activo.trim()      || null,
  nombre_activo:       f.nombre_activo.trim(),
  modelo:              f.modelo.trim()           || null,
  serie:               f.serie.trim()            || null,
  id_planta:           f.id_planta               ? Number(f.id_planta)           : null,
  fecha_instalacion:   f.fecha_instalacion       || null,
  estado_activo:       f.estado_activo           || 'Operativo',
  id_equipo_catalogo:  f.id_equipo_catalogo      ? Number(f.id_equipo_catalogo)  : null,
});

export const useGMAOActivos = () => {
  const [activos,  setActivos]  = useState<GMAOActivo[]>([]);
  const [plantas,  setPlantas]  = useState<{ id_planta: number; nombre_planta: string }[]>([]);
  const [equipos,  setEquipos]  = useState<{ id_equipo: number; nombre_equipo: string }[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [search,   setSearch]   = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Drawer nuevo
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form,       setForm]       = useState<ActivoForm>(EMPTY_FORM);
  const setField = (k: keyof ActivoForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Edición
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<ActivoForm>(EMPTY_FORM);
  const setEditField = (k: keyof ActivoForm, v: string) => setEditDraft(f => ({ ...f, [k]: v }));

  // Eliminar
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const recargar = async () => {
    setLoading(true);
    try {
      const res  = await apiFetch('/api/gmao/activos');
      const data = await res.json();
      setActivos(data as GMAOActivo[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    recargar();
    apiFetch('/api/plantas').then(r => r.json()).then(setPlantas).catch(() => {});
    apiFetch('/api/equipos').then(r => r.json()).then(setEquipos).catch(() => {});
  }, []);

  const filtered = activos.filter(a => {
    const q = search.toLowerCase();
    const matchQ = !q ||
      a.nombre_activo.toLowerCase().includes(q) ||
      a.tag_activo?.toLowerCase().includes(q)   ||
      a.nombre_planta?.toLowerCase().includes(q)||
      a.modelo?.toLowerCase().includes(q);
    const matchE = filtroEstado === 'todos' || a.estado_activo === filtroEstado;
    return matchQ && matchE;
  });

  const submitNuevo = async () => {
    if (!form.nombre_activo.trim()) return;
    setSaving(true); setError(null);
    try {
      const res  = await apiFetch('/api/gmao/activos', { method: 'POST', body: JSON.stringify(buildBody(form)) });
      const body = await res.json();
      if (!res.ok) { setError(body?.error ?? `Error ${res.status}`); return; }
      setForm(EMPTY_FORM);
      setDrawerOpen(false);
      await recargar();
    } catch (e: any) { setError(e?.message ?? 'Error de conexión'); }
    finally { setSaving(false); }
  };

  const startEdit = (a: GMAOActivo) => {
    setEditingId(a.id_activo);
    setEditDraft({
      tag_activo:         a.tag_activo        ?? '',
      nombre_activo:      a.nombre_activo,
      modelo:             a.modelo            ?? '',
      serie:              a.serie             ?? '',
      id_planta:          a.id_planta         ? String(a.id_planta)          : '',
      fecha_instalacion:  a.fecha_instalacion ? a.fecha_instalacion.slice(0,10) : '',
      estado_activo:      a.estado_activo,
      id_equipo_catalogo: a.id_equipo_catalogo ? String(a.id_equipo_catalogo) : '',
    });
  };

  const submitEdit = async () => {
    if (!editingId || !editDraft.nombre_activo.trim()) return;
    setSaving(true); setError(null);
    try {
      const res  = await apiFetch(`/api/gmao/activos/${editingId}`, { method: 'PUT', body: JSON.stringify(buildBody(editDraft)) });
      const body = await res.json();
      if (!res.ok) { setError(body?.error ?? `Error ${res.status}`); return; }
      setEditingId(null);
      await recargar();
    } catch (e: any) { setError(e?.message ?? 'Error de conexión'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/gmao/activos/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) { const b = await res.json(); setError(b?.error ?? 'Error al eliminar'); return; }
      setDeleteId(null);
      await recargar();
    } catch (e: any) { setError(e?.message ?? 'Error de conexión'); }
    finally { setSaving(false); }
  };

  return {
    filtered, plantas, equipos, loading, saving, error, setError, search, setSearch,
    filtroEstado, setFiltroEstado,
    drawerOpen, setDrawerOpen, form, setField, submitNuevo,
    editingId, editDraft, setEditField, startEdit, submitEdit, cancelEdit: () => setEditingId(null),
    deleteId, setDeleteId, confirmDelete,
    total: activos.length,
  };
};
