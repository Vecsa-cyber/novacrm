import { useState, useEffect } from 'react';
import { apiFetch } from '../../../../lib/apiFetch';

export interface GMAOOrden {
  id_ot: number;
  folio: string;
  id_activo: number | null;
  nombre_activo: string;
  tag_activo: string;
  tipo_mantenimiento: 'Preventivo' | 'Correctivo' | 'Predictivo';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  estado_ot: 'Abierta' | 'En Proceso' | 'Pendiente Repuestos' | 'Cerrada';
  id_tecnico: number | null;
  nombre_tecnico: string;
  id_supervisor: number | null;
  nombre_supervisor: string;
  fecha_programada: string;
  fecha_cierre: string;
  descripcion_falla: string;
  acciones_realizadas: string;
  nombre_cliente: string;
  nombre_planta: string;
}

export interface OrdenForm {
  folio: string;
  id_activo: string;
  tipo_mantenimiento: string;
  prioridad: string;
  estado_ot: string;
  id_tecnico: string;
  id_supervisor: string;
  fecha_programada: string;
  fecha_cierre: string;
  descripcion_falla: string;
  acciones_realizadas: string;
}

const EMPTY_FORM: OrdenForm = {
  folio: '', id_activo: '', tipo_mantenimiento: 'Preventivo',
  prioridad: 'Media', estado_ot: 'Abierta',
  id_tecnico: '', id_supervisor: '',
  fecha_programada: '', fecha_cierre: '',
  descripcion_falla: '', acciones_realizadas: '',
};

export const TIPOS_MANT  = ['Preventivo', 'Correctivo', 'Predictivo'] as const;
export const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Crítica'] as const;
export const ESTADOS_OT  = ['Abierta', 'En Proceso', 'Pendiente Repuestos', 'Cerrada'] as const;

// Auto-genera folio OT-YYYY-XXXXXX
const genFolio = () => {
  const y   = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 900000) + 100000);
  return `OT-${y}-${seq}`;
};

const buildBody = (f: OrdenForm) => ({
  folio:               f.folio.trim()              || genFolio(),
  id_activo:           f.id_activo                 ? Number(f.id_activo)    : null,
  tipo_mantenimiento:  f.tipo_mantenimiento,
  prioridad:           f.prioridad,
  estado_ot:           f.estado_ot,
  id_tecnico:          f.id_tecnico                ? Number(f.id_tecnico)   : null,
  id_supervisor:       f.id_supervisor             ? Number(f.id_supervisor): null,
  fecha_programada:    f.fecha_programada          || null,
  fecha_cierre:        f.fecha_cierre              || null,
  descripcion_falla:   f.descripcion_falla.trim()  || null,
  acciones_realizadas: f.acciones_realizadas.trim()|| null,
});

export const useGMAOOrdenes = () => {
  const [ordenes,   setOrdenes]   = useState<GMAOOrden[]>([]);
  const [activos,   setActivos]   = useState<{ id_activo: number; nombre_activo: string; tag_activo: string }[]>([]);
  const [usuarios,  setUsuarios]  = useState<{ id_usuario: number; nombre: string }[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const [search,        setSearch]        = useState('');
  const [filtroEstado,  setFiltroEstado]  = useState('todos');
  const [filtroPrior,   setFiltroPrior]   = useState('todos');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form,       setForm]       = useState<OrdenForm>(EMPTY_FORM);
  const setField = (k: keyof OrdenForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<OrdenForm>(EMPTY_FORM);
  const setEditField = (k: keyof OrdenForm, v: string) => setEditDraft(f => ({ ...f, [k]: v }));

  const [deleteId, setDeleteId]   = useState<number | null>(null);
  const [detailOT, setDetailOT]   = useState<GMAOOrden | null>(null);

  const recargar = async () => {
    setLoading(true);
    try {
      const res  = await apiFetch('/api/gmao/ordenes');
      const data = await res.json();
      setOrdenes(data as GMAOOrden[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    recargar();
    apiFetch('/api/gmao/activos').then(r => r.json()).then(setActivos).catch(() => {});
    apiFetch('/api/usuarios/todos').then(r => r.json()).then(setUsuarios).catch(() => {});
  }, []);

  const filtered = ordenes.filter(o => {
    const q = search.toLowerCase();
    const matchQ = !q ||
      o.folio?.toLowerCase().includes(q)           ||
      o.nombre_activo?.toLowerCase().includes(q)   ||
      o.nombre_cliente?.toLowerCase().includes(q)  ||
      o.nombre_tecnico?.toLowerCase().includes(q)  ||
      o.tipo_mantenimiento?.toLowerCase().includes(q);
    const matchE = filtroEstado === 'todos' || o.estado_ot === filtroEstado;
    const matchP = filtroPrior  === 'todos' || o.prioridad  === filtroPrior;
    return matchQ && matchE && matchP;
  });

  // ── Export a CSV (sin deps externas) ────────────────────────────────────────
  const exportExcel = () => {
    const cols = ['Folio','Activo','TAG','Cliente','Planta','Tipo','Prioridad','Estado',
                  'Técnico','Supervisor','Fecha Programada','Fecha Cierre','Descripción','Acciones'];
    const rows = filtered.map(o => [
      o.folio, o.nombre_activo, o.tag_activo, o.nombre_cliente, o.nombre_planta,
      o.tipo_mantenimiento, o.prioridad, o.estado_ot,
      o.nombre_tecnico, o.nombre_supervisor,
      o.fecha_programada?.slice(0,10) ?? '',
      o.fecha_cierre?.slice(0,10)     ?? '',
      o.descripcion_falla             ?? '',
      o.acciones_realizadas           ?? '',
    ]);
    const csv = [cols, ...rows]
      .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `OTs_GMAO_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitNuevo = async () => {
    if (!form.tipo_mantenimiento) return;
    setSaving(true); setError(null);
    try {
      const res  = await apiFetch('/api/gmao/ordenes', { method: 'POST', body: JSON.stringify(buildBody(form)) });
      const body = await res.json();
      if (!res.ok) { setError(body?.error ?? `Error ${res.status}`); return; }
      setForm(EMPTY_FORM);
      setDrawerOpen(false);
      await recargar();
    } catch (e: any) { setError(e?.message ?? 'Error de conexión'); }
    finally { setSaving(false); }
  };

  const startEdit = (o: GMAOOrden) => {
    setEditingId(o.id_ot);
    setEditDraft({
      folio:               o.folio               ?? '',
      id_activo:           o.id_activo            ? String(o.id_activo)    : '',
      tipo_mantenimiento:  o.tipo_mantenimiento,
      prioridad:           o.prioridad,
      estado_ot:           o.estado_ot,
      id_tecnico:          o.id_tecnico           ? String(o.id_tecnico)   : '',
      id_supervisor:       o.id_supervisor        ? String(o.id_supervisor): '',
      fecha_programada:    o.fecha_programada     ? o.fecha_programada.slice(0,16) : '',
      fecha_cierre:        o.fecha_cierre         ? o.fecha_cierre.slice(0,10)     : '',
      descripcion_falla:   o.descripcion_falla    ?? '',
      acciones_realizadas: o.acciones_realizadas  ?? '',
    });
  };

  const submitEdit = async () => {
    if (!editingId) return;
    setSaving(true); setError(null);
    try {
      const res  = await apiFetch(`/api/gmao/ordenes/${editingId}`, { method: 'PUT', body: JSON.stringify(buildBody(editDraft)) });
      const body = await res.json();
      if (!res.ok) { setError(body?.error ?? `Error ${res.status}`); return; }
      setEditingId(null);
      setDetailOT(null);
      await recargar();
    } catch (e: any) { setError(e?.message ?? 'Error de conexión'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/gmao/ordenes/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) { const b = await res.json(); setError(b?.error ?? 'Error al eliminar'); return; }
      setDeleteId(null);
      await recargar();
    } catch (e: any) { setError(e?.message ?? 'Error de conexión'); }
    finally { setSaving(false); }
  };

  return {
    filtered, activos, usuarios, loading, saving, error, setError,
    search, setSearch, filtroEstado, setFiltroEstado, filtroPrior, setFiltroPrior,
    drawerOpen, setDrawerOpen, form, setField, submitNuevo,
    editingId, editDraft, setEditField, startEdit, submitEdit, cancelEdit: () => setEditingId(null),
    deleteId, setDeleteId, confirmDelete,
    detailOT, setDetailOT,
    exportExcel,
    total: ordenes.length,
  };
};
