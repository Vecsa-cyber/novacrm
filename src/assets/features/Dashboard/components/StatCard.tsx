import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Tipado estricto para las propiedades
interface StatCardProps {
  title: string;
  value: string | number;
  trend: number; // Porcentaje de tendencia (positivo o negativo)
  Icon: React.ElementType; // <--- La solución mágica aquí
  colorAccent?: 'blue' | 'emerald' | 'slate' | 'amber' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  trend, 
  Icon, 
  colorAccent = 'blue' 
}) => {
  const isPositive = trend >= 0;

  // Mapa de colores dinámicos usando la paleta que definimos
  const colorMap = {
    blue: 'bg-nova-blue/10 text-nova-blue',
    emerald: 'bg-nova-emerald/10 text-nova-emerald',
    slate: 'bg-nova-slate/10 text-nova-slate',
    amber: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-nova shadow-soft transition-transform hover:-translate-y-1 duration-300 w-full">
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div>
          <p className="text-xs md:text-sm font-medium text-nova-slate mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800">{value}</h3>
        </div>

        {/* Contenedor del ícono con color dinámico */}
        <div className={`p-2 md:p-3 rounded-2xl ${colorMap[colorAccent]}`}>
          {/* Al usar React.ElementType, TypeScript ya no se queja por pasarle size, strokeWidth o className */}
          <Icon size={20} strokeWidth={2} className="md:hidden" />
          <Icon size={24} strokeWidth={2} className="hidden md:block" />
        </div>
      </div>

      {/* Sección de tendencia */}
      <div className="flex items-center gap-2 mt-3 md:mt-4">
        <span className={`flex items-center text-xs md:text-sm font-semibold ${isPositive ? 'text-nova-emerald' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {Math.abs(trend)}%
        </span>
        <span className="text-xs md:text-sm text-gray-400">vs mes anterior</span>
      </div>
    </div>
  );
};