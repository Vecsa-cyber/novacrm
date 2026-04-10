import React from 'react';

interface GMAOStatCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  value: React.ReactNode;
  label: string;
  badge?: { text: string; variant: 'red' | 'amber' | 'green' };
  darkMode?: boolean;
}

export const GMAOStatCard: React.FC<GMAOStatCardProps> = ({
  icon: Icon, iconColor, iconBg, value, label, badge, darkMode = false,
}) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;

  const badgeCls: Record<string, string> = {
    red:   d('bg-red-50 text-red-500 border border-red-100',     'bg-red-900/20 text-red-400 border border-red-800/30'),
    amber: d('bg-amber-50 text-amber-600 border border-amber-100', 'bg-amber-900/20 text-amber-400 border border-amber-800/30'),
    green: d('bg-emerald-50 text-emerald-600 border border-emerald-100', 'bg-emerald-900/20 text-emerald-400 border border-emerald-800/30'),
  };

  return (
    <div className={`rounded-2xl shadow-soft border p-5 flex flex-col gap-4 ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={19} className={iconColor} />
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeCls[badge.variant]}`}>
            {badge.text}
          </span>
        )}
      </div>
      <div>
        <div className={`text-3xl font-black tracking-tight leading-none ${d('text-slate-800', 'text-white')}`}>{value}</div>
        <div className={`text-sm font-medium mt-1 ${d('text-slate-400', 'text-gray-400')}`}>{label}</div>
      </div>
    </div>
  );
};
