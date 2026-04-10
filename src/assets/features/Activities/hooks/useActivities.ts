import { useState, useMemo, useEffect } from 'react';
import { apiFetch } from '../../../../lib/apiFetch';
import { mapActivity, today, addDays, EMPTY_FORM } from '../constants/activities.constants';
import type { Activity, CatalogoActividad, Planta, UsuarioBasic, ActivityForm } from '../types/activities';

export function useActivities(currentUser: any) {
  const [activities,           setActivities]           = useState<Activity[]>([]);
  const [activeFilter,         setActiveFilter]         = useState('pendientes');
  const [expandedId,           setExpandedId]           = useState<number | null>(null);
  const [drawerOpen,           setDrawerOpen]           = useState(false);
  const [form,                 setFormState]            = useState<ActivityForm>(EMPTY_FORM);
  const [saving,               setSaving]               = useState(false);
  const [addingType,           setAddingType]           = useState(false);
  const [newType,              setNewType]              = useState('');
  const [catalogoActividades,  setCatalogoActividades]  = useState<CatalogoActividad[]>([]);
  const [plantas,              setPlantas]              = useState<Planta[]>([]);
  const [usuarios,             setUsuarios]             = useState<UsuarioBasic[]>([]);

  const setField = (k: keyof ActivityForm, v: string) =>
    setFormState(f => ({ ...f, [k]: v }));

  const recargar = () =>
    apiFetch('/api/actividades')
      .then(r => r.json())
      .then(data => setActivities(data.map(mapActivity)))
      .catch(console.error);

  useEffect(() => { recargar(); }, []);

  useEffect(() => {
    apiFetch('/api/catalogo-actividades').then(r => r.json()).then(setCatalogoActividades).catch(console.error);
    apiFetch('/api/plantas').then(r => r.json()).then(setPlantas).catch(console.error);
    apiFetch('/api/usuarios').then(r => r.json()).then(setUsuarios).catch(console.error);
  }, []);

  const addType = async () => {
    const t = newType.trim();
    if (!t) return;
    await apiFetch('/api/catalogo-actividades', {
      method: 'POST',
      body: JSON.stringify({ nombre_actividad: t }),
    });
    setNewType('');
    setAddingType(false);
    apiFetch('/api/catalogo-actividades').then(r => r.json()).then(setCatalogoActividades);
  };

  const submitActivity = async () => {
    if (!form.id_catalogo || !form.date) return;
    setSaving(true);
    await apiFetch('/api/actividades', {
      method: 'POST',
      body: JSON.stringify({
        id_catalogo:     Number(form.id_catalogo),
        fecha_actividad: form.date,
        id_planta:       form.id_planta  ? Number(form.id_planta)  : null,
        id_usuario:      form.id_usuario ? Number(form.id_usuario) : null,
      }),
    });
    setSaving(false);
    setFormState(EMPTY_FORM);
    setDrawerOpen(false);
    recargar();
  };

  const toggleComplete = async (id: number) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;
    const newValue = !activity.completed;
    setActivities(prev => prev.map(a => a.id === id ? { ...a, completed: newValue } : a));
    try {
      await apiFetch(`/api/actividades/${id}/completada`, {
        method: 'PATCH',
        body: JSON.stringify({ completada: newValue }),
      });
    } catch {
      setActivities(prev => prev.map(a => a.id === id ? { ...a, completed: !newValue } : a));
    }
  };

  const counts = useMemo(() => {
    const n = today(); const in7 = addDays(n, 7); const in30 = addDays(n, 30);
    let pendientes = 0, vencidas = 0, hoy = 0, en7 = 0, en30 = 0, completadas = 0;
    activities.forEach(a => {
      if (a.completed) { completadas++; return; }
      const dd = new Date(a.date + 'T00:00:00');
      if (dd < n) vencidas++;
      else if (dd.getTime() === n.getTime()) hoy++;
      pendientes++;
      if (dd >= n && dd < in7)  en7++;
      if (dd >= n && dd < in30) en30++;
    });
    return { pendientes, vencidas, hoy, '7dias': en7, '30dias': en30, completadas };
  }, [activities]);

  const filtered = useMemo(() => {
    const n = today(); const in7 = addDays(n, 7); const in30 = addDays(n, 30);
    return activities.filter(a => {
      const dd = new Date(a.date + 'T00:00:00');
      switch (activeFilter) {
        case 'pendientes':  return !a.completed;
        case 'vencidas':    return !a.completed && dd < n;
        case 'hoy':         return !a.completed && dd.getTime() === n.getTime();
        case '7dias':       return !a.completed && dd >= n && dd < in7;
        case '30dias':      return !a.completed && dd >= n && dd < in30;
        case 'completadas': return a.completed;
        default: return true;
      }
    });
  }, [activities, activeFilter]);

  const isAdmin = currentUser?.rol === 1;

  const resetForm = () => setFormState(EMPTY_FORM);

  return {
    filtered, counts, activeFilter, setActiveFilter,
    expandedId, setExpandedId,
    drawerOpen, setDrawerOpen,
    form, setField, resetForm,
    saving,
    addingType, setAddingType,
    newType, setNewType, addType,
    catalogoActividades, plantas, usuarios,
    submitActivity, toggleComplete,
    isAdmin,
  };
}
