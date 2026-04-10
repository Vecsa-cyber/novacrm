import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Users, Settings, Briefcase, Target, Activity, LogOut, X, ChevronDown, Package, Wrench, HardHat, Moon, Sun, Hammer, TrendingUp, ClipboardList, Building2, ShoppingCart, Receipt, FileText, ClipboardCheck, ShoppingBag, Cpu, Box, Calendar, Bell, BarChart2 } from 'lucide-react';

interface SubItem {
  title: string;
  icon: React.ElementType;
  module: string;
  groupLabel?: string;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  module: string;
  children?: SubItem[];
}

interface SidebarProps {
  currentUser: any;
  activeModule: string;
  onNavigate: (module: string) => void;
  onLogout?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
  {
    title: 'GMAO', icon: Cpu, module: 'gmao',
    children: [
      { title: 'Dashboard',          icon: LayoutDashboard, module: 'gmao-dashboard'  },
      { title: 'Clientes',           icon: Users,           module: 'gmao-clientes'   },
      { title: 'Activos',            icon: Box,             module: 'gmao-activos'    },
      { title: 'Órdenes de Trabajo', icon: Wrench,          module: 'gmao-ordenes'    },
      { title: 'Calendario',         icon: Calendar,        module: 'gmao-calendario' },
      { title: 'Alertas',            icon: Bell,            module: 'gmao-alertas'    },
      { title: 'KPIs',               icon: BarChart2,       module: 'gmao-kpis'       },
    ],
  },
  {
    title: 'Mantenimiento', icon: Hammer, module: 'mantenimiento',
    children: [
      { title: 'Mantenimiento Predictivo', icon: TrendingUp,    module: 'mantenimiento-predictivo' },
      { title: 'Plan de Mantenimiento',    icon: ClipboardList, module: 'mantenimiento-plan'        },
    ],
  },
  {
    title: 'Comercial', icon: Building2, module: 'comercial',
    children: [
      { title: 'Contactos',         icon: Users,     module: 'contacts',        groupLabel: 'CRM'       },
      { title: 'Pipeline',          icon: Target,    module: 'pipeline'                                 },
      { title: 'Actividades',       icon: Activity,  module: 'activities'                               },
      { title: 'Negocios',          icon: Briefcase, module: 'deals'                                    },
      { title: 'Proyectos',         icon: Package,   module: 'quoter',          groupLabel: 'Cotizador' },
      { title: 'Servicios Generales', icon: Wrench,  module: 'servicios'                                },
      { title: 'Mantenimiento',     icon: HardHat,   module: 'mantenimiento'                            },
    ],
  },
  {
    title: 'Compras', icon: ShoppingCart, module: 'compras',
    children: [
      { title: 'Requisiciones', icon: FileText,       module: 'requisiciones' },
      { title: 'Órdenes',       icon: ClipboardCheck, module: 'ordenes'       },
      { title: 'Compras',       icon: ShoppingBag,    module: 'compras-list'  },
    ],
  },
  {
    title: 'Facturación', icon: Receipt, module: 'facturacion',
    children: [
      { title: 'Pedidos', icon: ClipboardList, module: 'pedidos' },
    ],
  },
  { title: 'Configuración', icon: Settings, module: 'settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser, activeModule, onNavigate, onLogout,
  mobileOpen = false, onMobileClose,
  darkMode = false, onToggleDarkMode,
}) => {
  const allowedModules: string[] = currentUser?.modulosPermitidos ?? [];
  const rolLabel = currentUser?.rol === 1 ? 'Administrador' : 'Vendedor';
  const authorizedMenu = menuItems.filter(item =>
    allowedModules.includes(item.module) ||
    (item.children?.some(c => allowedModules.includes(c.module)) ?? false)
  );

  const [showMenu,    setShowMenu]    = useState(false);
  const [logoutPos,   setLogoutPos]   = useState<{ bottom: number; left: number } | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(() => {
    const active = menuItems.find(m => m.children?.some(c => c.module === activeModule));
    return active?.module ?? null;
  });
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);

  const menuRef        = useRef<HTMLDivElement>(null);
  const profileBtnRef  = useRef<HTMLButtonElement>(null);
  const logoutPopupRef = useRef<HTMLDivElement>(null);
  const popupRef       = useRef<HTMLDivElement>(null);
  const submenuBtnRef  = useRef<HTMLButtonElement>(null);

  // Shorthand para clases condicionales dark/light
  const d = (light: string, dark: string) => darkMode ? dark : light;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileBtnRef.current  && !profileBtnRef.current.contains(e.target as Node) &&
        logoutPopupRef.current && !logoutPopupRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
        setLogoutPos(null);
      }
      if (
        popupRef.current      && !popupRef.current.contains(e.target as Node) &&
        submenuBtnRef.current && !submenuBtnRef.current.contains(e.target as Node)
      ) {
        setOpenSubmenu(null);
        setPopupPos(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleLogout = (btn: HTMLButtonElement | null) => {
    const next = !showMenu;
    setShowMenu(next);
    const isIconOnly = window.innerWidth >= 768 && window.innerWidth < 1024;
    if (next && isIconOnly && btn) {
      const rect = btn.getBoundingClientRect();
      setLogoutPos({ bottom: window.innerHeight - rect.top + 8, left: rect.right + 12 });
    } else {
      setLogoutPos(null);
    }
  };

  const handleNavigate = (module: string) => {
    onNavigate(module);
    setOpenSubmenu(null);
    setPopupPos(null);
    onMobileClose?.();
  };

  const toggleSubmenu = (module: string, isIconOnly: boolean) => {
    if (openSubmenu === module) {
      setOpenSubmenu(null);
      setPopupPos(null);
      return;
    }
    setOpenSubmenu(module);
    if (isIconOnly && window.innerWidth < 1024 && submenuBtnRef.current) {
      const rect = submenuBtnRef.current.getBoundingClientRect();
      setPopupPos({ top: rect.top, left: rect.right + 12 });
    }
  };

  // ── Popup de perfil (inline: drawer móvil + lg+) ────────────
  const ProfilePopup = () => (
    <div className={`absolute bottom-full left-0 right-0 mb-2 rounded-2xl shadow-lg border overflow-hidden z-10 ${d('bg-white border-gray-100', 'bg-gray-800 border-gray-700')}`}>
      {/* Toggle modo oscuro */}
      {onToggleDarkMode && (
        <button
          onClick={() => { onToggleDarkMode(); }}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-all font-medium text-sm border-b ${
            d('text-slate-600 hover:bg-gray-50 border-gray-100', 'text-gray-300 hover:bg-gray-700 border-gray-700')
          }`}
        >
          {darkMode
            ? <Sun size={18} className="flex-shrink-0 text-amber-400" />
            : <Moon size={18} className="flex-shrink-0 text-slate-400" />
          }
          <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
      )}
      {/* Cerrar sesión */}
      {onLogout && (
        <button
          onClick={() => { setShowMenu(false); setLogoutPos(null); onLogout(); onMobileClose?.(); }}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-all font-medium text-sm ${
            d('text-red-400 hover:bg-red-50 hover:text-red-500', 'text-red-400 hover:bg-red-900/30 hover:text-red-300')
          }`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      )}
    </div>
  );

  const sidebarContent = (isMobileDrawer: boolean) => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className={`${isMobileDrawer ? 'p-5' : 'p-3 lg:p-5'} flex items-center justify-between border-b ${d('border-gray-100', 'border-gray-700')}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <h1 className={`${isMobileDrawer ? 'block' : 'hidden lg:block'} text-xl font-bold tracking-tight ${d('text-gray-800', 'text-white')}`}>
            Hydro<span className="text-blue-500">CRM</span>
          </h1>
        </div>
        {isMobileDrawer && (
          <button onClick={onMobileClose} className={`p-2 rounded-xl transition-colors ${d('hover:bg-gray-100 text-gray-400', 'hover:bg-gray-700 text-gray-500')}`}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className={`flex-1 ${isMobileDrawer ? 'p-4' : 'p-2 lg:p-4'} space-y-1 mt-2 overflow-y-auto`}>
        {authorizedMenu.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;
          const isSubmenuOpen = openSubmenu === item.module;
          const isParentActive = hasChildren
            ? item.children!.some(c => c.module === activeModule)
            : activeModule === item.module;

          if (hasChildren) {
            const isIconOnly = !isMobileDrawer;
            return (
              <div key={item.module}>
                <button
                  ref={isIconOnly ? submenuBtnRef : undefined}
                  onClick={() => toggleSubmenu(item.module, isIconOnly)}
                  className={`w-full flex items-center gap-3 ${isMobileDrawer ? 'px-4 justify-start' : 'justify-center lg:justify-start px-2 lg:px-4'} py-3 rounded-2xl transition-all font-medium group ${
                    isParentActive || isSubmenuOpen
                      ? d('bg-purple-100 text-purple-600 shadow-sm', 'bg-purple-900/40 text-purple-400')
                      : d('text-slate-500 hover:bg-purple-50 hover:text-purple-500', 'text-gray-400 hover:bg-purple-900/20 hover:text-purple-400')
                  }`}
                >
                  <Icon size={20} className={`flex-shrink-0 transition-transform ${isParentActive || isSubmenuOpen ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className={`flex-1 text-left ${isMobileDrawer ? 'block' : 'hidden lg:block'}`}>{item.title}</span>
                  <ChevronDown
                    size={14}
                    className={`flex-shrink-0 transition-transform duration-200 ${isMobileDrawer ? 'block' : 'hidden lg:block'} ${isSubmenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isSubmenuOpen && (isMobileDrawer || true) && (
                  <div className={`mt-1 space-y-0.5 ${isMobileDrawer ? 'pl-4' : 'hidden lg:block pl-2'}`}>
                    {item.children!.map((child, idx) => {
                      const ChildIcon = child.icon;
                      const isChildActive = activeModule === child.module;
                      return (
                        <React.Fragment key={child.module}>
                          {child.groupLabel && (
                            <p className={`text-[9px] font-black uppercase tracking-widest px-3 pb-1 ${idx > 0 ? `pt-2 mt-1 border-t ${d('border-purple-100', 'border-purple-900/30')}` : 'pt-1'} ${d('text-purple-400', 'text-purple-500')}`}>
                              {child.groupLabel}
                            </p>
                          )}
                          <button
                            onClick={() => handleNavigate(child.module)}
                            className={`w-full flex items-center gap-3 px-4 justify-start py-2.5 rounded-xl transition-all font-medium text-sm ${
                              isChildActive
                                ? 'bg-violet-500 text-white shadow-sm shadow-violet-400/30'
                                : d('text-purple-700 hover:bg-purple-100', 'text-purple-300 hover:bg-purple-900/30')
                            }`}
                          >
                            <ChildIcon size={16} className="flex-shrink-0" />
                            <span>{child.title}</span>
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = activeModule === item.module;
          return (
            <button
              key={item.module}
              onClick={() => handleNavigate(item.module)}
              className={`w-full flex items-center gap-3 ${isMobileDrawer ? 'px-4 justify-start' : 'justify-center lg:justify-start px-2 lg:px-4'} py-3 rounded-2xl transition-all font-medium group ${
                isActive
                  ? d('bg-blue-50 text-blue-500 shadow-sm', 'bg-blue-900/40 text-blue-400')
                  : d('text-slate-500 hover:bg-slate-50 hover:text-blue-500', 'text-gray-400 hover:bg-gray-800 hover:text-blue-400')
              }`}
            >
              <Icon size={20} className={`flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className={isMobileDrawer ? 'block' : 'hidden lg:block'}>{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Perfil */}
      <div className={`${isMobileDrawer ? 'p-4' : 'p-2 lg:p-3 m-1.5 lg:m-2'} border-t ${d('border-gray-100', 'border-gray-700')} relative`} ref={menuRef}>
        {showMenu && (isMobileDrawer || !logoutPos) && <ProfilePopup />}
        <button
          ref={isMobileDrawer ? undefined : profileBtnRef}
          onClick={e => toggleLogout(e.currentTarget)}
          className={`w-full rounded-2xl ${isMobileDrawer ? 'p-3' : 'p-2 lg:p-3'} flex items-center gap-3 ${isMobileDrawer ? 'justify-start' : 'justify-center lg:justify-start'} transition-all cursor-pointer ${
            showMenu
              ? d('ring-2 ring-red-200 bg-slate-100', 'ring-2 ring-red-800 bg-gray-800')
              : d('bg-slate-50 hover:bg-slate-100', 'bg-gray-800 hover:bg-gray-700')
          }`}
        >
          <div className={`w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border-2 shadow-sm ${d('border-white', 'border-gray-600')}`}>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.nombre}`} alt="avatar" />
          </div>
          <div className={`${isMobileDrawer ? 'block' : 'hidden lg:block'} overflow-hidden text-left`}>
            <p className={`text-sm font-bold truncate ${d('text-gray-800', 'text-white')}`}>{currentUser?.nombre ?? 'Usuario'}</p>
            <p className={`text-xs font-medium ${d('text-slate-400', 'text-gray-500')}`}>{rolLabel}</p>
          </div>
        </button>
      </div>
    </div>
  );

  const activeSubmenuItem = menuItems.find(m => m.module === openSubmenu && m.children);

  return (
    <>
      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={onMobileClose} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 shadow-2xl flex flex-col transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${d('bg-white', 'bg-gray-900')}`}>
        {sidebarContent(true)}
      </aside>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={`hidden md:flex w-16 lg:w-[220px] h-screen sticky top-0 shadow-soft flex-col flex-shrink-0 transition-all duration-300 ${d('bg-white', 'bg-gray-900')}`}>
        {sidebarContent(false)}
      </aside>

      {/* ── LOGOUT POPUP FLOTANTE (fixed) — solo md, no lg ── */}
      {showMenu && logoutPos && (
        <div
          ref={logoutPopupRef}
          className="hidden md:block lg:hidden fixed z-[200]"
          style={{ bottom: logoutPos.bottom, left: logoutPos.left }}
        >
          <div className={`absolute left-0 bottom-4 -translate-x-1.5 w-3 h-3 border-l border-b rotate-[45deg] ${d('bg-white border-gray-200', 'bg-gray-800 border-gray-700')}`} />
          <div className={`rounded-2xl shadow-xl p-2 min-w-[190px] border ${d('bg-white border-gray-200', 'bg-gray-800 border-gray-700')}`}>
            <div className="px-3 pt-1 pb-2">
              <p className={`text-xs font-bold truncate ${d('text-gray-800', 'text-white')}`}>{currentUser?.nombre ?? 'Usuario'}</p>
              <p className={`text-[11px] ${d('text-slate-400', 'text-gray-500')}`}>{rolLabel}</p>
            </div>
            <div className={`border-t pt-1 space-y-0.5 ${d('border-gray-100', 'border-gray-700')}`}>
              {/* Toggle oscuro */}
              {onToggleDarkMode && (
                <button
                  onClick={() => { onToggleDarkMode(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                    d('text-slate-600 hover:bg-gray-50', 'text-gray-300 hover:bg-gray-700')
                  }`}
                >
                  {darkMode
                    ? <Sun size={16} className="flex-shrink-0 text-amber-400" />
                    : <Moon size={16} className="flex-shrink-0 text-slate-400" />
                  }
                  <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
                </button>
              )}
              {onLogout && (
                <button
                  onClick={() => { setShowMenu(false); setLogoutPos(null); onLogout(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                    d('text-red-400 hover:bg-red-50 hover:text-red-500', 'text-red-400 hover:bg-red-900/30 hover:text-red-300')
                  }`}
                >
                  <LogOut size={16} className="flex-shrink-0" />
                  <span>Cerrar sesión</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── POPUP FLOTANTE SUBMENÚ (fixed) — solo md, no lg ── */}
      {activeSubmenuItem && popupPos && (
        <div
          ref={popupRef}
          className="hidden md:block lg:hidden fixed z-[200]"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          <div className={`absolute left-0 top-4 -translate-x-1.5 w-3 h-3 border-l border-t rotate-[-45deg] ${d('bg-violet-50 border-purple-200', 'bg-purple-900/60 border-purple-700')}`} />
          <div className={`rounded-2xl shadow-xl p-2 min-w-[190px] border ${d('bg-violet-50 border-purple-200 shadow-purple-200/50', 'bg-gray-800 border-purple-700')}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest px-3 pt-1 pb-2 ${d('text-purple-400', 'text-purple-400')}`}>
              {activeSubmenuItem.title}
            </p>
            <div className="space-y-0.5">
              {activeSubmenuItem.children!.map((child, idx) => {
                const ChildIcon = child.icon;
                const isChildActive = activeModule === child.module;
                return (
                  <React.Fragment key={child.module}>
                    {child.groupLabel && (
                      <p className={`text-[9px] font-black uppercase tracking-widest px-3 pb-1 ${idx > 0 ? `pt-2 mt-1 border-t ${d('border-purple-100', 'border-purple-900/30')}` : 'pt-1'} ${d('text-purple-400', 'text-purple-500')}`}>
                        {child.groupLabel}
                      </p>
                    )}
                    <button
                      onClick={() => handleNavigate(child.module)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                        isChildActive
                          ? 'bg-violet-500 text-white shadow-sm shadow-violet-400/30'
                          : d('text-purple-700 hover:bg-purple-100', 'text-purple-300 hover:bg-purple-900/30')
                      }`}
                    >
                      <ChildIcon size={16} className="flex-shrink-0" />
                      <span>{child.title}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
