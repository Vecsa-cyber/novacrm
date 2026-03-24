import React from 'react';

// Tipado estricto para las propiedades del contenedor
interface InfoCardProps {
  title?: string;
  icon?: React.ElementType; // Usamos React.ElementType para evitar conflictos de Lucide
  accentColor?: 'blue' | 'emerald' | 'slate' | 'amber' | 'purple'; // Borde superior opcional
  children: React.ReactNode; // El contenido específico de la tarjeta irá aquí
  className?: string; // Para sobrescribir estilos si es necesario
  footer?: React.ReactNode; // Sección de pie de página opcional
}

// Mapa de colores para el borde superior
const accentBorderMap: Record<string, string> = {
  blue: 'border-t-4 border-nova-blue',
  emerald: 'border-t-4 border-nova-emerald',
  slate: 'border-t-4 border-nova-slate',
  amber: 'border-t-4 border-amber-400', 
  purple: 'border-t-4 border-purple-400',
};

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  icon: Icon,
  accentColor,
  children,
  className = '',
  footer,
}) => {
  return (
    <div
      className={`bg-white rounded-nova shadow-soft p-6 md:p-8 flex flex-col ${
        accentColor ? accentBorderMap[accentColor] : ''
      } ${className}`}
    >
      {/* Cabecera opcional de la tarjeta */}
      {(title || Icon) && (
        <div className="flex items-center gap-3 mb-6">
          {Icon && (
            <div className="w-10 h-10 bg-nova-bg rounded-xl flex items-center justify-center text-nova-slate">
              <Icon size={20} strokeWidth={2} />
            </div>
          )}
          {title && <h3 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h3>}
        </div>
      )}

      {/* Contenido principal (Children) */}
      <div className="flex-1 text-nova-slate text-sm">
        {children}
      </div>

      {/* Pie de página opcional */}
      {footer && (
        <div className="border-t border-gray-100 pt-6 mt-6">
          {footer}
        </div>
      )}
    </div>
  );
};