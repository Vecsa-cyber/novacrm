import { useState, useEffect } from 'react';
import { apiFetch } from '../../../../lib/apiFetch';
import type { EquipoDB, TarifaDB, IndirectoDB, EquipItem, TarifaItem, IndirectoItem } from '../types/quoter.d';

export const fmt = (n: number) =>
  Number(n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export function useQuoterView(currentUser: any) {

  // ── Catálogos ────────────────────────────────────────────────────────────────
  const [catEquipos, setCatEquipos] = useState<EquipoDB[]>([]);
  const [catTarifas, setCatTarifas] = useState<TarifaDB[]>([]);

  // ── Selección activa ─────────────────────────────────────────────────────────
  const [selEquipoId, setSelEquipoId] = useState<number | null>(null);
  const [selTarifaId, setSelTarifaId] = useState<number | null>(null);
  const [flow,        setFlow]        = useState('');
  const [equipQty,    setEquipQty]    = useState(1);
  const [equipNotes,  setEquipNotes]  = useState('');
  const [tarifaQty,   setTarifaQty]   = useState(1);

  // ── Ítems de la cotización ───────────────────────────────────────────────────
  const [equipItems,     setEquipItems]     = useState<EquipItem[]>([]);
  const [tarifaItems,    setTarifaItems]    = useState<TarifaItem[]>([]);
  const [indirectoItems, setIndirectoItems] = useState<IndirectoItem[]>([]);

  // ── Datos del cliente / proyecto ─────────────────────────────────────────────
  const [clientName,    setClientName]    = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail,   setClientEmail]   = useState('');
  const [projectName,   setProjectName]   = useState('');
  const [quoteNotes,    setQuoteNotes]    = useState('');
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);

  // ── Modal: Equipos ───────────────────────────────────────────────────────────
  const [showEquipoModal, setShowEquipoModal] = useState(false);
  const [editingEquipo,   setEditingEquipo]   = useState<EquipoDB | null>(null);
  const [equipoForm,      setEquipoForm]      = useState({
    nombre_equipo: '', tag: '', tipo: '', flujo_referencia: '', unidad: '', costo: '', factor_n: '',
  });
  const [equipoSaving, setEquipoSaving] = useState(false);

  const openEditEquipo = (e: EquipoDB) => {
    setEditingEquipo(e);
    setEquipoForm({
      nombre_equipo:    e.nombre_equipo,
      tag:              e.tag ?? '',
      tipo:             e.tipo ?? '',
      flujo_referencia: String(e.flujo_referencia ?? ''),
      unidad:           e.unidad ?? '',
      costo:            String(e.costo ?? ''),
      factor_n:         String(e.factor_n ?? ''),
    });
    setShowEquipoModal(true);
  };

  const reloadEquipos = () =>
    apiFetch('/api/equipos').then(r => r.json()).then((d: EquipoDB[]) => {
      setCatEquipos(d);
      if (d.length > 0) setSelEquipoId(d[0].id_equipo);
    });

  const saveEquipo = async () => {
    setEquipoSaving(true);
    try {
      const body = {
        nombre_equipo:    equipoForm.nombre_equipo,
        tag:              equipoForm.tag,
        tipo:             equipoForm.tipo,
        flujo_referencia: Number(equipoForm.flujo_referencia) || 0,
        unidad:           equipoForm.unidad,
        costo:            Number(equipoForm.costo) || 0,
        factor_n:         Number(equipoForm.factor_n) || 0,
      };
      if (editingEquipo) {
        await apiFetch(`/api/equipos/${editingEquipo.id_equipo}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch('/api/equipos', { method: 'POST', body: JSON.stringify(body) });
      }
      await reloadEquipos();
      setShowEquipoModal(false);
    } catch (err) { console.error(err); }
    finally { setEquipoSaving(false); }
  };

  const deleteEquipo = async (id: number) => {
    if (!confirm('¿Eliminar este equipo del catálogo?')) return;
    await apiFetch(`/api/equipos/${id}`, { method: 'DELETE' });
    await reloadEquipos();
  };

  // ── Modal: Indirectos ────────────────────────────────────────────────────────
  const [showIndirectoModal, setShowIndirectoModal] = useState(false);
  const [editingIndirecto,   setEditingIndirecto]   = useState<IndirectoDB | null>(null);
  const [indirectoForm,      setIndirectoForm]      = useState({
    concepto: '', tipo: 'Porcentaje' as 'Porcentaje' | 'Monto Fijo', porcentaje_default: '', monto_fijo: '', cantidad: '1',
  });
  const [indirectoSaving, setIndirectoSaving] = useState(false);

  const openNewIndirecto = () => {
    setEditingIndirecto(null);
    setIndirectoForm({ concepto: '', tipo: 'Porcentaje', porcentaje_default: '', monto_fijo: '', cantidad: '1' });
    setShowIndirectoModal(true);
  };

  const openEditIndirecto = (i: IndirectoDB) => {
    setEditingIndirecto(i);
    setIndirectoForm({
      concepto:           i.concepto,
      tipo:               i.tipo,
      porcentaje_default: String(i.porcentaje_default ?? ''),
      monto_fijo:         String(i.monto_fijo ?? ''),
      cantidad:           String(i.cantidad ?? 1),
    });
    setShowIndirectoModal(true);
  };

  const reloadIndirectos = () =>
    apiFetch('/api/costos-indirectos').then(r => r.json()).then((d: IndirectoDB[]) => {
      setIndirectoItems(d.map(i => ({
        id:           `ind-${i.id_indirecto}`,
        id_indirecto: i.id_indirecto,
        concepto:     i.concepto,
        tipo:         i.tipo,
        qty:          Number(i.cantidad) || 1,
        val:          i.tipo === 'Porcentaje' ? Number(i.porcentaje_default) : Number(i.monto_fijo),
        monto_fijo:   Number(i.monto_fijo),
      })));
    });

  const saveIndirecto = async () => {
    setIndirectoSaving(true);
    try {
      const body = {
        concepto:           indirectoForm.concepto,
        tipo:               indirectoForm.tipo,
        porcentaje_default: Number(indirectoForm.porcentaje_default) || 0,
        monto_fijo:         Number(indirectoForm.monto_fijo) || 0,
        cantidad:           Number(indirectoForm.cantidad) || 1,
      };
      if (editingIndirecto) {
        await apiFetch(`/api/costos-indirectos/${editingIndirecto.id_indirecto}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch('/api/costos-indirectos', { method: 'POST', body: JSON.stringify(body) });
      }
      await reloadIndirectos();
      setShowIndirectoModal(false);
    } catch (err) { console.error(err); }
    finally { setIndirectoSaving(false); }
  };

  const deleteIndirecto = async (id: number) => {
    if (!confirm('¿Eliminar este costo indirecto del catálogo?')) return;
    await apiFetch(`/api/costos-indirectos/${id}`, { method: 'DELETE' });
    await reloadIndirectos();
  };

  // ── Modal: Tarifas ───────────────────────────────────────────────────────────
  const [showTarifaModal, setShowTarifaModal] = useState(false);
  const [editingTarifa,   setEditingTarifa]   = useState<TarifaDB | null>(null);
  const [tarifaForm,      setTarifaForm]      = useState({ nombre_tarifa: '', tipo_tarifa: '', costo: '' });
  const [tarifaSaving,    setTarifaSaving]    = useState(false);

  const openNewTarifa = () => {
    setEditingTarifa(null);
    setTarifaForm({ nombre_tarifa: '', tipo_tarifa: '', costo: '' });
    setShowTarifaModal(true);
  };

  const openEditTarifa = (t: TarifaDB) => {
    setEditingTarifa(t);
    setTarifaForm({ nombre_tarifa: t.nombre_tarifa, tipo_tarifa: t.tipo_tarifa ?? '', costo: String(t.costo) });
    setShowTarifaModal(true);
  };

  const reloadTarifas = () =>
    apiFetch('/api/tarifas').then(r => r.json()).then((d: TarifaDB[]) => {
      setCatTarifas(d);
      if (d.length > 0) setSelTarifaId(d[0].id_tarifa);
    });

  const saveTarifa = async () => {
    setTarifaSaving(true);
    try {
      const body = { nombre_tarifa: tarifaForm.nombre_tarifa, tipo_tarifa: tarifaForm.tipo_tarifa, costo: Number(tarifaForm.costo) };
      if (editingTarifa) {
        await apiFetch(`/api/tarifas/${editingTarifa.id_tarifa}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch('/api/tarifas', { method: 'POST', body: JSON.stringify(body) });
      }
      await reloadTarifas();
      setShowTarifaModal(false);
    } catch (err) { console.error(err); }
    finally { setTarifaSaving(false); }
  };

  const deleteTarifa = async (id: number) => {
    if (!confirm('¿Eliminar esta tarifa del catálogo?')) return;
    await apiFetch(`/api/tarifas/${id}`, { method: 'DELETE' });
    await reloadTarifas();
  };

  // ── Carga inicial ────────────────────────────────────────────────────────────
  useEffect(() => {
    apiFetch('/api/equipos').then(r => r.json()).then((d: EquipoDB[]) => {
      setCatEquipos(d);
      if (d.length > 0) setSelEquipoId(d[0].id_equipo);
    }).catch(console.error);

    apiFetch('/api/tarifas').then(r => r.json()).then((d: TarifaDB[]) => {
      setCatTarifas(d);
      if (d.length > 0) setSelTarifaId(d[0].id_tarifa);
    }).catch(console.error);

    apiFetch('/api/costos-indirectos').then(r => r.json()).then((d: IndirectoDB[]) => {
      setIndirectoItems(d.map(i => ({
        id:           `ind-${i.id_indirecto}`,
        id_indirecto: i.id_indirecto,
        concepto:     i.concepto,
        tipo:         i.tipo,
        qty:          Number(i.cantidad) || 1,
        val:          i.tipo === 'Porcentaje' ? Number(i.porcentaje_default) : Number(i.monto_fijo),
        monto_fijo:   Number(i.monto_fijo),
      })));
    }).catch(console.error);
  }, []);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const selEquipo = catEquipos.find(e => e.id_equipo === selEquipoId) ?? null;
  const selTarifa = catTarifas.find(t => t.id_tarifa === selTarifaId) ?? null;

  const totalEquipos = equipItems.reduce((s, e) => s + e.total, 0);
  const totalTarifas = tarifaItems.reduce((s, t) => s + t.total, 0);
  const computedInds = indirectoItems.map(i => ({
    ...i,
    total: i.tipo === 'Porcentaje' ? i.monto_fijo * i.val * i.qty : i.val * i.qty,
  }));
  const totalIndirectos = computedInds.reduce((s, i) => s + i.total, 0);
  const grandTotal      = totalEquipos + totalTarifas + totalIndirectos;

  // ── Handlers de cotización ───────────────────────────────────────────────────
  const handleAddEquipo = () => {
    if (!selEquipo) return;
    const s2 = parseFloat(flow);
    if (!s2 || s2 <= 0) return;
    const refFlow  = Number(selEquipo.flujo_referencia);
    const refCost  = Number(selEquipo.costo);
    const factor   = Number(selEquipo.factor_n);
    const unitCost = refCost * Math.pow(s2 / refFlow, factor);
    const name = `${selEquipo.tag} — ${selEquipo.nombre_equipo} (${selEquipo.flujo_referencia} ${selEquipo.unidad})`;
    setEquipItems(prev => [...prev, {
      id: `eq-${Date.now()}`, id_equipo: selEquipo.id_equipo,
      name, refCost, factor, flow, qty: equipQty, notes: equipNotes, unitCost, total: unitCost * equipQty,
    }]);
    setFlow(''); setEquipQty(1); setEquipNotes('');
  };

  const handleAddTarifa = () => {
    if (!selTarifa) return;
    setTarifaItems(prev => [...prev, {
      id: `tar-${Date.now()}`, id_tarifa: selTarifa.id_tarifa,
      nombre: selTarifa.nombre_tarifa, tipo: selTarifa.tipo_tarifa ?? '',
      cantidad: tarifaQty, costo_unitario: Number(selTarifa.costo),
      total: Number(selTarifa.costo) * tarifaQty,
    }]);
    setTarifaQty(1);
  };

  const updateIndirecto = (id: string, field: 'qty' | 'val', value: number) =>
    setIndirectoItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const saveCotizacion = async () => {
    setSaving(true);
    try {
      await apiFetch('/api/cotizaciones', {
        method: 'POST',
        body: JSON.stringify({
          nombre_proyecto: projectName,
          nombre_cliente:  clientName,
          empresa:         clientCompany,
          correo:          clientEmail,
          id_usuario:      currentUser?.id_usuario ?? null,
          id_planta:       null,
          equipos:    equipItems.map(e => ({ id_equipo: e.id_equipo, cantidad: e.qty, precio_unitario_venta: e.unitCost })),
          tarifas:    tarifaItems.map(t => ({ id_tarifa: t.id_tarifa, cantidad: t.cantidad, costo_unitario_aplicado: t.costo_unitario })),
          indirectos: computedInds.map(i => ({ id_indirecto: i.id_indirecto, monto_aplicado: i.total })),
          tabulador:  [],
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error al guardar:', err);
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = async () => {
    const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1' as any);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const W = 215.9, mL = 15, mR = W - 15;
    const blue  = [24, 95, 165]   as [number, number, number];
    const dark  = [30, 41, 59]    as [number, number, number];
    const gray  = [100, 116, 139] as [number, number, number];
    const light = [241, 245, 249] as [number, number, number];
    let y = 0;

    const checkPage = (needed: number) => { if (y + needed > 260) { doc.addPage(); y = 20; } };

    const pdfSectionTitle = (title: string) => {
      checkPage(14);
      doc.setFillColor(...blue); doc.rect(mL, y, W - 30, 8, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
      doc.text(title, mL + 3, y + 5.5); y += 10;
    };

    const pdfTableHeader = (cols: { label: string; x: number; align?: string }[]) => {
      doc.setFillColor(224, 231, 255); doc.rect(mL, y, W - 30, 7, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...dark);
      cols.forEach(c => doc.text(c.label, c.x, y + 5, { align: (c.align as any) || 'left' }));
      y += 8;
    };

    doc.setFillColor(...blue); doc.rect(0, 0, W, 38, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(255, 255, 255);
    doc.text('Nova', mL, 16); doc.setTextColor(147, 197, 253); doc.text('CRM', mL + 22, 16);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(255, 255, 255);
    doc.text('Sistema de Cotizaciones', mL, 23);
    const folio = `COT-${Date.now().toString().slice(-6)}`;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text('COTIZACION DE PROYECTO', mR, 13, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    doc.text(`Folio: ${folio}`, mR, 20, { align: 'right' });
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, mR, 26, { align: 'right' });
    doc.text(`Elaboro: ${currentUser?.nombre ?? 'Vendedor'}`, mR, 32, { align: 'right' });
    y = 46;

    const half = (W - 30) / 2;
    doc.setFillColor(...light); doc.rect(mL, y, half - 2, 28, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...blue);
    doc.text('DATOS DEL CLIENTE', mL + 3, y + 6);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...dark);
    doc.text(clientName || 'Sin nombre', mL + 3, y + 13);
    doc.text(clientCompany || 'Sin empresa', mL + 3, y + 19);
    doc.text(clientEmail || '', mL + 3, y + 25);
    const cx2 = mL + half + 2;
    doc.setFillColor(...light); doc.rect(cx2, y, half - 2, 28, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...blue);
    doc.text('PROYECTO', cx2 + 3, y + 6);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...dark);
    doc.text(projectName || 'Sin nombre de proyecto', cx2 + 3, y + 13);
    y += 34;

    pdfSectionTitle('PARTIDAS DE EQUIPOS');
    if (equipItems.length === 0) {
      doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(...gray);
      doc.text('Sin equipos agregados.', mL + 3, y + 5); y += 10;
    } else {
      pdfTableHeader([
        { label: '#', x: mL + 3 }, { label: 'Equipo', x: mL + 10 },
        { label: 'Flujo', x: mL + 95 }, { label: 'Cant.', x: mL + 118 },
        { label: 'C. Unitario', x: mL + 133 }, { label: 'Total', x: mR, align: 'right' },
      ]);
      equipItems.forEach((eq, i) => {
        checkPage(12);
        doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
        doc.rect(mL, y, W - 30, 10, 'F');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...dark);
        doc.text(`${i + 1}`, mL + 3, y + 6.5);
        doc.text(eq.name.length > 42 ? eq.name.slice(0, 40) + '...' : eq.name, mL + 10, y + 6.5);
        doc.text(`${eq.flow}`, mL + 95, y + 6.5);
        doc.text(`${eq.qty}`, mL + 121, y + 6.5);
        doc.text(fmt(eq.unitCost), mL + 133, y + 6.5);
        doc.text(fmt(eq.total), mR, y + 6.5, { align: 'right' });
        y += 11;
      });
      checkPage(10);
      doc.setFillColor(...light); doc.rect(mL, y, W - 30, 8, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...blue);
      doc.text('Subtotal Equipos', mL + 3, y + 5.5);
      doc.text(fmt(totalEquipos), mR, y + 5.5, { align: 'right' }); y += 13;
    }

    if (tarifaItems.length > 0) {
      pdfSectionTitle('TARIFAS');
      pdfTableHeader([
        { label: 'Tarifa', x: mL + 3 }, { label: 'Tipo', x: mL + 90 },
        { label: 'Cant.', x: mL + 130 }, { label: 'C. Unit.', x: mL + 148 },
        { label: 'Total', x: mR, align: 'right' },
      ]);
      tarifaItems.forEach((t, i) => {
        checkPage(10);
        doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
        doc.rect(mL, y, W - 30, 8, 'F');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...dark);
        doc.text(t.nombre, mL + 3, y + 5.5);
        doc.text(t.tipo || '—', mL + 90, y + 5.5);
        doc.text(`${t.cantidad}`, mL + 133, y + 5.5);
        doc.text(fmt(t.costo_unitario), mL + 148, y + 5.5);
        doc.text(fmt(t.total), mR, y + 5.5, { align: 'right' }); y += 9;
      });
      checkPage(10);
      doc.setFillColor(...light); doc.rect(mL, y, W - 30, 8, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...blue);
      doc.text('Subtotal Tarifas', mL + 3, y + 5.5);
      doc.text(fmt(totalTarifas), mR, y + 5.5, { align: 'right' }); y += 13;
    }

    pdfSectionTitle('COSTOS INDIRECTOS');
    pdfTableHeader([
      { label: 'Concepto', x: mL + 3 }, { label: 'Tipo', x: mL + 112 },
      { label: 'Cant.', x: mL + 130 }, { label: 'Valor', x: mL + 146 },
      { label: 'Total', x: mR, align: 'right' },
    ]);
    computedInds.forEach((item, i) => {
      checkPage(10);
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      doc.rect(mL, y, W - 30, 8, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...dark);
      doc.text(item.concepto, mL + 3, y + 5.5);
      doc.text(item.tipo === 'Porcentaje' ? '% Eq.' : 'Fijo', mL + 112, y + 5.5);
      doc.text(`${item.qty}`, mL + 133, y + 5.5);
      doc.text(item.tipo === 'Porcentaje' ? `${item.val}%` : fmt(item.val), mL + 146, y + 5.5);
      doc.text(fmt(item.total), mR, y + 5.5, { align: 'right' }); y += 9;
    });
    checkPage(10);
    doc.setFillColor(...light); doc.rect(mL, y, W - 30, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...blue);
    doc.text('Subtotal Indirectos', mL + 3, y + 5.5);
    doc.text(fmt(totalIndirectos), mR, y + 5.5, { align: 'right' }); y += 13;

    checkPage(16);
    doc.setFillColor(...blue); doc.rect(mL, y, W - 30, 14, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(255, 255, 255);
    doc.text('TOTAL DEL PROYECTO', mL + 5, y + 9.5);
    doc.setFontSize(14); doc.text(fmt(grandTotal), mR, y + 9.5, { align: 'right' }); y += 20;

    if (quoteNotes) {
      checkPage(24);
      doc.setFillColor(...light); doc.rect(mL, y, W - 30, 22, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...blue);
      doc.text('NOTAS Y CONDICIONES', mL + 3, y + 6);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...dark);
      doc.text(doc.splitTextToSize(quoteNotes, W - 36).slice(0, 3), mL + 3, y + 13); y += 24;
    }

    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(...light); doc.rect(0, 274, W, 12, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...gray);
      doc.text('Cotizacion generada por NovaCRM  |  Valida por 30 dias a partir de la fecha de emision', W / 2, 280, { align: 'center' });
      doc.text(`Pag. ${p} / ${totalPages}`, mR, 280, { align: 'right' });
    }
    doc.save(`Cotizacion_${folio}.pdf`);
  };

  return {
    // catálogos
    catEquipos, catTarifas,
    // selección
    selEquipo, selTarifa,
    selEquipoId, setSelEquipoId,
    selTarifaId, setSelTarifaId,
    flow, setFlow,
    equipQty, setEquipQty,
    equipNotes, setEquipNotes,
    tarifaQty, setTarifaQty,
    // ítems
    equipItems, setEquipItems,
    tarifaItems, setTarifaItems,
    indirectoItems, computedInds,
    // totales
    totalEquipos, totalTarifas, totalIndirectos, grandTotal,
    // cliente
    clientName,    setClientName,
    clientCompany, setClientCompany,
    clientEmail,   setClientEmail,
    projectName,   setProjectName,
    quoteNotes,    setQuoteNotes,
    saving, saved,
    // modal equipos
    showEquipoModal, setShowEquipoModal,
    editingEquipo,   setEditingEquipo,
    equipoForm,      setEquipoForm,
    equipoSaving,
    openEditEquipo, saveEquipo, deleteEquipo,
    // modal indirectos
    showIndirectoModal, setShowIndirectoModal,
    editingIndirecto,   setEditingIndirecto,
    indirectoForm,      setIndirectoForm,
    indirectoSaving,
    openNewIndirecto, openEditIndirecto, saveIndirecto, deleteIndirecto,
    // modal tarifas
    showTarifaModal, setShowTarifaModal,
    editingTarifa,   setEditingTarifa,
    tarifaForm,      setTarifaForm,
    tarifaSaving,
    openNewTarifa, openEditTarifa, saveTarifa, deleteTarifa,
    // handlers cotización
    handleAddEquipo, handleAddTarifa, updateIndirecto, saveCotizacion, generatePDF,
  };
}
