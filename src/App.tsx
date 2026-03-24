import React, { useState } from 'react';
import { Sidebar } from './assets/features/Dashboard/components/Sidebar';
import { DashboardDetailsView } from './assets/features/Dashboard/View/DashboardDetailView';
import { ContactsListView } from './assets/features/Contacts/Views/ContactsListView'; 
import { LoginView } from './assets/features/Auth/Views/LoginView'; // <-- Importamos el Login

function App() {
  // 1. ESTADO DE AUTENTICACIÓN
  // Inicia en null porque al abrir la app nadie ha iniciado sesión
  const [currentUser, setCurrentUser] = useState<any>(null); 
  
  // 2. ESTADO DE NAVEGACIÓN INTERNA
  const [currentView, setCurrentView] = useState('dashboard');

  // EL GUARDIA DE SEGURIDAD:
  // Si no hay un currentUser, retornamos directamente la pantalla de Login.
  // El resto del código (el Sidebar y el main) ni siquiera se renderiza.
  if (!currentUser) {
    return <LoginView onLoginSuccess={(userData) => setCurrentUser(userData)} />;
  }

  // Si llegamos a esta línea, es porque currentUser ya tiene datos (Login exitoso)
  return (
    <div className="flex h-screen w-full bg-[#f8fafc]">
      
      <Sidebar 
        allowedModules={currentUser.modulosPermitidos} 
        activeModule={currentView}
        onNavigate={setCurrentView}
      />

      <main className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto overflow-x-hidden">
        
        {/* Le pasamos el currentUser real a las vistas para que usen su nombre y permisos */}
        {currentView === 'dashboard' && <DashboardDetailsView />}
        {currentView === 'contacts' && <ContactsListView />}

      </main>
    </div>
  );
}

export default App;