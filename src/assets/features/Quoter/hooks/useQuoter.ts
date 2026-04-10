import { useState } from 'react';
import type {
  EquipoDB,
  TarifaDB,
  IndirectoDB,
  TabuladorDB,
  EquipItem,
  TarifaItem,
  IndirectoItem,
  TabuladorItem,
} from '../types/quoter.d';
import { indirectoDBtoItem, saveCotizacion } from '../services/quoterApi';

export function useQuoter(currentUser: any) {
  // ── Selección de ítems ──────────────────────────────────────────────────────
  const [selEquipoId,    setSelEquipoId]    = useState<number | null>(null);
  const [selTarifaId,    setSelTarifaId]    = useState<number | null>(null);
  const [flow,           setFlow]           = useState('');
  const [equipQty,       setEquipQty]       = useState(1);
  const [equipNotes,     setEquipNotes]     = useState('');
  const [tarifaQty,      setTarifaQty]      = useState(1);

  // ── Listas de cotización ────────────────────────────────────────────────────
  const [equipItems,     setEquipItems]     = useState<EquipItem[]>([]);
  const [tarifaItems,    setTarifaItems]    = useState<TarifaItem[]>([]);
  const [indirectoItems, setIndirectoItems] = useState<IndirectoItem[]>([]);
  const [tabuladorItems, setTabuladorItems] = useState<TabuladorItem[]>([]);

  // ── Datos del cliente / proyecto ────────────────────────────────────────────
  const [clientName,    setClientName]    = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail,   setClientEmail]   = useState('');
  const [projectName,   setProjectName]   = useState('');
  const [quoteNotes,    setQuoteNotes]    = useState('');

  // ── Estado de guardado ──────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  // ── Cálculos ────────────────────────────────────────────────────────────────
  const subtotalEquipos   = equipItems.reduce((s, i) => s + i.total, 0);
  const subtotalTarifas   = tarifaItems.reduce((s, i) => s + i.total, 0);
  const subtotalTabulador = tabuladorItems.reduce((s, i) => s + i.total, 0);
  const subtotalBase      = subtotalEquipos + subtotalTarifas + subtotalTabulador;
  const totalIndirectos   = indirectoItems.reduce((s, i) => {
    const m = i.tipo === 'Porcentaje' ? (subtotalBase * i.val) / 100 : i.val;
    return s + m;
  }, 0);
  const total = subtotalBase + totalIndirectos;

  // ── Agregar equipo ──────────────────────────────────────────────────────────
  const addEquipo = (catEquipos: EquipoDB[]) => {
    const eq = catEquipos.find(e => e.id_equipo === selEquipoId);
    if (!eq) return;
    const unitCost = eq.costo * Math.pow(Number(flow) / eq.flujo_referencia, eq.factor_n);
    setEquipItems(prev => [
      ...prev,
      {
        id:       crypto.randomUUID(),
        id_equipo: eq.id_equipo,
        name:     eq.nombre_equipo,
        refCost:  eq.costo,
        factor:   eq.factor_n,
        flow:     flow,
        qty:      equipQty,
        notes:    equipNotes,
        unitCost,
        total:    unitCost * equipQty,
      },
    ]);
    setFlow(''); setEquipQty(1); setEquipNotes('');
  };

  // ── Agregar tarifa ──────────────────────────────────────────────────────────
  const addTarifa = (catTarifas: TarifaDB[]) => {
    const t = catTarifas.find(x => x.id_tarifa === selTarifaId);
    if (!t) return;
    setTarifaItems(prev => [
      ...prev,
      {
        id:             crypto.randomUUID(),
        id_tarifa:      t.id_tarifa,
        nombre:         t.nombre_tarifa,
        tipo:           t.tipo_tarifa,
        cantidad:       tarifaQty,
        costo_unitario: t.costo,
        total:          t.costo * tarifaQty,
      },
    ]);
    setTarifaQty(1);
  };

  // ── Agregar indirecto ───────────────────────────────────────────────────────
  const addIndirecto = (catIndirectos: IndirectoDB[]) => {
    setIndirectoItems(prev => [
      ...prev,
      ...catIndirectos.map(indirectoDBtoItem).filter(
        i => !prev.some(p => p.id_indirecto === i.id_indirecto)
      ),
    ]);
  };

  // ── Guardar cotización ──────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveCotizacion({
        nombre_proyecto: projectName,
        nombre_cliente:  clientName,
        empresa:         clientCompany,
        correo:          clientEmail,
        id_usuario:      currentUser?.id_usuario ?? null,
        id_planta:       null,
        equipos:   equipItems.map(i => ({ id_equipo: i.id_equipo, cantidad: i.qty, precio_unitario_venta: i.unitCost })),
        tarifas:   tarifaItems.map(i => ({ id_tarifa: i.id_tarifa, cantidad: i.cantidad, costo_unitario_aplicado: i.costo_unitario })),
        indirectos: indirectoItems.map(i => ({ id_indirecto: i.id_indirecto, monto_aplicado: i.tipo === 'Porcentaje' ? (subtotalBase * i.val) / 100 : i.val })),
        tabulador: tabuladorItems.map(i => ({ id_tabulador: i.id_tabulador, cantidad: i.cantidad, precio_aplicado: i.precio_unitario })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return {
    // selección
    selEquipoId, setSelEquipoId,
    selTarifaId, setSelTarifaId,
    flow, setFlow,
    equipQty, setEquipQty,
    equipNotes, setEquipNotes,
    tarifaQty, setTarifaQty,
    // listas
    equipItems,     setEquipItems,
    tarifaItems,    setTarifaItems,
    indirectoItems, setIndirectoItems,
    tabuladorItems, setTabuladorItems,
    // cliente
    clientName,    setClientName,
    clientCompany, setClientCompany,
    clientEmail,   setClientEmail,
    projectName,   setProjectName,
    quoteNotes,    setQuoteNotes,
    // totales
    subtotalEquipos, subtotalTarifas, subtotalTabulador,
    subtotalBase, totalIndirectos, total,
    // acciones
    addEquipo, addTarifa, addIndirecto,
    saving, saved, handleSave,
  };
}
