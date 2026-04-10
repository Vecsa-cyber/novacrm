import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Tipado estricto para las propiedades
interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  Icon: React.ElementType;
  colorAccent?: 'blue' | 'emerald' | 'slate' | 'amber' | 'purple';
  darkMode?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  Icon,
  colorAccent = 'blue',
  darkMode = false,
}) => {
  const isPositive = trend >= 0;

  const colorMap = {
    blue: 'bg-nova-blue/10 text-nova-blue',
    emerald: 'bg-nova-emerald/10 text-nova-emerald',
    slate: 'bg-nova-slate/10 text-nova-slate',
    amber: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  const cardBg    = darkMode ? 'bg-gray-800'   : 'bg-slate-100';
  const titleText = darkMode ? 'text-gray-400'  : 'text-slate-500';
  const valueText = darkMode ? 'text-white'     : 'text-gray-800';
  const subText   = darkMode ? 'text-gray-500'  : 'text-gray-400';

  return (
    <div className={`${cardBg} p-4 md:p-6 rounded-nova shadow-soft transition-transform hover:-translate-y-1 duration-300 w-full`}>
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div>
          <p className={`text-xs md:text-sm font-medium mb-1 ${titleText}`}>{title}</p>
          <h3 className={`text-2xl md:text-3xl font-bold ${valueText}`}>{value}</h3>
        </div>
        <div className={`p-2 md:p-3 rounded-2xl ${colorMap[colorAccent]}`}>
          <Icon size={20} strokeWidth={2} className="md:hidden" />
          <Icon size={24} strokeWidth={2} className="hidden md:block" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 md:mt-4">
        <span className={`flex items-center text-xs md:text-sm font-semibold ${isPositive ? 'text-nova-emerald' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {Math.abs(trend)}%
        </span>
        <span className={`text-xs md:text-sm ${subText}`}>vs mes anterior</span>
      </div>
    </div>
  );
};