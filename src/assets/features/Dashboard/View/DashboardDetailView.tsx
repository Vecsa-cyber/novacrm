import React, { useState, useEffect } from 'react';
import { FileText, Users, Briefcase, Calendar, Phone, Mail, ChevronRight, MessageSquare, Activity, Clock } from 'lucide-react';
import { apiFetch } from '../../../../lib/apiFetch';
import { StatCard } from '../../Dashboard/components/StatCard';
import { InfoCard } from '../../../components/UI/InfoCard';

interface ActividadDB {
  id_actividad: number;
  tipo_actividad: string;
  fecha_actividad: string;
  usuario: string;
  empresa: string;
}

const activityIconMap: Record<string, { icon: React.ElementType; bg: string; text: string }> = {
  'visita':      { icon: Calendar,      bg: 'bg-amber-100',   text: 'text-amber-700'   },
  'llamada':     { icon: Phone,         bg: 'bg-blue-100',    text: 'text-blue-600'    },
  'reunión':     { icon: Users,         bg: 'bg-purple-100',  text: 'text-purple-700'  },
  'reunion':     { icon: Users,         bg: 'bg-purple-100',  text: 'text-purple-700'  },
  'email':       { icon: Mail,          bg: 'bg-pink-100',    text: 'text-pink-700'    },
  'seguimiento': { icon: MessageSquare, bg: 'bg-emerald-100', text: 'text-emerald-700' },
};
const defaultIcon = { icon: Activity, bg: 'bg-gray-100', text: 'text-gray-500' };

const formatHora = (fechaStr: string): string => {
  if (!fechaStr) return '—';
  const fecha = new Date(fechaStr);
  const ahora = new Date();
  const diffMs = ahora.getTime() - fecha.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1)  return 'Ayer';
  return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
};

const stageColorMap: Record<string, string> = {
  'En Negociación': 'bg-blue-100 text-blue-700',
  'Pendiente':      'bg-amber-100 text-amber-700',
  'Cerrado':        'bg-emerald-100 text-emerald-700',
  'Pérdida':        'bg-red-100 text-red-600',
};

interface Resumen {
  visitas: number;
  oportunidades: number;
  avanzados: number;
  en_negociacion: number;
}

interface Usuario { id_usuario: number; nombre: string; }

interface DashboardProps {
  onNavigate: (module: string, id?: number) => void;
  darkMode?: boolean;
}

export const DashboardDetailsView: React.FC<DashboardProps> = ({ onNavigate, darkMode = false }) => {
  const [resumen, setResumen]             = useState<Resumen>({ visitas: 0, oportunidades: 0, avanzados: 0, en_negociacion: 0 });
  const [usuarios, setUsuarios]           = useState<Usuario[]>([]);
  const [filtroUsuario, setFiltroUsuario] = useState<string>('');
  const [filtroDesde, setFiltroDesde]     = useState<string>('');
  const [filtroHasta, setFiltroHasta]     = useState<string>('');
  const [ahora, setAhora]                 = useState(new Date());
  const [tratosRecientes, setTratosRecientes]       = useState<any[]>([]);
  const [ultimasActividades, setUltimasActividades] = useState<ActividadDB[]>([]);

  // helpers de color basados en darkMode
  const d = (light: string, dark: string) => darkMode ? dark : light;

  useEffect(() => {
    const timer = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    apiFetch('/api/usuarios')
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error('Error al cargar usuarios:', err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filtroUsuario) params.set('id_usuario', filtroUsuario);
    if (filtroDesde)   params.set('fecha_desde', filtroDesde);
    if (filtroHasta)   params.set('fecha_hasta', filtroHasta);
    const qs = params.toString() ? `?${params.toString()}` : '';

    apiFetch(`/api/dashboard/resumen${qs}`)
      .then(res => res.json())
      .then(data => setResumen(data))
      .catch(err => console.error('Error al cargar resumen:', err));

    apiFetch(`/api/dashboard/tratos-recientes${qs}`)
      .then(res => res.json())
      .then(data => setTratosRecientes(data))
      .catch(err => console.error('Error al cargar tratos:', err));

    apiFetch(`/api/dashboard/actividades-recientes${qs}`)
      .then(res => res.json())
      .then(data => setUltimasActividades(data))
      .catch(err => console.error('Error al cargar actividades:', err));
  }, [filtroUsuario, filtroDesde, filtroHasta]);

  return (
    <div className="p-4 md:p-8 w-full flex flex-col gap-6 md:gap-8 flex-1">

      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-0 md:mb-4">
        <div>
          <h1 className={`text-2xl md:text-3xl font-extrabold ${d('text-slate-800', 'text-white')}`}>Dashboard</h1>
          <p className={`mt-1 capitalize text-sm md:text-base ${d('text-slate-500', 'text-gray-400')}`}>
            {ahora.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className={`flex items-center gap-2 border shadow-soft px-4 py-2.5 rounded-2xl font-bold text-base md:text-lg tabular-nums self-start sm:self-auto ${d('bg-white border-gray-100 text-slate-700', 'bg-gray-800 border-gray-700 text-gray-200')}`}>
          <Clock size={18} className="text-nova-blue flex-shrink-0" />
          {ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* 2. Filtros */}
      <div className={`rounded-nova shadow-soft p-4 md:p-5 flex flex-col gap-3 border ${d('bg-white border-gray-100', 'bg-gray-800 border-gray-700')}`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm min-w-0 ${d('bg-nova-bg', 'bg-gray-700')}`}>
            <FileText size={18} className="flex-shrink-0 text-nova-blue" />
            <span className="font-semibold text-gray-400 whitespace-nowrap">Vendedor:</span>
            <select
              value={filtroUsuario}
              onChange={e => setFiltroUsuario(e.target.value)}
              className={`bg-transparent font-semibold outline-none cursor-pointer min-w-0 max-w-[140px] ${d('text-gray-900', 'text-gray-100')}`}
            >
              <option value="">Todos</option>
              {usuarios.map(u => (
                <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-400">
            <span className="whitespace-nowrap">Desde</span>
            <input
              type="date"
              value={filtroDesde}
              onChange={e => setFiltroDesde(e.target.value)}
              className={`px-3 py-1.5 rounded-lg outline-none focus:ring-2 ring-blue-200 cursor-pointer w-[140px] min-w-0 ${d('text-gray-900 bg-nova-bg', 'text-gray-100 bg-gray-700')}`}
            />
            <span className="whitespace-nowrap">Hasta</span>
            <input
              type="date"
              value={filtroHasta}
              min={filtroDesde || undefined}
              onChange={e => setFiltroHasta(e.target.value)}
              className={`px-3 py-1.5 rounded-lg outline-none focus:ring-2 ring-blue-200 cursor-pointer w-[140px] min-w-0 ${d('text-gray-900 bg-nova-bg', 'text-gray-100 bg-gray-700')}`}
            />
            {(filtroDesde || filtroHasta) && (
              <button
                onClick={() => { setFiltroDesde(''); setFiltroHasta(''); }}
                className={`text-xs font-bold text-red-400 hover:text-red-500 px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap ${d('hover:bg-red-50', 'hover:bg-red-900/20')}`}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="VISITAS REALIZADAS" value={String(resumen.visitas)}       trend={0} Icon={Calendar} colorAccent="blue"    darkMode={darkMode} />
        <StatCard title="OPORTUNIDADES"       value={String(resumen.oportunidades)} trend={0} Icon={Users}    colorAccent="emerald" darkMode={darkMode} />
        <StatCard title="TRATOS AVANZADOS"    value={String(resumen.avanzados)}     trend={0} Icon={Briefcase} colorAccent="amber"  darkMode={darkMode} />
        <StatCard title="EN COTIZACIÓN"       value={String(resumen.en_negociacion)} trend={0} Icon={Activity} colorAccent="purple" darkMode={darkMode} />
      </div>

      {/* 4. Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">

        <InfoCard title="TRATOS RECIENTES" icon={Briefcase} accentColor="emerald" darkMode={darkMode}>
          <div className="space-y-4">
            <div className={`hidden sm:grid sm:grid-cols-4 text-xs font-semibold text-gray-400 pb-2 border-b ${d('border-gray-100', 'border-gray-700')}`}>
              <span>TRATO</span><span>EMPRESA</span><span>VENDEDOR</span><span className="text-center">ESTADO</span>
            </div>
            {tratosRecientes.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">Sin tratos registrados</p>
            ) : tratosRecientes.map((trato) => (
              <div
                key={trato.id_trato}
                onClick={() => onNavigate('pipeline', trato.id_trato)}
                className={`grid grid-cols-1 sm:grid-cols-4 items-center gap-2 text-sm font-medium py-1 px-2 -mx-2 rounded-xl cursor-pointer transition-colors ${d('text-gray-900 hover:bg-emerald-50', 'text-gray-200 hover:bg-emerald-900/20')}`}
              >
                <span className="truncate">{trato.nombre_servicio}</span>
                <span className={`truncate ${d('text-nova-slate', 'text-gray-400')}`}>{trato.empresa}</span>
                <span className={d('text-nova-slate', 'text-gray-400')}>{trato.vendedor ?? '—'}</span>
                <span className="flex sm:justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${stageColorMap[trato.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                    {trato.estado}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="ÚLTIMAS ACTIVIDADES" icon={Calendar} accentColor="purple" darkMode={darkMode}>
          <div className="space-y-6">
            {ultimasActividades.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">Sin actividades registradas</p>
            ) : ultimasActividades.map((actividad) => {
              const key = (actividad.tipo_actividad ?? '').toLowerCase();
              const IconData = activityIconMap[key] ?? defaultIcon;
              const Icon = IconData.icon;
              return (
                <div
                  key={actividad.id_actividad}
                  onClick={() => onNavigate('activities', actividad.id_actividad)}
                  className={`flex items-center gap-4 px-2 -mx-2 rounded-xl cursor-pointer transition-colors ${d('hover:bg-purple-50', 'hover:bg-purple-900/20')}`}
                >
                  <div className={`w-12 h-12 ${IconData.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={22} className={IconData.text} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className={`font-bold text-sm truncate ${d('text-gray-900', 'text-gray-100')}`}>
                      {actividad.tipo_actividad ?? 'Actividad'}
                    </p>
                    <p className={`text-xs truncate ${d('text-nova-slate', 'text-gray-400')}`}>
                      {[actividad.usuario, actividad.empresa].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 text-xs flex-shrink-0 ${d('text-nova-slate', 'text-gray-500')}`}>
                    <span>{formatHora(actividad.fecha_actividad)}</span>
                    <ChevronRight size={18} className={d('text-gray-300', 'text-gray-600')} />
                  </div>
                </div>
              );
            })}
          </div>
        </InfoCard>

      </div>
    </div>
  );
};
