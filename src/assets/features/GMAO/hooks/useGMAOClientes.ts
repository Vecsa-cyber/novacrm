import { useState, useEffect } from 'react';
import { apiFetch } from '../../../../lib/apiFetch';

export interface GMAOCliente {
  id_gmao_cliente: number;
  folio: string;           // CLI-001 generado en frontend
  nombre_fiscal: string;
  rfc: string;
  contacto_principal: string;
  telefono_mantenimiento: string;
  id_planta: number | null;
  nombre_planta: string;
}

export interface ClienteForm {
  nombre_fiscal: string;
  rfc: string;
  contacto_principal: string;
  telefono_mantenimiento: string;
  id_planta: string;
}

const EMPTY_FORM: ClienteForm = {
  nombre_fiscal: '',
  rfc: '',
  contacto_principal: '',
  telefono_mantenimiento: '',
  id_planta: '',
};

const toFolio = (id: number) => `CLI-${String(id).padStart(3, '0')}`;

export const useGMAOClientes = () => {
  const [clientes,  setClientes]  = useState<GMAOCliente[]>([]);
  const [plantas,   setPlantas]   = useState<{ id_planta: number; nombre_planta: string }[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [search,    setSearch]    = useState('');

  // Drawer nuevo
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form,       setForm]       = useState<ClienteForm>(EMPTY_FORM);
  const setField = (k: keyof ClienteForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Edición inline
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editDraft, setEditDraft]   = useState<ClienteForm>(EMPTY_FORM);
  const setEditField = (k: keyof ClienteForm, v: string) => setEditDraft(f => ({ ...f, [k]: v }));

  // Modal eliminar
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const recargar = async () => {
    setLoading(true);
    try {
      const res  = await apiFetch('/api/gmao/clientes');
      const data = await res.json();
      setClientes((data as any[]).map(r => ({ ...r, folio: toFolio(r.id_gmao_cliente) })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    recargar();
    apiFetch('/api/plantas')
      .then(r => r.json())
      .then((data: any) => setPlantas(data))
      .catch(() => {});
  }, []);

  const filtered = clientes.filter(c => {
    const q = search.toLowerCase();
    return !q ||
      c.nombre_fiscal.toLowerCase().includes(q) ||
      c.rfc.toLowerCase().includes(q) ||
      c.contacto_principal.toLowerCase().includes(q) ||
      c.nombre_planta?.toLowerCase().includes(q);
  });

  const submitNuevo = async () => {
    if (!form.nombre_fiscal.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch('/api/gmao/clientes', {
        method: 'POST',
        body: JSON.stringify({
          nombre_fiscal:          form.nombre_fiscal.trim(),
          rfc:                    form.rfc.trim()                    || null,
          contacto_principal:     form.contacto_principal.trim()     || null,
          telefono_mantenimiento: form.telefono_mantenimiento.trim() || null,
          id_planta:              form.id_planta ? Number(form.id_planta) : null,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body?.error ?? `Error ${res.status}`);
        return;
      }
      setForm(EMPTY_FORM);
      setDrawerOpen(false);
      await recargar();
    } catch (e: any) {
      setError(e?.message ?? 'Error de conexión con el servidor');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c: GMAOCliente) => {
    setEditingId(c.id_gmao_cliente);
    setEditDraft({
      nombre_fiscal:          c.nombre_fiscal,
      rfc:                    c.rfc,
      contacto_principal:     c.contacto_principal,
      telefono_mantenimiento: c.telefono_mantenimiento,
      id_planta:              c.id_planta ? String(c.id_planta) : '',
    });
  };

  const submitEdit = async () => {
    if (!editingId || !editDraft.nombre_fiscal.trim()) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/gmao/clientes/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombre_fiscal:          editDraft.nombre_fiscal.trim(),
          rfc:                    editDraft.rfc.trim()                    || null,
          contacto_principal:     editDraft.contacto_principal.trim()     || null,
          telefono_mantenimiento: editDraft.telefono_mantenimiento.trim() || null,
          id_planta:              editDraft.id_planta ? Number(editDraft.id_planta) : null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setEditingId(null);
      await recargar();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/gmao/clientes/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setDeleteId(null);
      await recargar();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return {
    filtered, plantas, loading, saving, error, setError, search, setSearch,
    drawerOpen, setDrawerOpen, form, setField, submitNuevo,
    editingId, editDraft, setEditField, startEdit, submitEdit, cancelEdit: () => setEditingId(null),
    deleteId, setDeleteId, confirmDelete,
    total: clientes.length,
  };
};
