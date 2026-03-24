import React from 'react';
import { LayoutDashboard, Users, Settings, Briefcase, Target, Activity } from 'lucide-react';

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path: string;
  module: string;
}

interface SidebarProps {
  allowedModules: string[];
  activeModule: string; // <-- Recibe el módulo activo
  onNavigate: (module: string) => void; // <-- Función para cambiar la vista
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard',      icon: LayoutDashboard, path: '#', module: 'dashboard'   },
  { title: 'Contactos',      icon: Users,           path: '#', module: 'contacts'    },
  { title: 'Pipeline',       icon: Target,          path: '#', module: 'pipeline'    },
  { title: 'Actividades',    icon: Activity,        path: '#', module: 'activities'  },
  { title: 'Configuración',  icon: Settings,        path: '#', module: 'settings'    },
  { title: 'Negocios',       icon: Briefcase,       path: '#', module: 'deals'       },
];

export const Sidebar: React.FC<SidebarProps> = ({ allowedModules, activeModule, onNavigate }) => {
  const authorizedMenu = menuItems.filter(item => allowedModules.includes(item.module));

  return (
    <aside className="w-16 md:w-[20%] min-h-screen bg-white shadow-soft flex flex-col flex-shrink-0 transition-all duration-300">
      <div className="p-4 md:p-8 flex items-center justify-center border-b border-gray-100">
        <div className="w-10 h-10 bg-nova-blue rounded-xl flex items-center justify-center shadow-lg shadow-nova-blue/30 flex-shrink-0">
          <span className="text-white font-bold text-xl">N</span>
        </div>
        <h1 className="hidden md:block text-2xl font-bold tracking-tight text-gray-800 ml-3">
          Nova<span className="text-nova-blue">CRM</span>
        </h1>
      </div>

      <nav className="flex-1 p-2 md:p-4 space-y-2 mt-4">
        {authorizedMenu.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.module; // Comprueba si este botón es el activo

          return (
            <button
              key={item.title}
              onClick={() => onNavigate(item.module)} // Cambia la vista sin recargar
              className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-3 rounded-2xl transition-all font-medium group ${
                isActive 
                  ? 'bg-nova-bg text-nova-blue shadow-sm' // Pintado de azul si está activo
                  : 'text-nova-slate hover:bg-nova-bg hover:text-nova-blue'
              }`}
            >
              <Icon size={20} className={`flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="hidden md:block">{item.title}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-2 md:p-4 m-2 md:m-4 bg-nova-bg rounded-2xl flex items-center justify-center md:justify-start gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="hidden md:block overflow-hidden">
          <p className="text-sm font-bold text-gray-800 truncate">Usuario Prueba</p>
          <p className="text-xs text-nova-slate capitalize">Usuario</p>
        </div>
      </div>
    </aside>
  );
};