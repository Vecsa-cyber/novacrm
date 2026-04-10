import React, { useState } from 'react';
import { Settings, ChevronRight } from 'lucide-react';
import { settingsMenu } from '../constants/settings.constants';
import { UsuariosPanel } from '../components/UsuariosPanel';
import { PlantasPanel }  from '../components/PlantasPanel';
import { EquiposPanel }  from '../components/EquiposPanel';
import type { SettingsProps } from '../types/settings.d';

export const SettingsView: React.FC<SettingsProps> = ({ currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('usuarios');
  const d = (light: string, dark: string) => darkMode ? dark : light;

  if (currentUser?.rol !== 1) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className={`font-medium ${d('text-gray-500', 'text-gray-400')}`}>No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  const active     = settingsMenu.find(m => m.id === activeTab)!;
  const ActiveIcon = active.icon;

  return (
    <div className="flex flex-col gap-6 fade-in">

      {/* ── ENCABEZADO ── */}
      <div className="flex items-start gap-3">
        <Settings className={`flex-shrink-0 mt-1 ${d('text-slate-800', 'text-gray-300')}`} size={28} />
        <div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${d('text-slate-800', 'text-white')}`}>Configuración</h1>
          <p className={`font-medium mt-0.5 text-sm ${d('text-slate-400', 'text-gray-400')}`}>Centro de administración general del sistema</p>
        </div>
      </div>

      {/* ── LAYOUT PRINCIPAL ── */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">

        {/* Móvil: tabs horizontales */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-1 -mx-4 px-4 custom-scrollbar">
          {settingsMenu.map(item => {
            const Icon     = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all border ${
                  isActive
                    ? darkMode
                      ? 'bg-gray-700 border-gray-600 text-white shadow-sm'
                      : `${item.tabActive} shadow-sm`
                    : darkMode
                      ? 'bg-gray-800/60 border-transparent text-gray-400 hover:bg-gray-700'
                      : 'bg-white/60 border-transparent text-slate-500 hover:bg-white'
                }`}
              >
                <Icon size={16} />{item.label}
              </button>
            );
          })}
        </div>

        {/* Desktop: sidebar */}
        <div className="hidden md:flex flex-col gap-2 w-64 lg:w-72 flex-shrink-0 self-start sticky top-6 md:top-10">
          {settingsMenu.map(item => {
            const Icon     = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl text-left transition-all border ${
                  isActive
                    ? darkMode
                      ? `bg-gray-800 border-gray-600 shadow-sm`
                      : `bg-white ${item.border} shadow-sm ring-1 ${item.ring}`
                    : darkMode
                      ? 'bg-transparent border-transparent hover:bg-gray-800/60'
                      : 'bg-transparent border-transparent hover:bg-white/60'
                }`}
              >
                <div className={`p-2 rounded-xl flex-shrink-0 transition-colors ${isActive ? `${item.iconBg} ${item.iconText}` : d('bg-gray-100 text-gray-500', 'bg-gray-700 text-gray-400')}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm transition-colors ${isActive ? item.iconText : d('text-slate-700', 'text-gray-300')}`}>{item.label}</h3>
                  <p className={`text-xs mt-0.5 leading-tight ${d('text-slate-400', 'text-gray-500')}`}>{item.description}</p>
                </div>
                {isActive && <ChevronRight size={16} className={`${item.iconText} self-center flex-shrink-0`} />}
              </button>
            );
          })}
        </div>

        {/* ── ÁREA DE CONTENIDO ── */}
        <div className={`flex-1 rounded-[2rem] shadow-soft border flex flex-col ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`}>

          {/* Cabecera del panel activo */}
          <div className={`flex items-center gap-3 px-6 py-5 border-b rounded-t-[2rem] ${darkMode ? 'border-gray-700 bg-gray-900/50' : `${active.border} ${active.headerBg}`}`}>
            <div className={`p-2.5 rounded-xl ${active.iconBg} ${active.iconText}`}>
              <ActiveIcon size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-black ${darkMode ? 'text-white' : active.headerText}`}>{active.title}</h2>
              <p className={`text-xs mt-0.5 ${active.iconText} opacity-70`}>{active.description}</p>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 md:p-8 fade-in">
            {activeTab === 'usuarios' ? (
              <UsuariosPanel currentUser={currentUser} darkMode={darkMode} />
            ) : activeTab === 'plantas' ? (
              <PlantasPanel darkMode={darkMode} />
            ) : activeTab === 'equipos' ? (
              <EquiposPanel darkMode={darkMode} />
            ) : (
              <div className={`border-2 border-dashed rounded-2xl h-64 flex items-center justify-center font-medium text-sm ${darkMode ? 'border-gray-600 text-gray-500' : active.dashed}`}>
                Ajustes de seguridad en construcción...
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
