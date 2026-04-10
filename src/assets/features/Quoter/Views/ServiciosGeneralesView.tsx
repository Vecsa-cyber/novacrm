import React from 'react';
import { Wrench, Plus, Trash2, Save, Check, FileText, Download } from 'lucide-react';
import { useServiciosView, fmt } from '../hooks/useServiciosView';
import { btnDanger } from '../Quoter.styles';
import type { ServiciosGeneralesProps } from '../types/quoter.d';

export const ServiciosGeneralesView: React.FC<ServiciosGeneralesProps> = ({ currentUser, darkMode = false }) => {
  const s = useServiciosView(currentUser);
  const d = (light: string, dark: string) => darkMode ? dark : light;

  // ── Clases reutilizables ─────────────────────────────────────────────────────
  const cardCls    = `rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-soft border ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`;
  const inputCls   = `w-full border px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-400/20 outline-none text-sm transition-all ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-700 border-gray-600 text-gray-100')}`;
  const lineInputCls = `border rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400 transition-colors w-full ${d('border-gray-200 text-gray-800', 'border-gray-600 bg-gray-700 text-gray-100')}`;
  const labelCls   = `text-xs font-bold mb-1.5 block ${d('text-slate-500', 'text-gray-400')}`;
  const dividerCls = `divide-y ${d('divide-gray-50', 'divide-gray-700')}`;
  const smallInputCls = `w-20 border px-3 py-1.5 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-blue-400/20 transition-all ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-700 border-gray-600 text-gray-100')}`;

  return (
    <div className="flex flex-col gap-4 md:gap-6 fade-in pb-24 px-2 sm:px-0">

      {/* ── ENCABEZADO ── */}
      <div>
        <div className="flex items-center gap-3">
          <Wrench className="text-emerald-500 flex-shrink-0" size={28} />
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight leading-tight ${d('text-slate-800', 'text-white')}`}>
            Servicios Generales
          </h1>
        </div>
        <p className={`font-medium mt-1 text-sm ${d('text-slate-400', 'text-gray-400')}`}>
          Genera cotizaciones de servicios de forma rápida y libre.
        </p>
      </div>

      {/* ── DATOS DE LA COTIZACIÓN ── */}
      <div className={cardCls}>
        <h2 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 ${d('text-slate-400', 'text-gray-500')}`}>
          <FileText size={13} className="text-emerald-500" /> Datos de la Cotización
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {([
            { label: 'Nombre del Cliente', value: s.clientName,    set: s.setClientName,    placeholder: 'Ej. Juan Pérez' },
            { label: 'Empresa',            value: s.clientCompany, set: s.setClientCompany, placeholder: 'Ej. Industrias Acme' },
            { label: 'Correo',             value: s.clientEmail,   set: s.setClientEmail,   placeholder: 'correo@empresa.com' },
          ] as const).map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label className={labelCls}>{label}</label>
              <input value={value} onChange={e => set(e.target.value)} placeholder={placeholder} type="text" className={inputCls} />
            </div>
          ))}
          <div className="col-span-1 sm:col-span-2">
            <label className={labelCls}>Nombre del Proyecto / Servicio</label>
            <input value={s.projectName} onChange={e => s.setProjectName(e.target.value)} placeholder="Ej. Mantenimiento preventivo anual" type="text" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Notas / Condiciones</label>
            <input value={s.quoteNotes} onChange={e => s.setQuoteNotes(e.target.value)} placeholder="Ej. IVA no incluido, vigencia 30 días" type="text" className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── PARTIDAS DE SERVICIO ── */}
      <div className={`rounded-2xl md:rounded-[2rem] shadow-soft border overflow-hidden ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`}>
        <div className={`flex items-center justify-between p-4 md:p-5 border-b ${d('border-gray-50', 'border-gray-700')}`}>
          <h2 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${d('text-slate-800', 'text-gray-200')}`}>
            <Wrench size={13} className="text-emerald-500" />
            Partidas de Servicio
            <span className={`px-2 py-0.5 rounded-full ml-1 font-black ${d('bg-emerald-50 text-emerald-600', 'bg-emerald-900/30 text-emerald-400')}`}>{s.lineas.length}</span>
          </h2>
          <button onClick={s.addLinea} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${d('text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100', 'text-emerald-400 bg-emerald-900/20 border border-emerald-700 hover:bg-emerald-900/40')}`}>
            <Plus size={13} /> Agregar partida
          </button>
        </div>

        {/* Cabecera desktop */}
        <div className={`hidden md:grid grid-cols-[1fr_100px_140px_48px] gap-3 px-5 py-3 border-b text-xs font-black uppercase tracking-wider ${d('border-gray-50 bg-gray-50/30 text-gray-400', 'border-gray-700 bg-gray-900/30 text-gray-500')}`}>
          <span>Descripción del Servicio</span>
          <span className="text-center">Cantidad</span>
          <span className="text-right">Precio Unitario</span>
          <span />
        </div>

        <div className={dividerCls}>
          {s.lineas.map((linea, idx) => (
            <div key={linea.id} className="p-4 md:px-5 md:py-3">
              {/* Desktop */}
              <div className="hidden md:grid grid-cols-[1fr_100px_140px_48px] gap-3 items-center">
                <input value={linea.descripcion} onChange={e => s.updateLinea(linea.id, 'descripcion', e.target.value)} placeholder={`Servicio ${idx + 1}...`} className={lineInputCls} />
                <input type="number" min={1} value={linea.cantidad} onChange={e => s.updateLinea(linea.id, 'cantidad', Math.max(1, Number(e.target.value)))} className={`${lineInputCls} text-center`} />
                <input type="number" min={0} value={linea.precio_unitario || ''} onChange={e => s.updateLinea(linea.id, 'precio_unitario', Number(e.target.value))} placeholder="0.00" className={`${lineInputCls} text-right`} />
                <button onClick={() => s.removeLinea(linea.id)} disabled={s.lineas.length === 1} className={`${btnDanger} p-2 hover:bg-red-50 rounded-xl disabled:opacity-0 flex-shrink-0 mx-auto`}>
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Mobile */}
              <div className="md:hidden flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold uppercase ${d('text-gray-400', 'text-gray-500')}`}>Partida {idx + 1}</span>
                  <button onClick={() => s.removeLinea(linea.id)} disabled={s.lineas.length === 1} className={`${btnDanger} p-1.5 hover:bg-red-50 rounded-lg disabled:opacity-0`}>
                    <Trash2 size={13} />
                  </button>
                </div>
                <input value={linea.descripcion} onChange={e => s.updateLinea(linea.id, 'descripcion', e.target.value)} placeholder={`Descripción del servicio ${idx + 1}...`} className={lineInputCls} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`text-xs font-semibold mb-1 block ${d('text-gray-400', 'text-gray-500')}`}>Cantidad</label>
                    <input type="number" min={1} value={linea.cantidad} onChange={e => s.updateLinea(linea.id, 'cantidad', Math.max(1, Number(e.target.value)))} className={`${lineInputCls} text-center`} />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-1 block ${d('text-gray-400', 'text-gray-500')}`}>Precio Unitario</label>
                    <input type="number" min={0} value={linea.precio_unitario || ''} onChange={e => s.updateLinea(linea.id, 'precio_unitario', Number(e.target.value))} placeholder="0.00" className={`${lineInputCls} text-right`} />
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm pt-1">
                  <span className={d('text-gray-400', 'text-gray-500')}>Subtotal</span>
                  <span className={`font-black ${d('text-slate-800', 'text-gray-100')}`}>{fmt(linea.cantidad * linea.precio_unitario)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`flex items-center justify-between px-5 py-4 border-t ${d('bg-slate-50 border-gray-100', 'bg-gray-900/40 border-gray-700')}`}>
          <span className={`text-sm font-black uppercase tracking-wide ${d('text-slate-500', 'text-gray-400')}`}>Subtotal Partidas</span>
          <span className={`text-xl font-black ${d('text-slate-800', 'text-gray-100')}`}>{fmt(s.totalLineas)}</span>
        </div>
      </div>

      {/* ── AGREGAR MANO DE OBRA ── */}
      {s.catTabulador.length > 0 && (
        <div className={cardCls}>
          <h2 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 ${d('text-slate-400', 'text-gray-500')}`}>
            <Wrench size={13} className="text-amber-500" /> Agregar Mano de Obra
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="col-span-1 sm:col-span-2">
              <label className={labelCls}>Concepto</label>
              <select value={s.selTabuladorId ?? ''} onChange={e => s.setSelTabuladorId(Number(e.target.value))} className={`w-full border px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-400/20 outline-none text-sm font-medium ${d('bg-gray-50 border-gray-200 text-gray-800', 'bg-gray-700 border-gray-600 text-gray-100')}`}>
                {s.catTabulador.filter(t => t.categoria?.toLowerCase() === 'fijo').map(t => (
                  <option key={t.id_tabulador} value={t.id_tabulador}>
                    {t.concepto}{t.desde || t.hasta ? ` (${t.desde ?? 0}–${t.hasta ?? '∞'})` : ''} — {fmt(Number(t.precio_unitario))}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Cantidad</label>
              <div className="flex gap-2">
                <input type="number" value={s.tabuladorQty} min={1} onChange={e => s.setTabuladorQty(+e.target.value)} className={`flex-1 min-w-0 border px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-400/20 outline-none text-sm ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-700 border-gray-600 text-gray-100')}`} />
                <button onClick={s.handleAddTabulador} className="bg-amber-500 text-white px-3 py-2.5 rounded-xl font-bold hover:-translate-y-0.5 transition-transform flex items-center gap-1.5 flex-shrink-0 text-sm">
                  <Plus size={16} /> Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PARTIDAS DE MANO DE OBRA ── */}
      {s.tabuladorItems.length > 0 && (
        <div className={`rounded-2xl md:rounded-[2rem] shadow-soft border overflow-hidden ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`}>
          <div className={`flex items-center justify-between p-4 md:p-5 border-b ${d('border-gray-50', 'border-gray-700')}`}>
            <h2 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${d('text-slate-800', 'text-gray-200')}`}>
              <Wrench size={13} className="text-amber-500" />
              Mano de Obra
              <span className={`px-2 py-0.5 rounded-full ml-1 font-black ${d('bg-amber-50 text-amber-600', 'bg-amber-900/30 text-amber-400')}`}>{s.tabuladorItems.length}</span>
            </h2>
          </div>
          {/* Desktop */}
          <div className={`hidden md:block ${dividerCls}`}>
            {s.tabuladorItems.map(t => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                <span className={`font-bold flex-1 min-w-0 truncate ${d('text-gray-800', 'text-gray-100')}`}>{t.concepto}</span>
                <span className={`flex-shrink-0 ${d('text-gray-500', 'text-gray-400')}`}>x{t.cantidad}</span>
                <span className={`font-black flex-shrink-0 ${d('text-slate-800', 'text-gray-100')}`}>{fmt(t.total)}</span>
                <button onClick={() => s.removeTabuladorItem(t.id)} className={`${btnDanger} flex-shrink-0`}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
          {/* Mobile */}
          <div className={`block md:hidden ${dividerCls}`}>
            {s.tabuladorItems.map(t => (
              <div key={t.id} className="p-4 flex flex-col gap-1">
                <div className="flex justify-between items-start gap-2">
                  <p className={`text-sm font-bold flex-1 min-w-0 ${d('text-gray-800', 'text-gray-100')}`}>{t.concepto}</p>
                  <button onClick={() => s.removeTabuladorItem(t.id)} className={`${btnDanger} flex-shrink-0`}><Trash2 size={15} /></button>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={d('text-gray-400', 'text-gray-500')}>Cantidad: <b className={d('text-gray-600', 'text-gray-300')}>x{t.cantidad}</b></span>
                  <span className={`font-black ${d('text-slate-800', 'text-gray-100')}`}>{fmt(t.total)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={`flex items-center justify-between px-5 py-4 border-t ${d('bg-amber-50 border-amber-100', 'bg-amber-900/10 border-amber-800/30')}`}>
            <span className={`text-xs font-black uppercase tracking-wide ${d('text-amber-600', 'text-amber-500')}`}>Subtotal Mano de Obra</span>
            <span className={`text-xl font-black ${d('text-amber-700', 'text-amber-400')}`}>{fmt(s.totalTabulador)}</span>
          </div>
        </div>
      )}

      {/* ── RESUMEN TOTAL ── */}
      <div className={`rounded-2xl md:rounded-[2rem] shadow-soft border overflow-hidden ${d('bg-white border-gray-100', 'bg-gray-800 border-gray-700')}`}>
        <div className={`px-5 py-3 border-b ${d('border-gray-100 bg-gray-50/60', 'border-gray-700 bg-gray-900/40')}`}>
          <span className={`text-xs font-black uppercase tracking-widest ${d('text-slate-500', 'text-gray-400')}`}>Resumen</span>
        </div>

        <div className={`flex items-center gap-4 px-5 py-4 border-b ${d('border-gray-100', 'border-gray-700')}`}>
          <span className={`text-sm font-semibold w-44 flex-shrink-0 ${d('text-slate-600', 'text-gray-300')}`}>Margen de Utilidad:</span>
          <div className="flex items-center gap-2">
            <input type="number" min={0} max={100} value={s.utilidadPct} onChange={e => s.setUtilidadPct(Number(e.target.value))} className={smallInputCls} />
            <span className={`text-sm font-medium ${d('text-slate-400', 'text-gray-500')}`}>%</span>
          </div>
          <span className="ml-auto text-sm font-black text-emerald-600">{fmt(s.utilidad)}</span>
        </div>

        <div className={`flex items-center gap-4 px-5 py-4 border-b ${d('border-gray-100', 'border-gray-700')}`}>
          <span className={`text-sm font-semibold w-44 flex-shrink-0 ${d('text-slate-600', 'text-gray-300')}`}>Días de Crédito:</span>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input type="number" min={0} value={s.diasCredito} onChange={e => s.setDiasCredito(Number(e.target.value))} className={`${smallInputCls} flex-shrink-0`} />
            <span className={`text-sm font-medium whitespace-nowrap ${d('text-slate-400', 'text-gray-500')}`}>días × 0.05% diario (18% anual)</span>
          </div>
          <span className="ml-auto text-sm font-black text-orange-500 flex-shrink-0">{fmt(s.costoFinanciero)}</span>
        </div>

        <div className={`grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 border-b ${d('divide-gray-100 border-gray-100', 'divide-gray-700 border-gray-700')}`}>
          {[
            { label: 'Mano de Obra', value: s.totalTabulador, color: 'text-amber-600'   },
            { label: 'Materiales',   value: s.totalLineas,    color: 'text-blue-600'    },
            { label: 'Subtotal',     value: s.subtotal,       color: d('text-slate-800', 'text-gray-100') },
            { label: 'Utilidad',     value: s.utilidad,       color: 'text-emerald-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="px-4 py-3 flex flex-col gap-0.5">
              <span className={`text-[10px] font-black uppercase tracking-wider ${d('text-slate-400', 'text-gray-500')}`}>{label}</span>
              <span className={`text-sm font-black ${color}`}>{fmt(value)}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <span className={`text-sm font-black uppercase tracking-wide ${d('text-slate-500', 'text-gray-400')}`}>Total Servicio</span>
          <span className="text-3xl font-black text-emerald-600">{fmt(s.total)}</span>
        </div>
      </div>

      {/* ── BOTONES ── */}
      <div className="flex flex-col xs:flex-row justify-end gap-3">
        <button
          onClick={s.generatePDF}
          disabled={!s.projectName}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-soft transition-all bg-emerald-500 hover:bg-emerald-600 text-white hover:-translate-y-0.5 disabled:opacity-40"
        >
          <Download size={16} /> Descargar PDF
        </button>
        <button
          onClick={s.saveCotizacion}
          disabled={s.saving || !s.projectName}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-soft transition-all disabled:opacity-40 ${s.saved ? 'bg-emerald-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white hover:-translate-y-0.5'}`}
        >
          {s.saved ? <><Check size={16} /> Guardado</> : s.saving ? 'Guardando...' : <><Save size={16} /> Guardar Cotización</>}
        </button>
      </div>

    </div>
  );
};
