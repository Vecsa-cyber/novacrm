import React from 'react';
import {
  Plus, Edit2, Trash2, ArrowLeft, ArrowRight, User,
  Calendar, Clock, Check, X, AlertTriangle, ChevronDown,
} from 'lucide-react';
import type { Stage, Deal } from '../types/pipeline.d';

interface Props {
  stages: Stage[];
  visibleDeals: Deal[];
  highlightId?: number;
  isAdmin: boolean;
  editingStageId: number | null;
  setEditingStageId: (id: number | null) => void;
  editingStageName: string;
  setEditingStageName: (name: string) => void;
  editInputRef: React.RefObject<HTMLInputElement | null>;
  addingStage: boolean;
  setAddingStage: (v: boolean) => void;
  newStageName: string;
  setNewStageName: (v: string) => void;
  startEditStage: (stage: Stage) => void;
  saveStage: () => void;
  deleteStage: (id: number) => void;
  addStage: () => void;
  moveStage: (id: number, dir: 'left' | 'right') => void;
  lossModal: number | null;
  setLossModal: (id: number | null) => void;
  selectedReason: string;
  setSelectedReason: (r: string) => void;
  lossReasons: string[];
  confirmLoss: (id: number) => void;
  confirmDeleteId: number | null;
  setConfirmDeleteId: (id: number | null) => void;
  deleteDeal: (id: number) => void;
  openEdit: (deal: Deal) => void;
  moveDeal: (id: number, dir: 'next' | 'prev') => void;
  darkMode?: boolean;
}

export const KanbanBoard: React.FC<Props> = ({
  stages, visibleDeals, highlightId, isAdmin,
  editingStageId, setEditingStageId, editingStageName, setEditingStageName, editInputRef,
  addingStage, setAddingStage, newStageName, setNewStageName,
  startEditStage, saveStage, deleteStage, addStage, moveStage,
  lossModal, setLossModal, selectedReason, setSelectedReason, lossReasons, confirmLoss,
  confirmDeleteId, setConfirmDeleteId, deleteDeal, openEdit, moveDeal,
  darkMode = false,
}) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 items-start" style={{ minWidth: `${stages.length * 316 + (isAdmin ? 180 : 0)}px` }}>

        {stages.map((stage, stageIdx) => {
          const stageDeals = visibleDeals.filter(deal => deal.stageId === stage.id);
          const isEditing  = editingStageId === stage.id;

          return (
            <div key={stage.id} className={`flex-shrink-0 w-[300px] rounded-3xl border p-3 flex flex-col ${
              darkMode ? 'bg-gray-800/60 border-gray-700' : stage.color
            }`}>

              {/* Cabecera columna */}
              <div className="flex justify-between items-center mb-3 px-2 pt-1 gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      ref={editInputRef}
                      value={editingStageName}
                      onChange={e => setEditingStageName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveStage(); if (e.key === 'Escape') setEditingStageId(null); }}
                      className={`flex-1 text-xs font-black uppercase tracking-wider border border-blue-300 rounded-lg px-2 py-1 outline-none min-w-0 ${d('bg-white', 'bg-gray-700 text-gray-100')}`}
                    />
                    <button onClick={saveStage} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Check size={14} /></button>
                    <button onClick={() => setEditingStageId(null)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg"><X size={14} /></button>
                  </div>
                ) : (
                  <h3 className={`font-black text-xs uppercase tracking-wider flex-1 truncate ${d('text-slate-700', 'text-gray-300')}`}>
                    {stageIdx + 1}. {stage.name}
                  </h3>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${d('bg-white text-slate-600', 'bg-gray-700 text-gray-300')}`}>
                    {stageDeals.length}
                  </span>
                  {isAdmin && !isEditing && (
                    <>
                      <button onClick={() => moveStage(stage.id, 'left')} disabled={stageIdx === 0}
                        className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg disabled:opacity-30 transition-colors"><ArrowLeft size={13} /></button>
                      <button onClick={() => moveStage(stage.id, 'right')} disabled={stageIdx === stages.length - 1}
                        className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg disabled:opacity-30 transition-colors"><ArrowRight size={13} /></button>
                      <button onClick={() => startEditStage(stage)}
                        className="p-1 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg"><Edit2 size={13} /></button>
                      <button onClick={() => deleteStage(stage.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                    </>
                  )}
                </div>
              </div>

              {/* Tarjetas */}
              <div className="flex flex-col gap-3 overflow-y-auto pr-1 pb-2 max-h-[60vh]">
                {stageDeals.map(deal => (
                  <div key={deal.id} className={`p-4 rounded-2xl shadow-sm border transition-shadow group flex flex-col gap-3 ${
                    deal.id === highlightId
                      ? 'border-blue-400 ring-2 ring-blue-300 shadow-blue-100 shadow-md'
                      : d('bg-white border-gray-100 hover:shadow-md', 'bg-gray-800 border-gray-700 hover:border-gray-600')
                  }`}>

                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`font-bold text-sm leading-tight ${d('text-gray-800', 'text-gray-100')}`}>{deal.title}</h4>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => openEdit(deal)} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg"><Edit2 size={13} /></button>
                        {confirmDeleteId === deal.id ? (
                          <>
                            <button onClick={() => deleteDeal(deal.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"><Check size={13} /></button>
                            <button onClick={() => setConfirmDeleteId(null)} className={`p-1.5 text-gray-400 rounded-lg ${d('hover:bg-gray-100', 'hover:bg-gray-700')}`}><X size={13} /></button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(deal.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className={`text-xs font-medium truncate ${d('text-slate-500', 'text-gray-400')}`}>{deal.company}</p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <User size={11} className="text-blue-500" />
                        <span className="font-medium text-blue-400">{deal.user}</span>
                      </div>
                    </div>

                    <p className={`font-black text-lg ${d('text-slate-800', 'text-gray-100')}`}>{deal.value}</p>

                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold w-fit ${
                      deal.statusType === 'danger'  ? 'bg-red-50 text-red-600' :
                      deal.statusType === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {deal.statusType === 'danger' ? <Clock size={11} /> : <Calendar size={11} />}
                      <span className="truncate max-w-[180px]">{deal.status}</span>
                    </div>

                    <div className={`flex items-center justify-between pt-2 mt-1 border-t gap-1 ${d('border-gray-50', 'border-gray-700')}`}>
                      <button
                        onClick={() => { setLossModal(deal.id); setSelectedReason(''); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors whitespace-nowrap"
                      >
                        <AlertTriangle size={12} /> Pérdida
                      </button>
                      <div className="flex gap-1.5">
                        <button onClick={() => moveDeal(deal.id, 'prev')} disabled={deal.stageId === 1}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 transition-colors ${d('text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100', 'text-gray-400 bg-gray-700 border border-gray-600 hover:bg-gray-600')}`}>
                          <ArrowLeft size={12} />
                        </button>
                        <button onClick={() => moveDeal(deal.id, 'next')} disabled={deal.stageId === stages.length}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-30 transition-colors">
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>

                    {lossModal === deal.id && (
                      <div className={`border rounded-xl p-3 flex flex-col gap-2 mt-1 ${d('border-red-200 bg-red-50', 'border-red-800 bg-red-900/30')}`}>
                        <p className="text-xs font-black text-red-500 uppercase tracking-wide">Razón de pérdida</p>
                        <div className="relative">
                          <select
                            value={selectedReason}
                            onChange={e => setSelectedReason(e.target.value)}
                            className={`w-full appearance-none border border-red-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none pr-8 ${d('bg-white text-slate-700', 'bg-gray-700 text-gray-200')}`}
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
                            className={`flex-1 border text-xs font-bold py-1.5 rounded-lg transition-colors ${d('bg-white border-gray-200 text-gray-600 hover:bg-gray-50', 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600')}`}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className={`border-2 border-dashed rounded-2xl h-20 flex items-center justify-center ${d('border-gray-200', 'border-gray-700')}`}>
                    <p className={`text-xs font-medium ${d('text-gray-400', 'text-gray-500')}`}>Sin tratos</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Botón agregar etapa */}
        {isAdmin && (
          <div className="flex-shrink-0 w-[200px]">
            {addingStage ? (
              <div className={`rounded-3xl border border-dashed border-blue-300 p-4 flex flex-col gap-2 ${d('bg-white', 'bg-gray-800')}`}>
                <input
                  autoFocus
                  value={newStageName}
                  onChange={e => setNewStageName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addStage(); if (e.key === 'Escape') setAddingStage(false); }}
                  placeholder="Nombre de etapa..."
                  className={`text-xs font-bold border rounded-lg px-3 py-2 outline-none focus:border-blue-400 ${d('bg-gray-50 border-gray-200 text-gray-800', 'bg-gray-700 border-gray-600 text-gray-100')}`}
                />
                <div className="flex gap-2">
                  <button onClick={addStage} className="flex-1 bg-blue-500 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-blue-600 transition-colors">Agregar</button>
                  <button onClick={() => setAddingStage(false)} className={`p-1.5 text-gray-400 rounded-lg ${d('hover:bg-gray-100', 'hover:bg-gray-700')}`}><X size={14} /></button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingStage(true)}
                className={`w-full h-24 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-1 hover:border-blue-300 hover:text-blue-400 transition-colors ${d('border-gray-200 text-gray-400', 'border-gray-700 text-gray-500')}`}
              >
                <Plus size={20} />
                <span className="text-xs font-bold">Agregar etapa</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
