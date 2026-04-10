import React, { useState } from 'react';
import { Briefcase, TrendingUp, Award, Target, XCircle, ChevronDown } from 'lucide-react';
import { useDeals } from '../hooks/useDeals';
import { formatCurrency } from '../constants/deals.constants';
import type { DealsProps, SellerStats } from '../types/deals.d';

// ── Tarjeta de vendedor ──────────────────────────────────────────────────────
const SellerCard: React.FC<{ seller: SellerStats; darkMode?: boolean }> = ({ seller, darkMode = false }) => {
  const [expanded, setExpanded] = useState(false);
  const d = (light: string, dark: string) => darkMode ? dark : light;

  return (
    <div
      className={`rounded-[2rem] shadow-soft border flex flex-col overflow-hidden hover:-translate-y-1 transition-transform duration-300 cursor-pointer ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`}
      onClick={() => setExpanded(p => !p)}
    >
      {/* Cuerpo principal */}
      <div className="p-6 flex flex-col gap-6">

        {/* Cabecera */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border-2 shadow-sm flex-shrink-0 ${d('bg-gray-100 border-white', 'bg-gray-700 border-gray-600')}`}>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seller.nombre}`} alt={seller.nombre} />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-black truncate ${d('text-slate-800', 'text-white')}`}>{seller.nombre}</h3>
              {seller.id_rol === 1 && (
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  Admin
                </span>
              )}
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-medium mt-0.5 ${d('text-nova-slate', 'text-gray-400')}`}>
              <Target size={14} className="text-nova-blue" />
              <span>
                {seller.dealsAssigned} trato{seller.dealsAssigned !== 1 ? 's' : ''} asignado{seller.dealsAssigned !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`flex-shrink-0 transition-transform duration-300 ${expanded ? 'rotate-180' : ''} ${d('text-gray-300', 'text-gray-500')}`}
          />
        </div>

        {/* Métricas financieras */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-2xl p-4 border ${d('bg-emerald-50/50 border-emerald-100/50', 'bg-emerald-900/20 border-emerald-800/50')}`}>
            <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
              <Award size={14} strokeWidth={2.5} />
              <span className="text-xs font-bold uppercase tracking-wider">Ganado</span>
            </div>
            <p className={`font-black text-lg truncate ${d('text-emerald-700', 'text-emerald-400')}`}>{formatCurrency(seller.wonAmount)}</p>
          </div>
          <div className={`rounded-2xl p-4 border ${d('bg-blue-50/50 border-blue-100/50', 'bg-blue-900/20 border-blue-800/50')}`}>
            <div className="flex items-center gap-1.5 text-nova-blue mb-1">
              <TrendingUp size={14} strokeWidth={2.5} />
              <span className="text-xs font-bold uppercase tracking-wider">Pipeline</span>
            </div>
            <p className={`font-black text-lg truncate ${d('text-slate-800', 'text-blue-300')}`}>{formatCurrency(seller.pipelineAmount)}</p>
          </div>
        </div>

        {/* Barra de efectividad */}
        <div className={`pt-2 border-t ${d('border-gray-50', 'border-gray-700')}`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-bold ${d('text-slate-500', 'text-gray-400')}`}>Efectividad de cierre</span>
            <span className={`text-sm font-black ${d('text-slate-800', 'text-gray-100')}`}>{seller.effectiveness}%</span>
          </div>
          <div className={`w-full h-3 rounded-full overflow-hidden ${d('bg-gray-100', 'bg-gray-700')}`}>
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                seller.effectiveness >= 70 ? 'bg-emerald-500' :
                seller.effectiveness >= 40 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${seller.effectiveness}%` }}
            />
          </div>
        </div>

      </div>

      {/* Panel expandible — negocios perdidos */}
      {expanded && (
        <div
          className={`border-t px-6 py-5 flex flex-col gap-3 ${d('border-red-100 bg-red-50/40', 'border-red-900/50 bg-red-900/10')}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <XCircle size={15} className="text-red-400" />
            <span className="text-xs font-black text-red-500 uppercase tracking-wider">Negocios Perdidos</span>
          </div>

          {seller.lostCount === 0 ? (
            <p className={`text-sm font-medium ${d('text-slate-400', 'text-gray-400')}`}>Sin negocios perdidos registrados.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-2xl p-4 border border-red-100 ${d('bg-white', 'bg-gray-800')}`}>
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Tratos perdidos</p>
                <p className="text-2xl font-black text-red-500">{seller.lostCount}</p>
              </div>
              <div className={`rounded-2xl p-4 border border-red-100 ${d('bg-white', 'bg-gray-800')}`}>
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Monto perdido</p>
                <p className="text-lg font-black text-red-500 truncate">{formatCurrency(seller.lostAmount)}</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

// ── Vista principal ──────────────────────────────────────────────────────────
export const DealsView: React.FC<DealsProps> = ({ darkMode = false }) => {
  const { sellers, loading } = useDeals();
  const d = (light: string, dark: string) => darkMode ? dark : light;

  return (
    <div className="flex flex-col gap-6 fade-in h-full pb-10">

      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <Briefcase className="text-nova-blue" size={32} />
            <h1 className={`text-3xl font-black tracking-tight ${d('text-slate-800', 'text-white')}`}>
              Negocios y Rendimiento
            </h1>
          </div>
          <p className={`font-medium mt-1 ${d('text-slate-400', 'text-gray-400')}`}>
            Métricas de ventas, cotizaciones y efectividad por vendedor.
          </p>
        </div>
      </div>

      {loading ? (
        <div className={`flex items-center justify-center h-48 font-medium text-sm ${d('text-slate-400', 'text-gray-400')}`}>
          Cargando datos...
        </div>
      ) : sellers.length === 0 ? (
        <div className={`flex items-center justify-center h-48 font-medium text-sm ${d('text-slate-400', 'text-gray-400')}`}>
          No hay vendedores con tratos registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sellers.map(seller => (
            <SellerCard key={seller.id} seller={seller} darkMode={darkMode} />
          ))}
        </div>
      )}

    </div>
  );
};
