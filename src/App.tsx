import React, { useState } from 'react';
import { Sidebar } from './assets/features/Dashboard/components/Sidebar';
import { DashboardDetailsView } from './assets/features/Dashboard/View/DashboardDetailView';
import { ContactsListView } from './assets/features/Contacts/Views/ContactsListView'; 

function App() {
  // 1. ESTADO PARA CONTROLAR LA VISTA ACTUAL
  const [currentView, setCurrentView] = useState('dashboard');

  const currentUser = {
    nombre: 'Eduardo',
    rol: 'gerente_ventas', 
    modulosPermitidos: ['dashboard', 'contacts', 'pipeline', 'activities', 'settings'],
    permisos: {
      verTratosGlobales: true,
      verActividadesGlobales: true,
      verReporteFinanciero: true,
      verMetricasPipeline: true, 
      verMisTareas: true,
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc]">
      
      {/* 2. Pasamos el estado y la función al Sidebar */}
      <Sidebar 
        allowedModules={currentUser.modulosPermitidos} 
        activeModule={currentView}
        onNavigate={setCurrentView}
      />

      <main className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto overflow-x-hidden">
        
        {/* RENDERIZADO MODULAR: React solo inyecta el componente necesario */}
        {currentView === 'dashboard' && <DashboardDetailsView />}
        {currentView === 'contacts' && <ContactsListView />}

      </main>
    </div>
  );
}

export default App;