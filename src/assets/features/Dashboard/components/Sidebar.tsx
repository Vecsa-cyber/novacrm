import React from 'react';
import { LayoutDashboard, Users, Settings, Briefcase, Target, Activity, LogOut } from 'lucide-react';

interface MenuItem {
  title: string;
  icon: React.ElementType;
  module: string;
}

interface SidebarProps {
  currentUser: any;
  activeModule: string;
  onNavigate: (module: string) => void;
  onLogout?: () => void;
}

// Módulos disponibles en el sistema
const menuItems: MenuItem[] = [
  { title: 'Dashboard',     icon: LayoutDashboard, module: 'dashboard'  },
  { title: 'Contactos',     icon: Users,           module: 'contacts'   },
  { title: 'Pipeline',      icon: Target,          module: 'pipeline'   },
  { title: 'Actividades',   icon: Activity,        module: 'activities' },
  { title: 'Negocios',      icon: Briefcase,       module: 'deals'      },
  { title: 'Configuración', icon: Settings,        module: 'settings'   },
];


export const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeModule, onNavigate, onLogout }) => {
  const allowedModules: string[] = currentUser?.modulosPermitidos ?? [];
  const rolLabel = currentUser?.rol === 1 ? 'Administrador' : 'Vendedor';

  const authorizedMenu = menuItems.filter(item => allowedModules.includes(item.module));

  return (
    <aside className="w-16 md:w-[20%] h-screen sticky top-0 bg-white shadow-soft flex flex-col flex-shrink-0 overflow-y-auto transition-all duration-300">

      {/* Logo */}
      <div className="p-4 md:p-8 flex items-center justify-center border-b border-gray-100">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
          <span className="text-white font-bold text-xl">N</span>
        </div>
        <h1 className="hidden md:block text-2xl font-bold tracking-tight text-gray-800 ml-3">
          Nova<span className="text-blue-500">CRM</span>
        </h1>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-2 md:p-4 space-y-1 mt-4">
        {authorizedMenu.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.module;
          return (
            <button
              key={item.module}
              onClick={() => onNavigate(item.module)}
              className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-3 rounded-2xl transition-all font-medium group ${
                isActive
                  ? 'bg-blue-50 text-blue-500 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-blue-500'
              }`}
            >
              <Icon size={20} className={`flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="hidden md:block">{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Perfil + Cerrar sesión */}
      <div className="p-2 md:p-4 m-2 md:m-3 border-t border-gray-100 flex flex-col gap-2">
        <div className="bg-slate-50 rounded-2xl p-2 md:p-3 flex items-center justify-center md:justify-start gap-3">
          <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.nombre}`} alt="avatar" />
          </div>
          <div className="hidden md:block overflow-hidden">
            <p className="text-sm font-bold text-gray-800 truncate">{currentUser?.nombre ?? 'Usuario'}</p>
            <p className="text-xs text-slate-400 font-medium">{rolLabel}</p>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-all font-medium text-sm"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span className="hidden md:block">Cerrar sesión</span>
          </button>
        )}
      </div>

    </aside>
  );
};
