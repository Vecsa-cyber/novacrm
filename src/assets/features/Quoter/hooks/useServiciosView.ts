import { useState, useEffect } from 'react';
import { apiFetch } from '../../../../lib/apiFetch';
import type { LineaServicio, TabuladorDB, TabuladorItem, ServiciosGeneralesProps } from '../types/quoter.d';

export const fmt = (n: number) =>
  Number(n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const emptyLinea = (): LineaServicio => ({
  id: `srv-${Date.now()}-${Math.random()}`,
  descripcion: '',
  cantidad: 1,
  precio_unitario: 0,
});

export function useServiciosView(currentUser: ServiciosGeneralesProps['currentUser']) {

  // ── Datos del cliente / proyecto ─────────────────────────────────────────────
  const [clientName,    setClientName]    = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail,   setClientEmail]   = useState('');
  const [projectName,   setProjectName]   = useState('');
  const [quoteNotes,    setQuoteNotes]    = useState('');

  // ── Partidas de servicio ─────────────────────────────────────────────────────
  const [lineas, setLineas] = useState<LineaServicio[]>([emptyLinea()]);

  // ── Tabulador MO ─────────────────────────────────────────────────────────────
  const [catTabulador,    setCatTabulador]    = useState<TabuladorDB[]>([]);
  const [selTabuladorId,  setSelTabuladorId]  = useState<number | null>(null);
  const [tabuladorQty,    setTabuladorQty]    = useState(1);
  const [tabuladorItems,  setTabuladorItems]  = useState<TabuladorItem[]>([]);

  // ── Parámetros financieros ───────────────────────────────────────────────────
  const [utilidadPct, setUtilidadPct] = useState(20);
  const [diasCredito, setDiasCredito] = useState(3);

  // ── Estado de guardado ───────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  // ── Carga inicial ────────────────────────────────────────────────────────────
  useEffect(() => {
    apiFetch('/api/tabulador-mo').then(r => r.json()).then((d: TabuladorDB[]) => {
      setCatTabulador(d);
      const fijos = d.filter(t => t.categoria?.toLowerCase() === 'fijo');
      if (fijos.length > 0) setSelTabuladorId(fijos[0].id_tabulador);
    }).catch(() => {});
  }, []);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const selTabulador    = catTabulador.find(t => t.id_tabulador === selTabuladorId) ?? null;
  const totalLineas     = lineas.reduce((acc, l) => acc + l.cantidad * l.precio_unitario, 0);
  const totalTabulador  = tabuladorItems.reduce((s, t) => s + t.total, 0);
  const subtotal        = totalLineas + totalTabulador;
  const utilidad        = subtotal * (utilidadPct / 100);
  const costoFinanciero = (subtotal + utilidad) * diasCredito * 0.0005;
  const total           = subtotal + utilidad + costoFinanciero;

  // ── Handlers de partidas ─────────────────────────────────────────────────────
  const addLinea = () => setLineas(prev => [...prev, emptyLinea()]);

  const updateLinea = (id: string, field: keyof LineaServicio, value: string | number) =>
    setLineas(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));

  const removeLinea = (id: string) =>
    setLineas(prev => prev.filter(l => l.id !== id));

  // ── Handlers de tabulador ────────────────────────────────────────────────────
  const handleAddTabulador = () => {
    if (!selTabulador) return;
    setTabuladorItems(prev => [...prev, {
      id:              `tab-${Date.now()}`,
      id_tabulador:    selTabulador.id_tabulador,
      concepto:        selTabulador.concepto,
      cantidad:        tabuladorQty,
      precio_unitario: Number(selTabulador.precio_unitario),
      total:           Number(selTabulador.precio_unitario) * tabuladorQty,
    }]);
  };

  const removeTabuladorItem = (id: string) =>
    setTabuladorItems(prev => prev.filter(x => x.id !== id));

  // ── Guardar cotización ───────────────────────────────────────────────────────
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
          equipos:    [],
          tarifas:    lineas.map(l => ({
            descripcion:             l.descripcion,
            cantidad:                l.cantidad,
            costo_unitario_aplicado: l.precio_unitario,
          })),
          indirectos: [],
          tabulador:  tabuladorItems.map(t => ({
            id_tabulador:    t.id_tabulador,
            cantidad:        t.cantidad,
            precio_aplicado: t.precio_unitario,
          })),
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

  // ── Generar PDF ──────────────────────────────────────────────────────────────
  const generatePDF = async () => {
    const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1' as any);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const W = 215.9, mL = 15, mR = W - 15;
    const green  = [5,   150, 105] as [number, number, number];
    const blue   = [24,   95, 165] as [number, number, number];
    const dark   = [30,   41,  59] as [number, number, number];
    const gray   = [100, 116, 139] as [number, number, number];
    const light  = [241, 245, 249] as [number, number, number];
    const amber  = [217, 119,   6] as [number, number, number];
    const orange = [234,  88,  12] as [number, number, number];
    let y = 0;

    const checkPage = (needed: number) => { if (y + needed > 260) { doc.addPage(); y = 20; } };

    const pdfSection = (title: string, color: [number, number, number] = green) => {
      checkPage(14);
      doc.setFillColor(...color); doc.rect(mL, y, W - 30, 8, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
      doc.text(title, mL + 3, y + 5.5); y += 10;
    };

    const pdfHeader = (cols: { label: string; x: number; align?: string }[]) => {
      doc.setFillColor(209, 250, 229); doc.rect(mL, y, W - 30, 7, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...dark);
      cols.forEach(c => doc.text(c.label, c.x, y + 5, { align: (c.align as any) || 'left' }));
      y += 8;
    };

    // Header
    doc.setFillColor(...green); doc.rect(0, 0, W, 38, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(255, 255, 255);
    doc.text('Nova', mL, 16); doc.setTextColor(167, 243, 208); doc.text('CRM', mL + 24, 16);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(255, 255, 255);
    doc.text('Servicios Generales', mL, 23);
    const folio = `SG-${Date.now().toString().slice(-6)}`;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
    doc.text('COTIZACIÓN DE SERVICIOS', mR, 13, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    doc.text(`Folio: ${folio}`, mR, 20, { align: 'right' });
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, mR, 26, { align: 'right' });
    doc.text(`Elaboró: ${currentUser?.nombre ?? 'Vendedor'}`, mR, 32, { align: 'right' });
    y = 46;

    // Cliente / Proyecto
    const half = (W - 30) / 2;
    doc.setFillColor(...light); doc.rect(mL, y, half - 2, 28, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...green);
    doc.text('DATOS DEL CLIENTE', mL + 3, y + 6);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...dark);
    doc.text(clientName    || 'Sin nombre',  mL + 3, y + 13);
    doc.text(clientCompany || 'Sin empresa', mL + 3, y + 19);
    doc.text(clientEmail   || '',            mL + 3, y + 25);
    const cx2 = mL + half + 2;
    doc.setFillColor(...light); doc.rect(cx2, y, half - 2, 28, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...green);
    doc.text('PROYECTO / SERVICIO', cx2 + 3, y + 6);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...dark);
    doc.text(doc.splitTextToSize(projectName || 'Sin nombre de proyecto', half - 10).slice(0, 2), cx2 + 3, y + 13);
    y += 34;

    // Partidas
    pdfSection('PARTIDAS DE SERVICIO');
    pdfHeader([
      { label: '#',            x: mL + 3   },
      { label: 'Descripción',  x: mL + 10  },
      { label: 'Cant.',        x: mL + 128 },
      { label: 'P. Unitario',  x: mL + 145 },
      { label: 'Total',        x: mR, align: 'right' },
    ]);
    lineas.forEach((l, i) => {
      checkPage(10);
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      doc.rect(mL, y, W - 30, 8, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...dark);
      doc.text(`${i + 1}`, mL + 3, y + 5.5);
      const desc = l.descripcion || `Servicio ${i + 1}`;
      doc.text(desc.length > 50 ? desc.slice(0, 48) + '...' : desc, mL + 10, y + 5.5);
      doc.text(`${l.cantidad}`, mL + 131, y + 5.5);
      doc.text(fmt(l.precio_unitario), mL + 145, y + 5.5);
      doc.text(fmt(l.cantidad * l.precio_unitario), mR, y + 5.5, { align: 'right' });
      y += 9;
    });
    checkPage(10);
    doc.setFillColor(...light); doc.rect(mL, y, W - 30, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...green);
    doc.text('Subtotal Materiales', mL + 3, y + 5.5);
    doc.text(fmt(totalLineas), mR, y + 5.5, { align: 'right' }); y += 13;

    // Mano de obra
    if (tabuladorItems.length > 0) {
      pdfSection('MANO DE OBRA', amber);
      pdfHeader([
        { label: 'Concepto', x: mL + 3   },
        { label: 'Cant.',    x: mL + 128 },
        { label: 'P. Unit.', x: mL + 148 },
        { label: 'Total',    x: mR, align: 'right' },
      ]);
      tabuladorItems.forEach((t, i) => {
        checkPage(10);
        doc.setFillColor(i % 2 === 0 ? 255 : 255, i % 2 === 0 ? 255 : 251, i % 2 === 0 ? 255 : 235);
        doc.rect(mL, y, W - 30, 8, 'F');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...dark);
        doc.text(t.concepto, mL + 3, y + 5.5);
        doc.text(`${t.cantidad}`, mL + 131, y + 5.5);
        doc.text(fmt(t.precio_unitario), mL + 148, y + 5.5);
        doc.text(fmt(t.total), mR, y + 5.5, { align: 'right' }); y += 9;
      });
      checkPage(10);
      doc.setFillColor(255, 251, 235); doc.rect(mL, y, W - 30, 8, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...amber);
      doc.text('Subtotal Mano de Obra', mL + 3, y + 5.5);
      doc.text(fmt(totalTabulador), mR, y + 5.5, { align: 'right' }); y += 13;
    }

    // Resumen
    checkPage(60);
    pdfSection('RESUMEN DE COSTOS');
    const rows: [string, number, [number, number, number]][] = [
      ['Mano de Obra',                                  totalTabulador,  amber  ],
      ['Materiales / Servicios',                        totalLineas,     blue   ],
      ['Subtotal',                                      subtotal,        dark   ],
      [`Utilidad (${utilidadPct}%)`,                    utilidad,        green  ],
      [`Costo Financiero (${diasCredito} días × 0.05%)`, costoFinanciero, orange ],
    ];
    rows.forEach(([label, value, color], i) => {
      checkPage(9);
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      doc.rect(mL, y, W - 30, 8, 'F');
      doc.setFont('helvetica', i === 2 ? 'bold' : 'normal');
      doc.setFontSize(9); doc.setTextColor(...dark);
      doc.text(label, mL + 3, y + 5.5);
      doc.setTextColor(...color);
      doc.text(fmt(value), mR, y + 5.5, { align: 'right' }); y += 9;
    });
    checkPage(14);
    doc.setFillColor(...green); doc.rect(mL, y, W - 30, 12, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(255, 255, 255);
    doc.text('TOTAL DEL SERVICIO', mL + 5, y + 8.5);
    doc.setFontSize(13); doc.text(fmt(total), mR, y + 8.5, { align: 'right' }); y += 18;

    // Notas
    if (quoteNotes) {
      checkPage(24);
      doc.setFillColor(...light); doc.rect(mL, y, W - 30, 22, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...green);
      doc.text('NOTAS Y CONDICIONES', mL + 3, y + 6);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...dark);
      doc.text(doc.splitTextToSize(quoteNotes, W - 36).slice(0, 3), mL + 3, y + 13); y += 24;
    }

    // Footer
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFillColor(...light); doc.rect(0, 274, W, 12, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...gray);
      doc.text('Cotización generada por NovaCRM  |  Válida por 30 días a partir de la fecha de emisión', W / 2, 280, { align: 'center' });
      doc.text(`Pág. ${p} / ${pages}`, mR, 280, { align: 'right' });
    }

    doc.save(`Cotizacion_${folio}.pdf`);
  };

  return {
    // cliente
    clientName,    setClientName,
    clientCompany, setClientCompany,
    clientEmail,   setClientEmail,
    projectName,   setProjectName,
    quoteNotes,    setQuoteNotes,
    // partidas
    lineas,
    addLinea, updateLinea, removeLinea,
    // tabulador
    catTabulador,
    selTabuladorId, setSelTabuladorId,
    tabuladorQty,   setTabuladorQty,
    tabuladorItems, removeTabuladorItem,
    handleAddTabulador,
    // financiero
    utilidadPct, setUtilidadPct,
    diasCredito,  setDiasCredito,
    // totales
    totalLineas, totalTabulador, subtotal, utilidad, costoFinanciero, total,
    // acciones
    saving, saved,
    saveCotizacion, generatePDF,
  };
}
