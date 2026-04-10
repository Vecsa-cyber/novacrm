import React from 'react';
import { AlertTriangle, Plus, Check, X } from 'lucide-react';
import type { Deal } from '../types/pipeline.d';

interface Props {
  lostDeals: Deal[];
  highlightId?: number;
  isAdmin: boolean;
  lossReasons: string[];
  addingReason: boolean;
  setAddingReason: (v: boolean) => void;
  newReason: string;
  setNewReason: (v: string) => void;
  addLossReason: () => void;
  deleteLossReason: (r: string) => void;
  darkMode?: boolean;
}

export const LostDealsSection: React.FC<Props> = ({
  lostDeals, highlightId, isAdmin,
  lossReasons, addingReason, setAddingReason, newReason, setNewReason,
  addLossReason, deleteLossReason, darkMode = false,
}) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;

  return (
    <div className={`rounded-[1.5rem] shadow-soft border overflow-hidden ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`}>

      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${d('border-gray-50 bg-red-50/50', 'border-gray-700 bg-red-900/20')}`}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          <h2 className={`font-black text-sm uppercase tracking-wider ${d('text-slate-800', 'text-gray-100')}`}>Pérdidas</h2>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">{lostDeals.length}</span>
        </div>
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
                  className={`text-xs font-medium border rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 w-44 ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-700 border-gray-600 text-gray-100')}`}
                />
                <button onClick={addLossReason} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Check size={14} /></button>
                <button onClick={() => setAddingReason(false)} className={`p-1.5 text-gray-400 rounded-lg ${d('hover:bg-gray-100', 'hover:bg-gray-700')}`}><X size={14} /></button>
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

      {/* Chips de razones */}
      {isAdmin && (
        <div className={`flex flex-wrap gap-2 px-6 py-3 border-b ${d('border-gray-50 bg-gray-50/30', 'border-gray-700 bg-gray-700/20')}`}>
          {lossReasons.map(r => (
            <span key={r} className={`flex items-center gap-1.5 border text-xs font-semibold px-3 py-1 rounded-full ${d('bg-white border-gray-200 text-slate-600', 'bg-gray-700 border-gray-600 text-gray-300')}`}>
              {r}
              <button onClick={() => deleteLossReason(r)} className="text-gray-300 hover:text-red-400 transition-colors"><X size={11} /></button>
            </span>
          ))}
        </div>
      )}

      {/* Tabla */}
      {lostDeals.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">No hay tratos perdidos</p>
      ) : (
        <div className={`divide-y ${d('divide-gray-50', 'divide-gray-700')}`}>
          <div className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_2fr] gap-4 px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider ${d('bg-gray-50/30', 'bg-gray-700/20')}`}>
            <span>Trato</span><span>Empresa</span><span>Vendedor</span><span>Valor</span><span>Razón de pérdida</span>
          </div>
          {lostDeals.map(deal => (
            <div key={deal.id} className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_2fr] gap-4 px-6 py-3 items-center transition-colors ${
              deal.id === highlightId
                ? d('bg-blue-50 ring-1 ring-inset ring-blue-300', 'bg-blue-900/20 ring-1 ring-inset ring-blue-500')
                : d('hover:bg-red-50/30', 'hover:bg-red-900/10')
            }`}>
              <span className={`font-bold text-sm truncate ${d('text-slate-700', 'text-gray-200')}`}>{deal.title}</span>
              <span className={`text-xs font-medium truncate ${d('text-slate-500', 'text-gray-400')}`}>{deal.company}</span>
              <span className="text-xs font-bold text-blue-400">{deal.user}</span>
              <span className={`font-black text-sm ${d('text-slate-700', 'text-gray-200')}`}>{deal.value}</span>
              <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full w-fit">{deal.lossReason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
