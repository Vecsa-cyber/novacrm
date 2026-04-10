import React from 'react';

interface InfoCardProps {
  title?: string;
  icon?: React.ElementType;
  accentColor?: 'blue' | 'emerald' | 'slate' | 'amber' | 'purple';
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  darkMode?: boolean;
}

const accentBorderMap: Record<string, string> = {
  blue:    'border-t-4 border-nova-blue',
  emerald: 'border-t-4 border-nova-emerald',
  slate:   'border-t-4 border-nova-slate',
  amber:   'border-t-4 border-amber-400',
  purple:  'border-t-4 border-purple-400',
};

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  icon: Icon,
  accentColor,
  children,
  className = '',
  footer,
  darkMode = false,
}) => {
  const cardBg      = darkMode ? 'bg-gray-800'  : 'bg-white';
  const iconBg      = darkMode ? 'bg-gray-700'  : 'bg-nova-bg';
  const iconText    = darkMode ? 'text-gray-400' : 'text-nova-slate';
  const titleText   = darkMode ? 'text-white'   : 'text-gray-800';
  const footerBorder = darkMode ? 'border-gray-700' : 'border-gray-100';

  return (
    <div
      className={`${cardBg} rounded-nova shadow-soft p-6 md:p-8 flex flex-col ${
        accentColor ? accentBorderMap[accentColor] : ''
      } ${className}`}
    >
      {(title || Icon) && (
        <div className="flex items-center gap-3 mb-6">
          {Icon && (
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center ${iconText}`}>
              <Icon size={20} strokeWidth={2} />
            </div>
          )}
          {title && <h3 className={`text-xl font-bold tracking-tight ${titleText}`}>{title}</h3>}
        </div>
      )}

      <div className="flex-1 text-nova-slate text-sm">
        {children}
      </div>

      {footer && (
        <div className={`border-t ${footerBorder} pt-6 mt-6`}>
          {footer}
        </div>
      )}
    </div>
  );
};
