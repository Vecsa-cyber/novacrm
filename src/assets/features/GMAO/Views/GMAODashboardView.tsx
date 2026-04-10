import React from 'react';
import {
  Search, Bell, Users, Wrench, ClipboardList, Activity,
  ChevronDown, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { useGMAODashboard } from '../hooks/useGMAODashboard';
import { GMAOStatCard } from '../components/GMAOStatCard';
import type { GMAOProps, Prioridad, EstadoOT } from '../types/gmao.d';

// ── Helpers de color ─────────────────────────────────────────────────────────
const prioridadCls = (p: Prioridad, dark: boolean): string => {
  const d = (l: string, k: string) => dark ? k : l;
  if (p === 'Alto')  return d('bg-red-50 text-red-600 border border-red-100',    'bg-red-900/20 text-red-400 border border-red-800/30');
  if (p === 'Medio') return d('bg-amber-50 text-amber-600 border border-amber-100', 'bg-amber-900/20 text-amber-400 border border-amber-800/30');
  return d('bg-emerald-50 text-emerald-600 border border-emerald-100', 'bg-emerald-900/20 text-emerald-400 border border-emerald-800/30');
};

const estadoCls = (e: EstadoOT, dark: boolean): string => {
  const d = (l: string, k: string) => dark ? k : l;
  if (e === 'Planificada')  return d('bg-blue-50 text-blue-600',     'bg-blue-900/20 text-blue-400');
  if (e === 'En ejecución') return d('bg-violet-50 text-violet-600', 'bg-violet-900/20 text-violet-400');
  if (e === 'Completada')   return d('bg-emerald-50 text-emerald-600', 'bg-emerald-900/20 text-emerald-400');
  return d('bg-gray-100 text-gray-500', 'bg-gray-700 text-gray-400');
};

const mesActual = () =>
  new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());

// ── Vista ────────────────────────────────────────────────────────────────────
export const GMAODashboardView: React.FC<GMAOProps> = ({ darkMode = false }) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;
  const {
    stats, ordenesFiltradas,
    filtroTecnico, setFiltroTecnico,
    filtroSupervisor, setFiltroSupervisor,
    busqueda, setBusqueda,
    tecnicos, supervisores,
  } = useGMAODashboard();

  const cardCls   = `rounded-2xl shadow-soft border ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`;
  const selectCls = `border rounded-xl pl-3 pr-7 py-1.5 text-xs font-medium appearance-none outline-none cursor-pointer transition-colors ${d('border-gray-200 text-gray-700 bg-white hover:border-gray-300', 'border-gray-600 text-gray-200 bg-gray-700 hover:border-gray-500')}`;
  const thCls     = `text-[10px] font-black uppercase tracking-wider px-4 py-3 text-left ${d('text-gray-400', 'text-gray-500')}`;
  const tdCls     = `px-4 py-3 text-sm ${d('text-slate-700', 'text-gray-200')}`;

  return (
    <div className="flex flex-col gap-5 fade-in pb-24 px-2 sm:px-0">

      {/* ── BARRA SUPERIOR ── */}
      <div className={`${cardCls} px-4 py-3 flex items-center gap-3`}>
        <div className="relative flex-1">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${d('text-gray-400', 'text-gray-500')}`} />
          <input
            type="text"
            placeholder="Buscar clientes, activos, OTs..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none transition-colors ${d('border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-300', 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500')}`}
          />
        </div>
        <div className="relative flex-shrink-0">
          <button className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${d('hover:bg-gray-100 text-gray-500', 'hover:bg-gray-700 text-gray-400')}`}>
            <Bell size={18} />
          </button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
        </div>
      </div>

      {/* ── ENCABEZADO + FILTROS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${d('text-slate-800', 'text-white')}`}>Dashboard</h1>
          <p className={`text-sm font-medium mt-0.5 ${d('text-slate-400', 'text-gray-400')}`}>
            Resumen operativo — {mesActual()}
          </p>
        </div>

        {/* Filtros slim */}
        <div className={`${cardCls} px-3 py-2 flex items-center gap-2 flex-wrap`}>
          <span className={`text-[10px] font-black uppercase tracking-wider flex-shrink-0 ${d('text-gray-400', 'text-gray-500')}`}>
            Filtrar por:
          </span>
          <div className="relative">
            <select value={filtroTecnico} onChange={e => setFiltroTecnico(e.target.value)} className={selectCls}>
              {tecnicos.map(t => (
                <option key={t} value={t}>{t === 'todos' ? 'Todos los técnicos' : t}</option>
              ))}
            </select>
            <ChevronDown size={11} className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 ${d('text-gray-400', 'text-gray-500')}`} />
          </div>
          <div className="relative">
            <select value={filtroSupervisor} onChange={e => setFiltroSupervisor(e.target.value)} className={selectCls}>
              {supervisores.map(s => (
                <option key={s} value={s}>{s === 'todos' ? 'Todos los supervisores' : s}</option>
              ))}
            </select>
            <ChevronDown size={11} className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 ${d('text-gray-400', 'text-gray-500')}`} />
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <GMAOStatCard
          icon={Users}
          iconColor="text-blue-500"
          iconBg={d('bg-blue-50', 'bg-blue-900/30')}
          value={stats.clientesActivos}
          label={`Clientes activos (${stats.clientesTotal} total)`}
          darkMode={darkMode}
        />
        <GMAOStatCard
          icon={Wrench}
          iconColor="text-violet-500"
          iconBg={d('bg-violet-50', 'bg-violet-900/30')}
          value={stats.activosRegistrados}
          label="Activos registrados"
          badge={stats.activosFueraServicio > 0
            ? { text: `${stats.activosFueraServicio} fuera de servicio`, variant: 'red' }
            : undefined}
          darkMode={darkMode}
        />
        <GMAOStatCard
          icon={ClipboardList}
          iconColor="text-orange-500"
          iconBg={d('bg-orange-50', 'bg-orange-900/30')}
          value={stats.otsAbiertas}
          label="OTs abiertas"
          badge={stats.otsVencidas > 0
            ? { text: `${stats.otsVencidas} vencidas`, variant: 'red' }
            : undefined}
          darkMode={darkMode}
        />
        <GMAOStatCard
          icon={Activity}
          iconColor="text-emerald-500"
          iconBg={d('bg-emerald-50', 'bg-emerald-900/30')}
          value={<span>{stats.tasaCompletado}<span className="text-xl">%</span></span>}
          label={`Tasa de completado (${stats.completadas}/${stats.totalOTs})`}
          darkMode={darkMode}
        />
      </div>

      {/* ── TABLA ÓRDENES DE TRABAJO ── */}
      <div className={`${cardCls} overflow-hidden`}>
        {/* Cabecera de sección */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${d('border-gray-50', 'border-gray-700')}`}>
          <h2 className={`text-sm font-black ${d('text-slate-800', 'text-white')}`}>Órdenes de Trabajo</h2>
          <button className={`flex items-center gap-1 text-xs font-bold transition-colors ${d('text-blue-500 hover:text-blue-600', 'text-blue-400 hover:text-blue-300')}`}>
            Ver todas <ArrowRight size={13} />
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className={`border-b ${d('border-gray-50 bg-gray-50/50', 'border-gray-700 bg-gray-900/30')}`}>
                {['Folio', 'Actividad', 'Activo', 'Cliente', 'Prioridad', 'Estado', 'Técnico', 'Supervisor', 'Fecha'].map(h => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${d('divide-gray-50', 'divide-gray-700/60')}`}>
              {ordenesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={9} className={`text-center py-10 text-sm ${d('text-gray-400', 'text-gray-500')}`}>
                    No se encontraron órdenes con los filtros aplicados.
                  </td>
                </tr>
              )}
              {ordenesFiltradas.map(ot => (
                <tr
                  key={ot.folio}
                  className={`transition-colors ${d('hover:bg-gray-50/60', 'hover:bg-gray-700/30')} ${ot.vencida ? `border-l-2 ${d('border-l-red-500', 'border-l-red-600')}` : ''}`}
                >
                  {/* Folio */}
                  <td className={`${tdCls} font-bold text-blue-500 whitespace-nowrap`}>{ot.folio}</td>

                  {/* Actividad */}
                  <td className={`${tdCls} max-w-[180px]`}>
                    <span className="block truncate" title={ot.actividad}>{ot.actividad}</span>
                  </td>

                  {/* Activo */}
                  <td className={`${tdCls} whitespace-nowrap`}>{ot.activo}</td>

                  {/* Cliente */}
                  <td className={`${tdCls} whitespace-nowrap`}>{ot.cliente}</td>

                  {/* Prioridad */}
                  <td className={tdCls}>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${prioridadCls(ot.prioridad, darkMode)}`}>
                      {ot.prioridad}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className={tdCls}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${estadoCls(ot.estado, darkMode)}`}>
                        {ot.estado}
                      </span>
                      {ot.vencida && (
                        <span className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${d('bg-red-50 text-red-500', 'bg-red-900/20 text-red-400')}`}>
                          <AlertTriangle size={10} /> VENCIDA
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Técnico */}
                  <td className={`${tdCls} whitespace-nowrap ${ot.tecnico === 'Sin asignar' ? d('text-gray-400', 'text-gray-500') : ''}`}>
                    {ot.tecnico}
                  </td>

                  {/* Supervisor */}
                  <td className={`${tdCls} whitespace-nowrap`}>{ot.supervisor}</td>

                  {/* Fecha */}
                  <td className={`${tdCls} whitespace-nowrap font-medium ${ot.vencida ? 'text-red-500 font-bold' : ''}`}>
                    {ot.fecha}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
