import React from 'react';
import { Edit2, Trash2, ArrowLeft, ArrowRight, Clock, Calendar, AlertTriangle, Check, X } from 'lucide-react';
import type { Stage, Deal } from '../types/pipeline.d';

interface Props {
  stages: Stage[];
  visibleDeals: Deal[];
  highlightId?: number;
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

export const MobileListView: React.FC<Props> = ({
  stages, visibleDeals, highlightId,
  lossModal, setLossModal, selectedReason, setSelectedReason, lossReasons, confirmLoss,
  confirmDeleteId, setConfirmDeleteId, deleteDeal,
  openEdit, moveDeal, darkMode = false,
}) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;

  return (
    <div className="flex flex-col gap-4 md:hidden">
      {stages.map(stage => {
        const stageDeals = visibleDeals.filter(deal => deal.stageId === stage.id);
        return (
          <div key={stage.id} className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-gray-800/60 border-gray-700' : stage.color}`}>
            <div className="flex items-center justify-between px-4 py-3">
              <span className={`font-black text-xs uppercase tracking-wider ${d('text-slate-700', 'text-gray-300')}`}>{stage.name}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${d('bg-white text-slate-600', 'bg-gray-700 text-gray-300')}`}>{stageDeals.length}</span>
            </div>
            {stageDeals.length === 0 ? (
              <div className={`px-4 pb-3 text-xs font-medium ${d('text-gray-400', 'text-gray-500')}`}>Sin tratos</div>
            ) : (
              <div className="flex flex-col gap-2 px-3 pb-3">
                {stageDeals.map(deal => (
                  <div key={deal.id} className={`rounded-xl p-3 shadow-sm border flex flex-col gap-2 ${
                    deal.id === highlightId
                      ? 'border-blue-400 ring-2 ring-blue-300'
                      : d('bg-white border-gray-100', 'bg-gray-800 border-gray-700')
                  }`}>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`font-bold text-sm leading-tight flex-1 ${d('text-gray-800', 'text-gray-100')}`}>{deal.title}</h4>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(deal)} className="p-1.5 text-gray-400 hover:text-amber-500 rounded-lg"><Edit2 size={13} /></button>
                        {confirmDeleteId === deal.id ? (
                          <>
                            <button onClick={() => deleteDeal(deal.id)} className="p-1.5 text-red-500 rounded-lg"><Check size={13} /></button>
                            <button onClick={() => setConfirmDeleteId(null)} className="p-1.5 text-gray-400 rounded-lg"><X size={13} /></button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(deal.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 size={13} /></button>
                        )}
                      </div>
                    </div>

                    <p className={`text-xs truncate ${d('text-slate-500', 'text-gray-400')}`}>{deal.company}</p>

                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-black text-base ${d('text-slate-800', 'text-gray-100')}`}>{deal.value}</p>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                        deal.statusType === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {deal.statusType === 'danger' ? <Clock size={10} /> : <Calendar size={10} />}
                        <span>{deal.status}</span>
                      </div>
                    </div>

                    <div className={`flex items-center justify-between pt-1 border-t ${d('border-gray-50', 'border-gray-700')}`}>
                      <button
                        onClick={() => { setLossModal(deal.id); setSelectedReason(''); }}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold text-red-500 bg-red-50 border border-red-200"
                      >
                        <AlertTriangle size={11} /> Pérdida
                      </button>
                      <div className="flex gap-1.5">
                        <button onClick={() => moveDeal(deal.id, 'prev')} disabled={deal.stageId === 1}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 ${d('text-slate-500 bg-slate-50 border border-slate-200', 'text-gray-400 bg-gray-700 border border-gray-600')}`}>
                          <ArrowLeft size={12} />
                        </button>
                        <button onClick={() => moveDeal(deal.id, 'next')} disabled={deal.stageId === stages.length}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 disabled:opacity-30">
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>

                    {lossModal === deal.id && (
                      <div className={`border rounded-xl p-3 flex flex-col gap-2 ${d('border-red-200 bg-red-50', 'border-red-800 bg-red-900/30')}`}>
                        <p className="text-xs font-black text-red-500 uppercase tracking-wide">Razón de pérdida</p>
                        <select value={selectedReason} onChange={e => setSelectedReason(e.target.value)}
                          className={`w-full border border-red-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none ${d('bg-white text-slate-700', 'bg-gray-700 text-gray-200')}`}>
                          <option value="">Seleccionar razón...</option>
                          {lossReasons.map(r => <option key={r}>{r}</option>)}
                        </select>
                        <div className="flex gap-2">
                          <button onClick={() => confirmLoss(deal.id)} disabled={!selectedReason}
                            className="flex-1 bg-red-500 text-white text-xs font-bold py-1.5 rounded-lg disabled:opacity-40">Confirmar</button>
                          <button onClick={() => setLossModal(null)}
                            className={`flex-1 border text-xs font-bold py-1.5 rounded-lg ${d('bg-white border-gray-200 text-gray-600', 'bg-gray-700 border-gray-600 text-gray-300')}`}>Cancelar</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
