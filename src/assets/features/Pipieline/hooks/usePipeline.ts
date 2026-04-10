import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../../../../lib/apiFetch';
import {
  STAGE_COLORS, INITIAL_STAGES, INITIAL_LOSS_REASONS, EMPTY_FORM,
  fmt, parseMXN, addDaysToDate, mapRaw,
} from '../constants/pipeline.constants';
import type { Stage, Deal, Usuario, Planta, DealForm } from '../types/pipeline.d';

export function usePipeline(currentUser: any) {
  const isAdmin = currentUser?.rol === 1;

  // ── Datos ──────────────────────────────────────────────────
  const [stages,      setStages]      = useState<Stage[]>(INITIAL_STAGES);
  const [deals,       setDeals]       = useState<Deal[]>([]);
  const [usuarios,    setUsuarios]    = useState<Usuario[]>([]);
  const [plantas,     setPlantas]     = useState<Planta[]>([]);
  const [filterUser,  setFilterUser]  = useState('Todos');
  const [lossReasons, setLossReasons] = useState<string[]>(INITIAL_LOSS_REASONS);

  // ── Admin: editar etapa ────────────────────────────────────
  const [editingStageId,   setEditingStageId]   = useState<number | null>(null);
  const [editingStageName, setEditingStageName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // ── Admin: nueva etapa / razón ─────────────────────────────
  const [addingStage,  setAddingStage]  = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [addingReason, setAddingReason] = useState(false);
  const [newReason,    setNewReason]    = useState('');

  // ── Modal de pérdida ───────────────────────────────────────
  const [lossModal,       setLossModal]       = useState<number | null>(null);
  const [selectedReason,  setSelectedReason]  = useState('');

  // ── Delete confirm ─────────────────────────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // ── Drawer nuevo trato ─────────────────────────────────────
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [form,        setForm]        = useState<DealForm>(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const setField  = (k: keyof DealForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  // ── Vista móvil ────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // ── Drawer editar trato ────────────────────────────────────
  const [editDeal,    setEditDeal]    = useState<Deal | null>(null);
  const [editForm,    setEditForm]    = useState<DealForm>(EMPTY_FORM);
  const [editSaving,  setEditSaving]  = useState(false);
  const setEField = (k: keyof DealForm, v: string) => setEditForm(f => ({ ...f, [k]: v }));

  // ── Carga de datos ─────────────────────────────────────────
  const cargar = () =>
    apiFetch('/api/tratos')
      .then(r => r.json())
      .then(data => setDeals(data.map((t: any) => mapRaw(t, stages))))
      .catch(console.error);

  useEffect(() => {
    cargar();
    apiFetch('/api/usuarios/todos').then(r => r.json()).then(setUsuarios).catch(console.error);
    apiFetch('/api/plantas').then(r => r.json()).then(setPlantas).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingStageId !== null) editInputRef.current?.focus();
  }, [editingStageId]);

  // ── Helpers de vista ───────────────────────────────────────
  const allUsers    = ['Todos', ...Array.from(new Set(deals.filter(d => !d.lossReason).map(d => d.user)))];
  const activeDeals = deals.filter(d => !d.lossReason);
  const lostDeals   = deals.filter(d => !!d.lossReason);
  const visibleDeals = filterUser === 'Todos'
    ? activeDeals
    : activeDeals.filter(d => d.user === filterUser);

  // ── API: mover trato ───────────────────────────────────────
  const moveDeal = async (dealId: number, dir: 'next' | 'prev') => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;
    const nextId = dir === 'next' ? deal.stageId + 1 : deal.stageId - 1;
    if (nextId < 1 || nextId > stages.length) return;
    const newStage = stages.find(s => s.id === nextId);
    if (!newStage) return;
    await apiFetch(`/api/tratos/${dealId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_servicio:   deal.title,
        presupuesto:       deal.presupuesto,
        fecha_visita:      deal.fecha_visita || null,
        fecha_vencimiento: deal.fecha_vencimiento || null,
        estado:            newStage.name,
        id_usuario:        deal.id_usuario,
        id_planta:         deal.id_planta,
        id_contacto:       deal.id_contacto,
      }),
    });
    cargar();
  };

  // ── API: marcar pérdida ────────────────────────────────────
  const confirmLoss = async (dealId: number) => {
    if (!selectedReason) return;
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;
    await apiFetch(`/api/tratos/${dealId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_servicio:   deal.title,
        presupuesto:       deal.presupuesto,
        fecha_visita:      deal.fecha_visita || null,
        fecha_vencimiento: deal.fecha_vencimiento || null,
        estado:            `Perdida: ${selectedReason}`,
        id_usuario:        deal.id_usuario,
        id_planta:         deal.id_planta,
        id_contacto:       deal.id_contacto,
      }),
    });
    setLossModal(null);
    setSelectedReason('');
    cargar();
  };

  // ── API: crear trato ───────────────────────────────────────
  const submitDeal = async () => {
    if (!form.title || !form.company) return;
    const stage = stages.find(s => s.id === Number(form.stageId)) ?? stages[0];
    setSaving(true);
    await apiFetch('/api/tratos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_servicio:   form.title,
        presupuesto:       parseMXN(form.value),
        fecha_visita:      form.fecha || null,
        fecha_vencimiento: form.fecha ? addDaysToDate(form.fecha, 3) : null,
        estado:            stage.name,
        id_usuario:        form.id_usuario ? Number(form.id_usuario) : null,
        id_planta:         form.id_planta  ? Number(form.id_planta)  : null,
        id_contacto:       null,
      }),
    });
    setSaving(false);
    setForm(EMPTY_FORM);
    setNewDealOpen(false);
    cargar();
  };

  // ── API: editar trato ──────────────────────────────────────
  const openEdit = (deal: Deal) => {
    setEditDeal(deal);
    setEditForm({
      title:      deal.title,
      company:    deal.company,
      id_planta:  deal.id_planta  != null ? String(deal.id_planta)  : '',
      id_usuario: deal.id_usuario != null ? String(deal.id_usuario) : '',
      value:      deal.presupuesto > 0 ? fmt(deal.presupuesto) : '',
      fecha:      deal.fecha_visita,
      stageId:    String(deal.stageId),
    });
  };

  const saveEdit = async () => {
    if (!editDeal) return;
    const stage = stages.find(s => s.id === Number(editForm.stageId)) ?? stages[0];
    setEditSaving(true);
    await apiFetch(`/api/tratos/${editDeal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_servicio:   editForm.title,
        presupuesto:       parseMXN(editForm.value),
        fecha_visita:      editForm.fecha || null,
        fecha_vencimiento: editDeal.fecha_vencimiento || null,
        estado:            stage.name,
        id_usuario:        editForm.id_usuario ? Number(editForm.id_usuario) : null,
        id_planta:         editForm.id_planta  ? Number(editForm.id_planta)  : editDeal.id_planta,
        id_contacto:       editDeal.id_contacto,
      }),
    });
    setEditSaving(false);
    setEditDeal(null);
    cargar();
  };

  // ── API: eliminar trato ────────────────────────────────────
  const deleteDeal = async (id: number) => {
    await apiFetch(`/api/tratos/${id}`, { method: 'DELETE' });
    setConfirmDeleteId(null);
    cargar();
  };

  // ── Admin: etapas (local) ──────────────────────────────────
  const startEditStage = (stage: Stage) => {
    setEditingStageId(stage.id);
    setEditingStageName(stage.name);
  };
  const saveStage = () => {
    if (!editingStageName.trim()) return;
    setStages(prev => prev.map(s => s.id === editingStageId ? { ...s, name: editingStageName.trim() } : s));
    setEditingStageId(null);
  };
  const deleteStage = (stageId: number) => {
    if (stages.length <= 1) return;
    setStages(prev => prev.filter(s => s.id !== stageId));
  };
  const addStage = () => {
    if (!newStageName.trim()) return;
    const newId = Math.max(...stages.map(s => s.id)) + 1;
    setStages(prev => [...prev, { id: newId, name: newStageName.trim(), color: STAGE_COLORS[newId % STAGE_COLORS.length] }]);
    setNewStageName('');
    setAddingStage(false);
  };
  const moveStage = (stageId: number, dir: 'left' | 'right') => {
    setStages(prev => {
      const idx    = prev.findIndex(s => s.id === stageId);
      const target = dir === 'left' ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy;
    });
  };

  // ── Admin: razones de pérdida (local) ─────────────────────
  const addLossReason = () => {
    if (!newReason.trim() || lossReasons.includes(newReason.trim())) return;
    setLossReasons(prev => [...prev, newReason.trim()]);
    setNewReason('');
    setAddingReason(false);
  };
  const deleteLossReason = (r: string) => setLossReasons(prev => prev.filter(x => x !== r));

  return {
    // datos
    isAdmin, stages, deals, usuarios, plantas,
    filterUser, setFilterUser,
    lossReasons,
    allUsers, activeDeals, lostDeals, visibleDeals,
    // etapas admin
    editingStageId, setEditingStageId, editingStageName, setEditingStageName,
    editInputRef, addingStage, setAddingStage, newStageName, setNewStageName,
    startEditStage, saveStage, deleteStage, addStage, moveStage, moveDeal,
    // razones admin
    addingReason, setAddingReason, newReason, setNewReason,
    addLossReason, deleteLossReason,
    // modal pérdida
    lossModal, setLossModal, selectedReason, setSelectedReason, confirmLoss,
    // delete
    confirmDeleteId, setConfirmDeleteId, deleteDeal,
    // nuevo trato
    newDealOpen, setNewDealOpen, form, setField, saving, submitDeal,
    // vista móvil
    viewMode, setViewMode,
    // editar trato
    editDeal, setEditDeal, editForm, setEField, editSaving, openEdit, saveEdit,
  };
}
