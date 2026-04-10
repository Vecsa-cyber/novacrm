import React from 'react';
import { TrendingUp, Plus, LayoutGrid, List } from 'lucide-react';
import { usePipeline } from '../hooks/usePipeline';
import { DealDrawer } from '../components/DealDrawer';
import { KanbanBoard } from '../components/KanbanBoard';
import { MobileListView } from '../components/MobileListView';
import { LostDealsSection } from '../components/LostDealsSection';
import type { PipelineProps } from '../types/pipeline.d';

export const PipelineView: React.FC<PipelineProps> = ({ currentUser, highlightId, darkMode = false }) => {
  const p = usePipeline(currentUser);
  const d = (light: string, dark: string) => darkMode ? dark : light;

  const dealCardProps = {
    lossModal:          p.lossModal,
    setLossModal:       p.setLossModal,
    selectedReason:     p.selectedReason,
    setSelectedReason:  p.setSelectedReason,
    lossReasons:        p.lossReasons,
    confirmLoss:        p.confirmLoss,
    confirmDeleteId:    p.confirmDeleteId,
    setConfirmDeleteId: p.setConfirmDeleteId,
    deleteDeal:         p.deleteDeal,
    openEdit:           p.openEdit,
    moveDeal:           p.moveDeal,
    darkMode,
  };

  return (
    <div className="flex flex-col gap-6 fade-in">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <TrendingUp className="text-blue-500" size={28} />
            <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${d('text-slate-800', 'text-white')}`}>
              Pipeline de ventas
            </h1>
          </div>
          <p className={`font-medium mt-0.5 text-sm ${d('text-slate-400', 'text-gray-400')}`}>
            {p.isAdmin ? 'Modo Admin — puedes editar etapas y razones de pérdida' : 'Mueve tus tratos hacia el cierre'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {p.isAdmin && (
            <select
              value={p.filterUser}
              onChange={e => p.setFilterUser(e.target.value)}
              className={`border px-4 py-2.5 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm ${d('bg-white border-gray-200 text-slate-700', 'bg-gray-800 border-gray-700 text-gray-200')}`}
            >
              {p.allUsers.map(u => <option key={u}>{u}</option>)}
            </select>
          )}
          <div className={`flex md:hidden border rounded-xl p-1 ${d('bg-white border-gray-200', 'bg-gray-800 border-gray-700')}`}>
            <button
              onClick={() => p.setViewMode('kanban')}
              className={`p-2 rounded-lg transition-colors ${p.viewMode === 'kanban' ? 'bg-blue-500 text-white' : d('text-gray-400 hover:bg-gray-50', 'text-gray-400 hover:bg-gray-700')}`}
            ><LayoutGrid size={16} /></button>
            <button
              onClick={() => p.setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${p.viewMode === 'list' ? 'bg-blue-500 text-white' : d('text-gray-400 hover:bg-gray-50', 'text-gray-400 hover:bg-gray-700')}`}
            ><List size={16} /></button>
          </div>
          <button
            onClick={() => p.setNewDealOpen(true)}
            className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-soft hover:-translate-y-0.5 transition-transform text-sm whitespace-nowrap"
          >
            <Plus size={18} /> Nuevo trato
          </button>
        </div>
      </div>

      {/* LISTA MÓVIL */}
      {p.viewMode === 'list' && (
        <MobileListView
          stages={p.stages}
          visibleDeals={p.visibleDeals}
          highlightId={highlightId}
          {...dealCardProps}
        />
      )}

      {/* KANBAN */}
      <div className={p.viewMode === 'list' ? 'hidden md:block' : ''}>
        <KanbanBoard
          stages={p.stages}
          visibleDeals={p.visibleDeals}
          highlightId={highlightId}
          isAdmin={p.isAdmin}
          editingStageId={p.editingStageId}
          setEditingStageId={p.setEditingStageId}
          editingStageName={p.editingStageName}
          setEditingStageName={p.setEditingStageName}
          editInputRef={p.editInputRef}
          addingStage={p.addingStage}
          setAddingStage={p.setAddingStage}
          newStageName={p.newStageName}
          setNewStageName={p.setNewStageName}
          startEditStage={p.startEditStage}
          saveStage={p.saveStage}
          deleteStage={p.deleteStage}
          addStage={p.addStage}
          moveStage={p.moveStage}
          {...dealCardProps}
        />
      </div>

      {/* PÉRDIDAS */}
      <LostDealsSection
        lostDeals={p.lostDeals}
        highlightId={highlightId}
        isAdmin={p.isAdmin}
        lossReasons={p.lossReasons}
        addingReason={p.addingReason}
        setAddingReason={p.setAddingReason}
        newReason={p.newReason}
        setNewReason={p.setNewReason}
        addLossReason={p.addLossReason}
        deleteLossReason={p.deleteLossReason}
        darkMode={darkMode}
      />

      {/* DRAWER — NUEVO */}
      {p.newDealOpen && (
        <DealDrawer
          title="Nuevo trato" subtitle="Completa los datos del trato"
          form={p.form} setField={p.setField}
          stages={p.stages} usuarios={p.usuarios} plantas={p.plantas}
          saving={p.saving} onClose={() => p.setNewDealOpen(false)}
          onSubmit={p.submitDeal} submitLabel="Agregar trato"
          darkMode={darkMode}
        />
      )}

      {/* DRAWER — EDITAR */}
      {p.editDeal && (
        <DealDrawer
          title="Editar trato" subtitle={`Modificando: ${p.editDeal.title}`}
          form={p.editForm} setField={p.setEField}
          stages={p.stages} usuarios={p.usuarios} plantas={p.plantas}
          saving={p.editSaving} onClose={() => p.setEditDeal(null)}
          onSubmit={p.saveEdit} submitLabel="Guardar cambios"
          darkMode={darkMode}
        />
      )}

    </div>
  );
};
