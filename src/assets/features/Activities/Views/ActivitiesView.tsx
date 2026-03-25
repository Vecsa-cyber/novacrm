import React, { useState, useMemo } from 'react';
import { AlarmClock, Plus, Hourglass, Circle, CalendarDays, CheckSquare, Phone, Users, FileText, Clock, X, ChevronDown, Check } from 'lucide-react';

interface ActivitiesProps {
  currentUser: any;
}

interface Activity {
  id: number;
  title: string;
  type: 'llamada' | 'reunión' | 'tarea' | 'seguimiento';
  company: string;
  user: string;
  date: string;        // YYYY-MM-DD
  completed: boolean;
}

const typeConfig: Record<Activity['type'], { icon: React.ReactNode; color: string }> = {
  llamada:      { icon: <Phone size={14} />,     color: 'bg-blue-50 text-blue-600 border-blue-200' },
  reunión:      { icon: <Users size={14} />,     color: 'bg-purple-50 text-purple-600 border-purple-200' },
  tarea:        { icon: <FileText size={14} />,  color: 'bg-amber-50 text-amber-600 border-amber-200' },
  seguimiento:  { icon: <Clock size={14} />,     color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
};

// --- Helpers de fecha ---
const today = () => {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d;
};
const addDays = (base: Date, n: number) => {
  const d = new Date(base); d.setDate(d.getDate() + n); return d;
};
const initialActivities: Activity[] = [];

const INITIAL_TYPES = ['Llamada', 'Visita', 'Reunión', 'Seguimiento'];
const EMPRESAS: string[] = [];   // vacío por ahora
const USUARIOS: string[] = [];   // vacío por ahora

const emptyForm = { title: '', company: '', user: '', type: '', date: '' };

export const ActivitiesView: React.FC<ActivitiesProps> = ({ currentUser }) => {
  const [activeFilter, setActiveFilter] = useState('pendientes');
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const setField = (k: keyof typeof emptyForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Tipos de actividad (se pueden agregar más)
  const [activityTypes, setActivityTypes] = useState<string[]>(INITIAL_TYPES);
  const [addingType, setAddingType] = useState(false);
  const [newType, setNewType] = useState('');

  const addType = () => {
    const t = newType.trim();
    if (!t || activityTypes.includes(t)) return;
    setActivityTypes(prev => [...prev, t]);
    setNewType('');
    setAddingType(false);
  };

  const submitActivity = () => {
    if (!form.title || !form.type || !form.date) return;
    const typeLower = form.type.toLowerCase() as Activity['type'];
    const newAct: Activity = {
      id: Date.now(), title: form.title, type: typeLower,
      company: form.company, user: form.user, date: form.date, completed: false,
    };
    setActivities(prev => [...prev, newAct]);
    setForm(emptyForm);
    setDrawerOpen(false);
  };

  // --- Clasificación ---
  const counts = useMemo(() => {
    const n = today();
    const in7 = addDays(n, 7);
    const in30 = addDays(n, 30);

    let pendientes = 0, vencidas = 0, hoy = 0, en7 = 0, en30 = 0, completadas = 0;

    activities.forEach(a => {
      if (a.completed) { completadas++; return; }
      const d = new Date(a.date + 'T00:00:00');
      if (d < n)               vencidas++;
      else if (d.getTime() === n.getTime()) hoy++;

      // pendientes = todas las no completadas
      pendientes++;
      if (d >= n && d < in7)  en7++;
      if (d >= n && d < in30) en30++;
    });

    return { pendientes, vencidas, hoy, '7dias': en7, '30dias': en30, completadas };
  }, [activities]);

  // --- Filtrar ---
  const filtered = useMemo(() => {
    const n = today();
    const in7 = addDays(n, 7);
    const in30 = addDays(n, 30);

    return activities.filter(a => {
      const d = new Date(a.date + 'T00:00:00');
      switch (activeFilter) {
        case 'pendientes':  return !a.completed;
        case 'vencidas':    return !a.completed && d < n;
        case 'hoy':         return !a.completed && d.getTime() === n.getTime();
        case '7dias':       return !a.completed && d >= n && d < in7;
        case '30dias':      return !a.completed && d >= n && d < in30;
        case 'completadas': return a.completed;
        default: return true;
      }
    });
  }, [activities, activeFilter]);

  const toggleComplete = (id: number) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const filters = [
    { id: 'pendientes',  label: 'Pendientes',  count: counts.pendientes,  icon: <Hourglass size={16} className="text-amber-500" /> },
    { id: 'vencidas',    label: 'Vencidas',     count: counts.vencidas,    icon: <Circle size={14} className="text-red-500 fill-red-500" /> },
    { id: 'hoy',         label: 'Hoy',          count: counts.hoy,         icon: <Circle size={14} className="text-orange-400 fill-orange-400" /> },
    { id: '7dias',       label: '7 días',       count: counts['7dias'],    icon: <CalendarDays size={16} className="text-blue-400" /> },
    { id: '30dias',      label: '30 días',      count: counts['30dias'],   icon: <CalendarDays size={16} className="text-slate-400" /> },
    { id: 'completadas', label: 'Completadas',  count: counts.completadas, icon: <CheckSquare size={16} className="text-emerald-500" /> },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isOverdue = (a: Activity) => !a.completed && new Date(a.date + 'T00:00:00') < today();

  return (
    <div className="flex flex-col gap-6 fade-in h-full">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <AlarmClock className="text-rose-500" size={32} strokeWidth={2.5} />
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Actividades</h1>
          </div>
          <p className="text-slate-400 font-medium mt-1">
            {counts.pendientes} pendientes · {counts.vencidas} vencidas · {counts.completadas} completadas
          </p>
        </div>

        <button
          onClick={() => { setForm(emptyForm); setDrawerOpen(true); }}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-soft hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center">
          <Plus size={20} /> Nueva actividad
        </button>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 min-w-max">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeFilter === filter.id
                  ? 'bg-nova-bg text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:bg-gray-50'
              }`}
            >
              {filter.icon}
              <span>{filter.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeFilter === filter.id
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE ACTIVIDADES */}
      <div className="flex-1 bg-white rounded-[2rem] shadow-soft border border-gray-50 overflow-hidden flex flex-col">

        {filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="flex flex-col items-center justify-center text-center max-w-sm opacity-60">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <CheckSquare size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2">Todo al día</h3>
              <p className="text-sm font-medium text-gray-500">
                No hay actividades en esta vista por el momento.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(a => {
              const cfg = typeConfig[a.type];
              return (
                <div key={a.id} className={`flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50/50 transition-colors ${a.completed ? 'opacity-50' : ''}`}>

                  {/* Check */}
                  <button
                    onClick={() => toggleComplete(a.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      a.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300 hover:border-emerald-400'
                    }`}
                  >
                    {a.completed && <CheckSquare size={14} />}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${a.completed ? 'line-through text-gray-400' : 'text-slate-800'}`}>
                      {a.title}
                    </p>
                    <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{a.company} · {a.user}</p>
                  </div>

                  {/* Tipo */}
                  <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${cfg.color}`}>
                    {cfg.icon} {a.type.charAt(0).toUpperCase() + a.type.slice(1)}
                  </span>

                  {/* Fecha */}
                  <span className={`text-xs font-bold flex-shrink-0 px-3 py-1.5 rounded-lg ${
                    a.completed
                      ? 'bg-gray-50 text-gray-400'
                      : isOverdue(a)
                        ? 'bg-red-50 text-red-600'
                        : 'bg-slate-50 text-slate-600'
                  }`}>
                    {isOverdue(a) && !a.completed ? 'Vencida · ' : ''}{formatDate(a.date)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DRAWER — NUEVA ACTIVIDAD ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-black text-slate-800">Nueva actividad</h2>
                <p className="text-sm text-slate-400 mt-0.5">Completa los datos de la actividad</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <div className="flex flex-col gap-5 p-6 flex-1">

              {/* Actividad */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Actividad</label>
                <input
                  type="text"
                  placeholder="Ej. Llamar a cliente, Enviar cotización..."
                  value={form.title}
                  onChange={e => setField('title', e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              {/* Empresa */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Empresa</label>
                <div className="relative">
                  <select
                    value={form.company}
                    onChange={e => setField('company', e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors bg-white pr-9"
                  >
                    <option value="">Seleccionar empresa...</option>
                    {EMPRESAS.map(e => <option key={e}>{e}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Usuario */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Usuario asignado</label>
                <div className="relative">
                  <select
                    value={form.user}
                    onChange={e => setField('user', e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors bg-white pr-9"
                  >
                    <option value="">Seleccionar usuario...</option>
                    {USUARIOS.map(u => <option key={u}>{u}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Tipo de actividad */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tipo de actividad</label>
                <div className="relative">
                  <select
                    value={form.type}
                    onChange={e => setField('type', e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors bg-white pr-9"
                  >
                    <option value="">Seleccionar tipo...</option>
                    {activityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>

                {/* Agregar nuevo tipo */}
                {addingType ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      autoFocus
                      value={newType}
                      onChange={e => setNewType(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addType(); if (e.key === 'Escape') setAddingType(false); }}
                      placeholder="Nuevo tipo..."
                      className="flex-1 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                    />
                    <button onClick={addType} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Check size={14} /></button>
                    <button onClick={() => setAddingType(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={14} /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingType(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors border border-blue-200 w-fit mt-1"
                  >
                    <Plus size={13} /> Agregar tipo
                  </button>
                )}
              </div>

              {/* Fecha */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setField('date', e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setDrawerOpen(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Cancelar
              </button>
              <button
                onClick={submitActivity}
                disabled={!form.title || !form.type || !form.date}
                className="flex-1 bg-emerald-500 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-600 transition-colors text-sm disabled:opacity-40"
              >
                Agregar actividad
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
