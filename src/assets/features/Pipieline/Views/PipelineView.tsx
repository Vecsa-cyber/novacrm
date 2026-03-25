import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, Plus, Edit2, Trash2, ArrowLeft, ArrowRight, User,
         Calendar, Clock, Check, X, AlertTriangle, ChevronDown } from 'lucide-react';

interface PipelineProps { currentUser: any; }

interface Stage { id: number; name: string; color: string; }
interface Deal {
  id: number; title: string; company: string; user: string;
  value: string; stageId: number; status: string;
  statusType: string; progress: string; lossReason?: string;
}

const STAGE_COLORS = [
  'bg-slate-50 border-slate-200', 'bg-blue-50 border-blue-200',
  'bg-indigo-50 border-indigo-200', 'bg-purple-50 border-purple-200',
  'bg-pink-50 border-pink-200', 'bg-emerald-50 border-emerald-200',
  'bg-orange-50 border-orange-200', 'bg-teal-50 border-teal-200',
];

const initialStages: Stage[] = [
  { id: 1, name: 'PROSPECTO GENERAL',    color: STAGE_COLORS[0] },
  { id: 2, name: 'PROSPECTO CALIFICADO', color: STAGE_COLORS[1] },
  { id: 3, name: 'VISITA PENDIENTE',     color: STAGE_COLORS[2] },
  { id: 4, name: 'INFO PENDIENTE',       color: STAGE_COLORS[3] },
  { id: 5, name: 'COTIZACIÓN ENVIADA',   color: STAGE_COLORS[4] },
  { id: 6, name: 'GANADA',               color: STAGE_COLORS[5] },
];

const initialDeals: Deal[] = [
  { id: 101, title: 'Servicio correctivo', company: 'Lear Ramos Arizpe', user: 'Eduardo', value: '$0',       stageId: 3, status: 'Vencida 10-feb',     statusType: 'danger',  progress: '40%'  },
  { id: 102, title: 'Reducción de costos', company: 'Quaker Houghton',   user: 'Eduardo', value: '$0',       stageId: 4, status: 'Vencida 09-mar',     statusType: 'danger',  progress: '55%'  },
  { id: 103, title: 'Dispensadores agua',  company: 'Caterpillar',       user: 'Ricardo', value: '$15,000',  stageId: 5, status: 'Vencida 03-mar',     statusType: 'danger',  progress: '70%'  },
  { id: 104, title: 'Renovación anual',    company: 'Emerson Acuña',     user: 'Eduardo', value: '$120,000', stageId: 6, status: 'Ganado',              statusType: 'success', progress: '100%' },
  { id: 105, title: 'Póliza equipos',      company: 'Mubea Planta',      user: 'Eduardo', value: '$25,000',  stageId: 3, status: '01-abr · Pdte visita',statusType: 'info',    progress: '40%'  },
];

const INITIAL_LOSS_REASONS = [
  'Precio no competitivo',
  'Sin presupuesto del cliente',
  'Perdido con competidor',
  'Proyecto cancelado',
  'Sin respuesta del cliente',
  'Otro',
];

const ALL_USERS    = ['Todos', ...Array.from(new Set(initialDeals.map(d => d.user)))];
const VENDEDORES   = Array.from(new Set(initialDeals.map(d => d.user)));

const emptyForm = { title: '', company: '', user: '', value: '', fecha: '', stageId: '1' };

export const PipelineView: React.FC<PipelineProps> = ({ currentUser }) => {
  const isAdmin = currentUser?.rol === 1;

  const [stages, setStages]           = useState<Stage[]>(initialStages);
  const [deals, setDeals]             = useState<Deal[]>(initialDeals);
  const [filterUser, setFilterUser]   = useState('Todos');
  const [lossReasons, setLossReasons] = useState<string[]>(INITIAL_LOSS_REASONS);

  // Admin — editar etapa
  const [editingStageId, setEditingStageId]   = useState<number | null>(null);
  const [editingStageName, setEditingStageName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Admin — nueva etapa
  const [addingStage, setAddingStage]     = useState(false);
  const [newStageName, setNewStageName]   = useState('');

  // Admin — nueva razón de pérdida
  const [addingReason, setAddingReason]   = useState(false);
  const [newReason, setNewReason]         = useState('');

  // Modal de pérdida (todos los usuarios)
  const [lossModal, setLossModal]           = useState<number | null>(null);
  const [selectedReason, setSelectedReason] = useState('');

  // Drawer — nuevo trato
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [form, setForm]               = useState(emptyForm);
  const setField = (k: keyof typeof emptyForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submitDeal = () => {
    if (!form.title || !form.company || !form.user) return;
    const newDeal: Deal = {
      id: Date.now(), title: form.title, company: form.company,
      user: form.user, value: form.value || '$0', stageId: Number(form.stageId) || 1,
      status: form.fecha ? form.fecha : 'Pendiente', statusType: 'info', progress: '0%',
    };
    setDeals(prev => [...prev, newDeal]);
    setForm(emptyForm);
    setNewDealOpen(false);
  };

  useEffect(() => {
    if (editingStageId !== null) editInputRef.current?.focus();
  }, [editingStageId]);

  // --- Helpers ---
  const activeDeals = deals.filter(d => !d.lossReason);
  const lostDeals   = deals.filter(d => !!d.lossReason);
  const visibleDeals = filterUser === 'Todos'
    ? activeDeals
    : activeDeals.filter(d => d.user === filterUser);

  const moveDeal = (dealId: number, dir: 'next' | 'prev') => {
    setDeals(prev => prev.map(d => {
      if (d.id !== dealId) return d;
      const next = dir === 'next' ? d.stageId + 1 : d.stageId - 1;
      if (next >= 1 && next <= stages.length) return { ...d, stageId: next };
      return d;
    }));
  };

  const confirmLoss = (dealId: number) => {
    if (!selectedReason) return;
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, lossReason: selectedReason } : d));
    setLossModal(null);
    setSelectedReason('');
  };

  // Admin — etapas
  const startEditStage = (stage: Stage) => {
    setEditingStageId(stage.id);
    setEditingStageName(stage.name);
  };
  const saveStage = () => {
    if (!editingStageName.trim()) return;
    setStages(prev => prev.map(s => s.id === editingStageId ? { ...s, name: editingStageName.trim() } : s));
    setEditingStageId(null);
  };
  const deleteStage = (stageId: number) => {
    if (stages.length <= 1) return;
    setStages(prev => prev.filter(s => s.id !== stageId));
    setDeals(prev => prev.filter(d => d.stageId !== stageId));
  };
  const addStage = () => {
    if (!newStageName.trim()) return;
    const newId = Math.max(...stages.map(s => s.id)) + 1;
    setStages(prev => [...prev, { id: newId, name: newStageName.trim(), color: STAGE_COLORS[newId % STAGE_COLORS.length] }]);
    setNewStageName('');
    setAddingStage(false);
  };

  // Admin — reordenar etapas
  const moveStage = (stageId: number, dir: 'left' | 'right') => {
    setStages(prev => {
      const idx = prev.findIndex(s => s.id === stageId);
      if (idx < 0) return prev;
      const targetIdx = dir === 'left' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[targetIdx]] = [copy[targetIdx], copy[idx]];
      return copy;
    });
  };

  // Admin — razones de pérdida
  const addLossReason = () => {
    if (!newReason.trim() || lossReasons.includes(newReason.trim())) return;
    setLossReasons(prev => [...prev, newReason.trim()]);
    setNewReason('');
    setAddingReason(false);
  };
  const deleteLossReason = (reason: string) => {
    setLossReasons(prev => prev.filter(r => r !== reason));
  };

  return (
    <div className="flex flex-col gap-6 fade-in">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <TrendingUp className="text-blue-500" size={28} />
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Pipeline de ventas</h1>
          </div>
          <p className="text-slate-400 font-medium mt-0.5 text-sm">
            {isAdmin ? 'Modo Admin — puedes editar etapas y razones de pérdida' : 'Mueve tus tratos hacia el cierre'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Filtro por vendedor — solo Admin */}
          {isAdmin && (
            <select
              value={filterUser}
              onChange={e => setFilterUser(e.target.value)}
              className="bg-white border border-gray-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
            >
              {ALL_USERS.map(u => <option key={u}>{u}</option>)}
            </select>
          )}
          <button
            onClick={() => { setForm(emptyForm); setNewDealOpen(true); }}
            className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-soft hover:-translate-y-0.5 transition-transform text-sm whitespace-nowrap">
            <Plus size={18} /> Nuevo trato
          </button>
        </div>
      </div>

      {/* ── KANBAN ── */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 items-start" style={{ minWidth: `${stages.length * 316 + (isAdmin ? 180 : 0)}px` }}>

          {stages.map((stage, stageIdx) => {
            const stageDeals = visibleDeals.filter(d => d.stageId === stage.id);
            const isEditing  = editingStageId === stage.id;

            return (
              <div key={stage.id} className={`flex-shrink-0 w-[300px] rounded-3xl border ${stage.color} p-3 flex flex-col`}>

                {/* Cabecera de columna */}
                <div className="flex justify-between items-center mb-3 px-2 pt-1 gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        ref={editInputRef}
                        value={editingStageName}
                        onChange={e => setEditingStageName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveStage(); if (e.key === 'Escape') setEditingStageId(null); }}
                        className="flex-1 text-xs font-black uppercase tracking-wider bg-white border border-blue-300 rounded-lg px-2 py-1 outline-none min-w-0"
                      />
                      <button onClick={saveStage} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Check size={14} /></button>
                      <button onClick={() => setEditingStageId(null)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg"><X size={14} /></button>
                    </div>
                  ) : (
                    <h3 className="font-black text-xs text-slate-700 uppercase tracking-wider flex-1 truncate">{stageIdx + 1}. {stage.name}</h3>
                  )}

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="bg-white text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{stageDeals.length}</span>
                    {isAdmin && !isEditing && (
                      <>
                        <button onClick={() => moveStage(stage.id, 'left')} disabled={stageIdx === 0}
                          className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
                          title="Mover a la izquierda"><ArrowLeft size={13} /></button>
                        <button onClick={() => moveStage(stage.id, 'right')} disabled={stageIdx === stages.length - 1}
                          className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
                          title="Mover a la derecha"><ArrowRight size={13} /></button>
                        <button onClick={() => startEditStage(stage)} className="p-1 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg"><Edit2 size={13} /></button>
                        <button onClick={() => deleteStage(stage.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                      </>
                    )}
                  </div>
                </div>

                {/* Tarjetas */}
                <div className="flex flex-col gap-3 overflow-y-auto pr-1 pb-2 max-h-[60vh]">
                  {stageDeals.map(deal => (
                    <div key={deal.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col gap-3">

                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-gray-800 text-sm leading-tight">{deal.title}</h4>
                        {isAdmin && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg"><Edit2 size={13} /></button>
                            <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-slate-500 font-medium truncate">{deal.company}</p>
                        <div className="flex items-center gap-1.5 text-xs">
                          <User size={11} className="text-blue-500" />
                          <span className="font-medium text-blue-500">{deal.user}</span>
                        </div>
                      </div>

                      <p className="font-black text-lg text-slate-800">{deal.value}</p>

                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold w-fit ${
                        deal.statusType === 'danger'  ? 'bg-red-50 text-red-600' :
                        deal.statusType === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {deal.statusType === 'danger' ? <Clock size={11} /> : <Calendar size={11} />}
                        <span className="truncate max-w-[180px]">{deal.status}</span>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-50 gap-1">
                        <button
                          onClick={() => { setLossModal(deal.id); setSelectedReason(''); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors whitespace-nowrap"
                        >
                          <AlertTriangle size={12} /> Pérdida
                        </button>
                        <div className="flex gap-1.5">
                          <button onClick={() => moveDeal(deal.id, 'prev')} disabled={deal.stageId === 1}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                            <ArrowLeft size={12} />
                          </button>
                          <button onClick={() => moveDeal(deal.id, 'next')} disabled={deal.stageId === stages.length}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-30 transition-colors">
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Modal inline de razón de pérdida */}
                      {lossModal === deal.id && (
                        <div className="border border-red-200 bg-red-50 rounded-xl p-3 flex flex-col gap-2 mt-1">
                          <p className="text-xs font-black text-red-600 uppercase tracking-wide">Razón de pérdida</p>
                          <div className="relative">
                            <select
                              value={selectedReason}
                              onChange={e => setSelectedReason(e.target.value)}
                              className="w-full appearance-none bg-white border border-red-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none pr-8"
                            >
                              <option value="">Seleccionar razón...</option>
                              {lossReasons.map(r => <option key={r}>{r}</option>)}
                            </select>
                            <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => confirmLoss(deal.id)} disabled={!selectedReason}
                              className="flex-1 bg-red-500 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-40 transition-colors">
                              Confirmar
                            </button>
                            <button onClick={() => setLossModal(null)}
                              className="flex-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl h-20 flex items-center justify-center">
                      <p className="text-xs font-medium text-gray-400">Sin tratos</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Botón agregar etapa — solo Admin */}
          {isAdmin && (
            <div className="flex-shrink-0 w-[200px]">
              {addingStage ? (
                <div className="bg-white rounded-3xl border border-dashed border-blue-300 p-4 flex flex-col gap-2">
                  <input
                    autoFocus
                    value={newStageName}
                    onChange={e => setNewStageName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addStage(); if (e.key === 'Escape') setAddingStage(false); }}
                    placeholder="Nombre de etapa..."
                    className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                  />
                  <div className="flex gap-2">
                    <button onClick={addStage} className="flex-1 bg-blue-500 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-blue-600 transition-colors">Agregar</button>
                    <button onClick={() => setAddingStage(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={14} /></button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingStage(true)}
                  className="w-full h-24 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors"
                >
                  <Plus size={20} />
                  <span className="text-xs font-bold">Agregar etapa</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── SECCIÓN DE PÉRDIDAS ── */}
      <div className="bg-white rounded-[1.5rem] shadow-soft border border-gray-50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-red-50/50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="font-black text-sm text-slate-800 uppercase tracking-wider">Pérdidas</h2>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">{lostDeals.length}</span>
          </div>

          {/* Admin — gestionar razones de pérdida */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              {addingReason ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={newReason}
                    onChange={e => setNewReason(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addLossReason(); if (e.key === 'Escape') setAddingReason(false); }}
                    placeholder="Nueva razón..."
                    className="text-xs font-medium bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 w-44"
                  />
                  <button onClick={addLossReason} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Check size={14} /></button>
                  <button onClick={() => setAddingReason(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={14} /></button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingReason(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors border border-blue-200"
                >
                  <Plus size={13} /> Razón de pérdida
                </button>
              )}
            </div>
          )}
        </div>

        {/* Lista de razones (admin) */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2 px-6 py-3 border-b border-gray-50 bg-gray-50/30">
            {lossReasons.map(r => (
              <span key={r} className="flex items-center gap-1.5 bg-white border border-gray-200 text-xs font-semibold text-slate-600 px-3 py-1 rounded-full">
                {r}
                <button onClick={() => deleteLossReason(r)} className="text-gray-300 hover:text-red-400 transition-colors"><X size={11} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Tabla de tratos perdidos */}
        {lostDeals.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No hay tratos perdidos</p>
        ) : (
          <div className="divide-y divide-gray-50">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_2fr] gap-4 px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider bg-gray-50/30">
              <span>Trato</span><span>Empresa</span><span>Vendedor</span><span>Valor</span><span>Razón de pérdida</span>
            </div>
            {lostDeals.map(deal => (
              <div key={deal.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_2fr] gap-4 px-6 py-3 items-center hover:bg-red-50/30 transition-colors">
                <span className="font-bold text-slate-700 text-sm truncate">{deal.title}</span>
                <span className="text-xs text-slate-500 font-medium truncate">{deal.company}</span>
                <span className="text-xs font-bold text-blue-500">{deal.user}</span>
                <span className="font-black text-slate-700 text-sm">{deal.value}</span>
                <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full w-fit">{deal.lossReason}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── DRAWER — NUEVO TRATO ── */}
      {newDealOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setNewDealOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-black text-slate-800">Nuevo trato</h2>
                <p className="text-sm text-slate-400 mt-0.5">Completa los datos del trato</p>
              </div>
              <button onClick={() => setNewDealOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <div className="flex flex-col gap-5 p-6 flex-1">

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Servicio</label>
                <input
                  type="text"
                  placeholder="Ej. Servicio correctivo, Póliza anual..."
                  value={form.title}
                  onChange={e => setField('title', e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Compañía</label>
                <input
                  type="text"
                  placeholder="Ej. Caterpillar, Grupo Alfa..."
                  value={form.company}
                  onChange={e => setField('company', e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Persona asignada</label>
                <div className="relative">
                  <select
                    value={form.user}
                    onChange={e => setField('user', e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors bg-white pr-9"
                  >
                    <option value="">Seleccionar persona...</option>
                    {VENDEDORES.map(u => <option key={u}>{u}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Costo / Presupuesto</label>
                <input
                  type="text"
                  placeholder="$0"
                  value={form.value}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    if (!raw) { setField('value', ''); return; }
                    const formatted = '$' + Number(raw).toLocaleString('en-US');
                    setField('value', formatted);
                  }}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Próxima visita</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={e => setField('fecha', e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors"
                />
                {form.fecha && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Fecha de vencimiento: <span className="font-bold text-slate-700">
                      {new Date(new Date(form.fecha + 'T00:00:00').getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Etapa inicial</label>
                <div className="relative">
                  <select
                    value={form.stageId ?? '1'}
                    onChange={e => setField('stageId', e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors bg-white pr-9"
                  >
                    {stages.map((s, i) => <option key={s.id} value={s.id}>{i + 1}. {s.name}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setNewDealOpen(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Cancelar
              </button>
              <button
                onClick={submitDeal}
                disabled={!form.title || !form.company || !form.user}
                className="flex-1 bg-emerald-500 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-600 transition-colors text-sm disabled:opacity-40"
              >
                Agregar trato
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
