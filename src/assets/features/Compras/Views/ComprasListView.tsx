import React from 'react';
import { ShoppingBag, Construction } from 'lucide-react';

interface Props { darkMode?: boolean; }

export const ComprasListView: React.FC<Props> = ({ darkMode = false }) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;
  return (
    <div className="flex flex-col gap-6 fade-in pb-24 px-2 sm:px-0">
      <div className="flex items-center gap-3">
        <ShoppingBag className="text-emerald-500 flex-shrink-0" size={28} />
        <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${d('text-slate-800', 'text-white')}`}>
          Compras
        </h1>
      </div>
      <div className={`rounded-2xl md:rounded-[2rem] shadow-soft border p-10 flex flex-col items-center justify-center gap-4 text-center ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${d('bg-emerald-50', 'bg-emerald-900/20')}`}>
          <Construction size={32} className="text-emerald-400" />
        </div>
        <h2 className={`text-xl font-black ${d('text-slate-700', 'text-white')}`}>Estamos trabajando en ello</h2>
        <p className={`text-sm max-w-sm ${d('text-slate-400', 'text-gray-400')}`}>
          Esta sección estará disponible próximamente. Estamos construyendo la vista de Compras.
        </p>
      </div>
    </div>
  );
};
