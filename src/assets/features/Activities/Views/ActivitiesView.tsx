import React from 'react';
import { AlarmClock, Plus } from 'lucide-react';
import { useActivities } from '../hooks/useActivities';
import { ActivitiesFilters } from '../components/ActivitiesFilters';
import { ActivitiesList } from '../components/ActivitiesList';
import { ActivityDrawer } from '../components/ActivityDrawer';

import type { ActivitiesProps } from '../types/activities';

export const ActivitiesView: React.FC<ActivitiesProps> = ({ currentUser, highlightId, darkMode = false }) => {
  const a = useActivities(currentUser);
  const d = (light: string, dark: string) => darkMode ? dark : light;

  return (
    <div className="flex flex-col gap-6 fade-in h-full">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <AlarmClock className="text-rose-500" size={32} strokeWidth={2.5} />
            <h1 className={`text-3xl font-black tracking-tight ${d('text-slate-800', 'text-white')}`}>Actividades</h1>
          </div>
          <p className={`font-medium mt-1 ${d('text-slate-400', 'text-gray-400')}`}>
            {a.counts.pendientes} pendientes · {a.counts.vencidas} vencidas · {a.counts.completadas} completadas
          </p>
        </div>
        <button
          onClick={() => { a.resetForm(); a.setDrawerOpen(true); }}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-soft hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center"
        >
          <Plus size={20} /> Nueva actividad
        </button>
      </div>

      {/* FILTROS */}
      <ActivitiesFilters
        activeFilter={a.activeFilter}
        onFilterChange={a.setActiveFilter}
        counts={a.counts}
        darkMode={darkMode}
      />

      {/* LISTA */}
      <div className={`flex-1 rounded-[2rem] shadow-soft border overflow-hidden flex flex-col ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`}>
        <ActivitiesList
          filtered={a.filtered}
          highlightId={highlightId}
          expandedId={a.expandedId}
          onToggleExpand={id => a.setExpandedId(a.expandedId === id ? null : id)}
          onToggleComplete={a.toggleComplete}
          darkMode={darkMode}
        />
      </div>

      {/* DRAWER */}
      {a.drawerOpen && (
        <ActivityDrawer
          form={a.form}
          setField={a.setField}
          saving={a.saving}
          isAdmin={a.isAdmin}
          addingType={a.addingType}
          setAddingType={a.setAddingType}
          newType={a.newType}
          setNewType={a.setNewType}
          addType={a.addType}
          catalogoActividades={a.catalogoActividades}
          plantas={a.plantas}
          usuarios={a.usuarios}
          onSubmit={a.submitActivity}
          onClose={() => a.setDrawerOpen(false)}
          darkMode={darkMode}
        />
      )}

    </div>
  );
};
