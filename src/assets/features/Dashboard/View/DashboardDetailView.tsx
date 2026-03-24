import React from 'react';
import { FileText, Users, Briefcase, Calendar, Phone, Mail, ChevronRight, MessageSquare, Plus, DollarSign, Activity } from 'lucide-react';
import { StatCard } from '../../Dashboard/components/StatCard'; // Importación de tu componente existente (corregido con React.ElementType)
import { InfoCard } from '../../../components/UI/InfoCard'; // Tu nuevo contenedor genérico

// Mock data y tipos
type Trato = {
  id: number;
  trato: string;
  empresa: string;
  vendedor: string;
  etapa: 'Pérdida' | 'En Cotización' | 'Trato Avanzado' | 'Forecast';
};

type Actividad = {
  id: number;
  actividad: string;
  detalles: string;
  hora: string;
  iconType: 'reunion' | 'llamada' | 'email' | 'mensaje';
};

const tratosRecientesMock: Trato[] = [
  { id: 1, trato: 'Póliza Osmosis', empresa: 'Lear Arteaga', vendedor: 'Eduardo', etapa: 'Pérdida' },
  { id: 2, trato: 'Póliza PTAR', empresa: 'Deacero Fino', vendedor: 'Eduardo', etapa: 'Pérdida' },
  { id: 3, trato: 'Póliza Osmosis y Chillers', empresa: 'Turck Arteaga', vendedor: 'Eduardo', etapa: 'Pérdida' },
];

const ultimasActividadesMock: Actividad[] = [
  { id: 1, actividad: 'Reunión con Diego Torres', detalles: 'Presentación de soluciones', hora: 'Hoy 11:00', iconType: 'reunion' },
  { id: 2, actividad: 'Llamada con Laura Méndez', detalles: 'Seguimiento propuesta Q2', hora: 'Hace 30 min', iconType: 'llamada' },
  { id: 3, actividad: 'Email a Carlos Ruiz', detalles: 'Confirmación de presupuesto', hora: 'Hace 2 horas', iconType: 'email' },
  { id: 4, actividad: 'Mensaje de WhatsApp de Ana S.', detalles: 'Duda sobre la póliza', hora: 'Hoy 09:30', iconType: 'mensaje' },
];

// Mapa de íconos y colores para las actividades
const activityIconMap = {
  reunion: { icon: Calendar, bg: 'bg-amber-100', text: 'text-amber-700' },
  llamada: { icon: Phone, bg: 'bg-nova-blue/10', text: 'text-nova-blue' },
  email: { icon: Mail, bg: 'bg-purple-100', text: 'text-purple-700' },
  mensaje: { icon: MessageSquare, bg: 'bg-nova-emerald/10', text: 'text-nova-emerald' },
};

// Mapa de colores para las etapas del trato
const stageColorMap = {
  'Pérdida': 'bg-red-100 text-red-600',
  'En Cotización': 'bg-purple-100 text-purple-700',
  'Trato Avanzado': 'bg-nova-blue/10 text-nova-blue',
  'Forecast': 'bg-nova-emerald/10 text-nova-emerald',
};

export const DashboardDetailsView: React.FC = () => {
  return (
    <div className="p-8 w-full flex flex-col gap-8 flex-1">
      
      {/* 1. Header del Dashboard (como en imagen_3.png) */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">martes, 24 de marzo de 2026</p>
        </div>
        {/* Avatar del usuario (como en imagen_2.png) */}
        <div className="w-12 h-12 rounded-full bg-pink-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
          <span className="text-pink-600 font-bold text-lg">E</span>
        </div>
      </div>

      {/* 2. Barra de Filtros (Estilo CraftUI con borde sutil y fondo blanco) */}
      <div className="bg-white rounded-nova shadow-soft p-5 flex items-center gap-6 border border-gray-100">
        <button className="flex items-center gap-2 text-nova-blue font-medium bg-nova-bg px-4 py-2 rounded-xl text-sm">
          <FileText size={18} />
          <span className="font-semibold text-gray-400">FILTROS</span>
          <span>Vendedor:</span>
          <span className="text-gray-900 font-semibold">Todos</span>
        </button>
        {/* Mock de selectores de fecha */}
        <div className="text-sm font-medium text-gray-400 flex items-center gap-2">
          <span>Desde</span>
          <span className="text-gray-900 bg-nova-bg px-3 py-1.5 rounded-lg">mm/dd/yyyy</span>
          <span>Hasta</span>
          <span className="text-gray-900 bg-nova-bg px-3 py-1.5 rounded-lg">mm/dd/yyyy</span>
        </div>
      </div>

      {/* 3. Grid de Stat Cards (Usando tu componente existente) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="VISITAS REALIZADAS" value="1" trend={100} Icon={Calendar} colorAccent="blue" />
        <StatCard title="OPORTUNIDADES" value="68" trend={-5} Icon={Briefcase} colorAccent="emerald" />
        <StatCard title="TRATOS AVANZADOS" value="0" trend={0} Icon={Activity} colorAccent="amber" />
        <StatCard title="EN COTIZACIÓN" value="31" trend={12} Icon={DollarSign} colorAccent="purple" />
      </div>

      {/* 4. Grid de Data Cards (Usando el nuevo contenedor InfoCard genérico) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        
        {/* Ejemplo A: Tarjeta "Tratos Recientes" (Lista limpia) */}
        <InfoCard title="TRATOS RECIENTES" icon={Briefcase} accentColor="emerald">
          <div className="space-y-4">
            {/* Cabecera de la lista (ocultar en móvil para limpiar la interfaz) */}
            <div className="hidden sm:grid sm:grid-cols-4 text-xs font-semibold text-gray-400 pb-2 border-b border-gray-100">
              <span>TRATO</span>
              <span>EMPRESA</span>
              <span>VENDEDOR</span>
              <span className="text-center">ETAPA</span>
            </div>
            {/* Filas de datos (estilo lista, no tabla tradicional) */}
            {tratosRecientesMock.map((trato) => (
              <div key={trato.id} className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 text-sm text-gray-900 font-medium py-1">
                <span className="truncate">{trato.trato}</span>
                <span className="truncate text-nova-slate sm:text-gray-900">{trato.empresa}</span>
                <span>{trato.vendedor}</span>
                <span className="flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${stageColorMap[trato.etapa]}`}>{trato.etapa}</span>
                </span>
              </div>
            ))}
          </div>
        </InfoCard>

        {/* Ejemplo B: Tarjeta "Últimas Actividades" (Feed de Actividad) */}
        <InfoCard title="ÚLTIMAS ACTIVIDADES" icon={Calendar} accentColor="purple">
          <div className="space-y-6">
            {ultimasActividadesMock.map((actividad) => {
              const IconData = activityIconMap[actividad.iconType];
              return (
                <div key={actividad.id} className="flex items-center gap-4">
                  {/* Ícono de actividad */}
                  <div className={`w-12 h-12 ${IconData.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <IconData.icon size={22} className={IconData.text} />
                  </div>
                  {/* Texto de actividad */}
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-gray-900 text-sm truncate">{actividad.actividad}</p>
                    <p className="text-nova-slate text-xs truncate">{actividad.detalles}</p>
                  </div>
                  {/* Tiempo y botón de acción */}
                  <div className="flex items-center gap-2 text-nova-slate text-xs flex-shrink-0">
                    <span>{actividad.hora}</span>
                    <button className="text-gray-300 hover:text-nova-blue p-1 rounded-full hover:bg-nova-bg transition-colors">
                      <ChevronRight size={18} />
                    </button>
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