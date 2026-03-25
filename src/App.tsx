import React, { useState } from 'react';
import { Sidebar } from './assets/features/Dashboard/components/Sidebar';
import { DashboardDetailsView } from './assets/features/Dashboard/View/DashboardDetailView';
import { ContactsListView } from './assets/features/Contacts/Views/ContactsListView';
import { LoginView } from './assets/features/Auth/Views/LoginView'; 
import { PipelineView } from './assets/features/Pipieline/Views/PipelineView';
import { ActivitiesView } from './assets/features/Activities/Views/ActivitiesView';

function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  if (!currentUser) {
    return <LoginView onLoginSuccess={(userData) => setCurrentUser(userData)} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc]">

      <Sidebar
        currentUser={currentUser}
        activeModule={currentView}
        onNavigate={setCurrentView}
        onLogout={() => { setCurrentUser(null); setCurrentView('dashboard'); }}
      />

      <main className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto overflow-x-hidden">

        {/* CORRECCIÓN 1: Faltaba pasar la variable `currentUser={currentUser}` 
            hacia adentro de los componentes para que no te marque error de TypeScript
            y para que los StatCards puedan leer si es Rol 1 o Rol 2.
        */}
        {currentView === 'dashboard' && (
          <DashboardDetailsView />
        )}

        {/* CORRECCIÓN 2: "Gatekeeping" (El cadenero). 
            Verificamos en el arreglo de `modulosPermitidos` si el usuario tiene permiso. 
            Si un vendedor intenta forzar la vista, simplemente no cargará.
        */}
        {currentView === 'contacts' && currentUser?.modulosPermitidos?.includes('contacts') && (
          <ContactsListView />
        )}

        {/* VISTA DE PIPELINE */}
        {currentView === 'pipeline' && currentUser?.modulosPermitidos?.includes('pipeline') && (
          <PipelineView currentUser={currentUser} />
        )}

        {/* VISTA DE ACTIVIDADES */}
        {currentView === 'activities' && currentUser?.modulosPermitidos?.includes('activities') && (
          <ActivitiesView currentUser={currentUser} />
        )}

        {/* Ejemplo de cómo quedaría Settings (Solo para Admin / Rol 1) */}
        {currentView === 'settings' && currentUser?.rol === 1 && (
           <div className="p-10 font-bold text-gray-800">Vista de Configuración Exclusiva del Admin</div>
        )}

      </main>
    </div>
  );
}

export default App;