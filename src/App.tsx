import { useState } from 'react';
import { clearToken } from './lib/apiFetch';
import { useDarkMode } from './lib/useDarkMode';
import { Sidebar } from './assets/features/Dashboard/components/Sidebar';
import { DashboardDetailsView } from './assets/features/Dashboard/View/DashboardDetailView';
import { ContactsListView } from './assets/features/Contacts/Views/ContactsListView';
import { LoginView } from './assets/features/Auth/Views/LoginView'; 
import { PipelineView } from './assets/features/Pipieline/Views/PipelineView';
import { ActivitiesView } from './assets/features/Activities/Views/ActivitiesView';
import { SettingsView } from './assets/features/Settings/Views/SettingsViews';
import { DealsView } from './assets/features/Deals/Views/DealsView';
import { QuoterView } from './assets/features/Quoter/Views/QuoterView';
import { ServiciosGeneralesView } from './assets/features/Quoter/Views/ServiciosGeneralesView';
import { MantenimientoView } from './assets/features/Quoter/Views/MantenimientoView';
import { GMAODashboardView } from './assets/features/GMAO/Views/GMAODashboardView';
import { GMAOClientesView } from './assets/features/GMAO/Views/GMAOClientesView';
import { GMAOActivosView } from './assets/features/GMAO/Views/GMAOActivosView';
import { GMAOOrdenesView } from './assets/features/GMAO/Views/GMAOOrdenesView';
import { GMAOCalendarioView } from './assets/features/GMAO/Views/GMAOCalendarioView';
import { GMAOAlertasView } from './assets/features/GMAO/Views/GMAOAlertasView';
import { GMAOKPIsView } from './assets/features/GMAO/Views/GMAOKPIsView';
import { MantenimientoPredictivo } from './assets/features/Mantenimiento/Views/MantenimientoPredictivo';
import { PlanMantenimientoView } from './assets/features/Mantenimiento/Views/PlanMantenimientoView';
import { RequisicionesView } from './assets/features/Compras/Views/RequisicionesView';
import { OrdenesView } from './assets/features/Compras/Views/OrdenesView';
import { ComprasListView } from './assets/features/Compras/Views/ComprasListView';
import { PedidosView } from './assets/features/Facturacion/Views/PedidosView';

function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<number | undefined>(undefined);
  const { darkMode, toggleDarkMode } = useDarkMode();

  const navigateTo = (module: string, id?: number) => {
    setCurrentView(module);
    setHighlightId(id);
    if (id !== undefined) {
      setTimeout(() => setHighlightId(undefined), 5000);
    }
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={(userData) => setCurrentUser(userData)} />;
  }

  return (
    <div className={`flex h-screen w-full overflow-x-hidden ${darkMode ? 'bg-gray-950' : 'bg-[#f8fafc]'}`}>

      <Sidebar
        currentUser={currentUser}
        activeModule={currentView}
        onNavigate={(module) => { setCurrentView(module); setHighlightId(undefined); }}
        onLogout={() => { clearToken(); setCurrentUser(null); setCurrentView('dashboard'); }}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className={`md:hidden flex items-center gap-3 px-4 py-3 border-b flex-shrink-0 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            aria-label="Abrir menú"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Nova<span className="text-blue-500">CRM</span></span>
          </div>
        </header>

      <main className={`flex-1 min-w-0 p-4 md:p-10 overflow-y-auto overflow-x-hidden ${darkMode ? 'text-gray-100' : ''}`}>

        {/* CORRECCIÓN 1: Faltaba pasar la variable `currentUser={currentUser}` 
            hacia adentro de los componentes para que no te marque error de TypeScript
            y para que los StatCards puedan leer si es Rol 1 o Rol 2.
        */}
        {currentView === 'dashboard' && (
          <DashboardDetailsView onNavigate={navigateTo} darkMode={darkMode} />
        )}

        {/* CORRECCIÓN 2: "Gatekeeping" (El cadenero). 
            Verificamos en el arreglo de `modulosPermitidos` si el usuario tiene permiso. 
            Si un vendedor intenta forzar la vista, simplemente no cargará.
        */}
        {currentView === 'contacts' && currentUser?.modulosPermitidos?.includes('contacts') && (
          <ContactsListView darkMode={darkMode} />
        )}

        {/* VISTA DE PIPELINE */}
        {currentView === 'pipeline' && currentUser?.modulosPermitidos?.includes('pipeline') && (
          <PipelineView currentUser={currentUser} highlightId={highlightId} darkMode={darkMode} />
        )}

        {/* VISTA DE ACTIVIDADES */}
        {currentView === 'activities' && currentUser?.modulosPermitidos?.includes('activities') && (
          <ActivitiesView currentUser={currentUser} highlightId={highlightId} darkMode={darkMode} />
        )}

        {/* VISTA DE CONFIGURACIÓN */}
        {currentView === 'settings' && currentUser?.modulosPermitidos?.includes('settings') && (
          <SettingsView currentUser={currentUser} darkMode={darkMode} />
        )}

        {/* VISTA DE NEGOCIOS / RENDIMIENTO */}
        {currentView === 'deals' && currentUser?.modulosPermitidos?.includes('deals') && (
          <DealsView currentUser={currentUser} darkMode={darkMode} />
        )}

        {/* VISTA DEL COTIZADOR */}
        {currentView === 'quoter' && currentUser?.modulosPermitidos?.includes('quoter') && (
          <QuoterView currentUser={currentUser} darkMode={darkMode} />
        )}

        {/* VISTA DE SERVICIOS GENERALES */}
        {currentView === 'servicios' && currentUser?.modulosPermitidos?.includes('quoter') && (
          <ServiciosGeneralesView currentUser={currentUser} darkMode={darkMode} />
        )}

        {currentView === 'mantenimiento' && currentUser?.modulosPermitidos?.includes('quoter') && (
          <MantenimientoView darkMode={darkMode} />
        )}

        {currentView === 'gmao-dashboard' && currentUser?.modulosPermitidos?.includes('gmao-dashboard') && (
          <GMAODashboardView darkMode={darkMode} />
        )}
        {currentView === 'gmao-clientes' && currentUser?.modulosPermitidos?.includes('gmao-clientes') && (
          <GMAOClientesView darkMode={darkMode} />
        )}
        {currentView === 'gmao-activos' && currentUser?.modulosPermitidos?.includes('gmao-activos') && (
          <GMAOActivosView darkMode={darkMode} />
        )}
        {currentView === 'gmao-ordenes' && currentUser?.modulosPermitidos?.includes('gmao-ordenes') && (
          <GMAOOrdenesView darkMode={darkMode} />
        )}
        {currentView === 'gmao-calendario' && currentUser?.modulosPermitidos?.includes('gmao-calendario') && (
          <GMAOCalendarioView darkMode={darkMode} />
        )}
        {currentView === 'gmao-alertas' && currentUser?.modulosPermitidos?.includes('gmao-alertas') && (
          <GMAOAlertasView darkMode={darkMode} />
        )}
        {currentView === 'gmao-kpis' && currentUser?.modulosPermitidos?.includes('gmao-kpis') && (
          <GMAOKPIsView darkMode={darkMode} />
        )}

        {currentView === 'mantenimiento-predictivo' && currentUser?.modulosPermitidos?.includes('mantenimiento-predictivo') && (
          <MantenimientoPredictivo darkMode={darkMode} />
        )}

        {currentView === 'mantenimiento-plan' && currentUser?.modulosPermitidos?.includes('mantenimiento-plan') && (
          <PlanMantenimientoView darkMode={darkMode} />
        )}

        {currentView === 'requisiciones' && currentUser?.modulosPermitidos?.includes('requisiciones') && (
          <RequisicionesView darkMode={darkMode} />
        )}

        {currentView === 'ordenes' && currentUser?.modulosPermitidos?.includes('ordenes') && (
          <OrdenesView darkMode={darkMode} />
        )}

        {currentView === 'compras-list' && currentUser?.modulosPermitidos?.includes('compras-list') && (
          <ComprasListView darkMode={darkMode} />
        )}

        {currentView === 'pedidos' && currentUser?.modulosPermitidos?.includes('pedidos') && (
          <PedidosView darkMode={darkMode} />
        )}

        {/* Ejemplo de cómo quedaría Settings (Solo para Admin / Rol 1) */}
        {currentView === 'settings' && currentUser?.rol === 1 && (
           <div className="p-10 font-bold text-gray-800">Vista de Configuración Exclusiva del Admin</div>
        )}

      </main>
      </div>
    </div>
  );
}

export default App;