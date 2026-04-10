import React from 'react';
import {
  Calculator, Plus, Trash2, FileText, Save,
  Package, DollarSign, Settings, X, Pencil, Check,
} from 'lucide-react';
import { useQuoterView, fmt } from '../hooks/useQuoterView';
import type { QuoterProps } from '../types/quoter.d';

export const QuoterView: React.FC<QuoterProps> = ({ currentUser, darkMode = false }) => {
  const q = useQuoterView(currentUser);
  const d = (light: string, dark: string) => darkMode ? dark : light;

  // ── Clases reutilizables ─────────────────────────────────────────────────────
  const cardCls = `rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-soft border ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`;
  const inputCls = `w-full border px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-nova-blue/20 outline-none text-sm transition-all ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-700 border-gray-600 text-gray-100')}`;
  const modalInputCls = `w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400/20 ${d('border-gray-200 text-gray-800', 'border-gray-600 text-gray-100 bg-gray-700')}`;
  const btnGestionar = 'flex items-center gap-1.5 text-xs font-bold text-white bg-blue-400 hover:bg-blue-500 active:bg-blue-600 px-3 py-1.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-blue-400/30 hover:-translate-y-0.5';
  const labelCls = `text-xs font-bold mb-1.5 block ${d('text-nova-slate', 'text-gray-400')}`;
  const dividerCls = `divide-y ${d('divide-gray-50', 'divide-gray-700')}`;
  const modalCls = `rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] ${d('bg-white', 'bg-gray-900')}`;
  const modalHeaderCls = `flex items-center justify-between px-6 py-4 border-b ${d('border-gray-100', 'border-gray-700')}`;
  const modalFormCls = `px-6 py-4 border-b ${d('border-gray-100 bg-gray-50/50', 'border-gray-700 bg-gray-800/50')}`;
  const modalTitleCls = `font-black text-lg flex items-center gap-2 ${d('text-slate-800', 'text-white')}`;
  const subtotalBarCls = `p-4 border-t flex justify-end items-center gap-4 ${d('bg-nova-bg border-gray-100', 'bg-gray-900/50 border-gray-700')}`;

  // ── Subcomponentes de UI locales ─────────────────────────────────────────────
  const SectionHeader = ({
    icon: Icon, title, count, color,
  }: { icon: React.ElementType; title: string; count: number; color: string }) => (
    <div className={`flex justify-between items-center p-4 md:p-5 border-b ${d('border-gray-50', 'border-gray-700')}`}>
      <h2 className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${d('text-slate-800', 'text-gray-200')}`}>
        <Icon size={14} className={color} />
        {title}
        <span className={`px-2 py-0.5 rounded-full ml-1 ${d('bg-nova-bg text-nova-blue', 'bg-gray-700 text-blue-400')}`}>{count}</span>
      </h2>
    </div>
  );

  const MobileCard = ({ children }: { children: React.ReactNode }) => (
    <div className={`p-4 border-b last:border-0 ${d('border-gray-50', 'border-gray-700')}`}>{children}</div>
  );

  return (
    <>
      <div className="flex flex-col gap-4 md:gap-6 fade-in pb-24 px-2 sm:px-0">

        {/* ── ENCABEZADO ── */}
        <div>
          <div className="flex items-center gap-3">
            <Calculator className="text-nova-blue flex-shrink-0" size={28} />
            <h1 className={`text-2xl md:text-3xl font-black tracking-tight leading-tight ${d('text-slate-800', 'text-white')}`}>
              Cotizador de Proyectos
            </h1>
          </div>
          <p className={`font-medium mt-1 text-sm ${d('text-slate-400', 'text-gray-400')}`}>
            Selecciona equipos, tarifas, indirectos y mano de obra.
          </p>
        </div>

        {/* ── DATOS DE LA COTIZACIÓN ── */}
        <div className={cardCls}>
          <h2 className={`text-xs font-black uppercase tracking-wider mb-4 ${d('text-slate-400', 'text-gray-500')}`}>
            Datos de la Cotización
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {([
              { label: 'Nombre del Cliente', value: q.clientName,    set: q.setClientName,    placeholder: 'Ej. Juan Pérez' },
              { label: 'Empresa',            value: q.clientCompany, set: q.setClientCompany, placeholder: 'Ej. Industrias Acme' },
              { label: 'Correo',             value: q.clientEmail,   set: q.setClientEmail,   placeholder: 'correo@empresa.com' },
            ] as const).map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label className={labelCls}>{label}</label>
                <input value={value} onChange={e => set(e.target.value)} placeholder={placeholder} type="text" className={inputCls} />
              </div>
            ))}
            <div className="col-span-1 sm:col-span-2">
              <label className={labelCls}>Nombre del Proyecto</label>
              <input value={q.projectName} onChange={e => q.setProjectName(e.target.value)} placeholder="Ej. Planta de tratamiento Norte" type="text" className={inputCls} />
            </div>
            <div className="col-span-1">
              <label className={labelCls}>Notas / Condiciones</label>
              <input value={q.quoteNotes} onChange={e => q.setQuoteNotes(e.target.value)} placeholder="Ej. IVA no incluido, vigencia 30 días" type="text" className={inputCls} />
            </div>
          </div>
        </div>

        {/* ── AGREGAR EQUIPO ── */}
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${d('text-slate-400', 'text-gray-500')}`}>
              <Package size={13} className="text-nova-blue" /> Agregar Equipo
            </h2>
            <button
              onClick={() => { q.setEditingEquipo(null); q.setEquipoForm({ nombre_equipo: '', tag: '', tipo: '', flujo_referencia: '', unidad: '', costo: '', factor_n: '' }); q.setShowEquipoModal(true); }}
              className={btnGestionar}
            >
              <Settings size={13} /> Gestionar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div className="col-span-1 sm:col-span-2">
              <label className={labelCls}>Equipo (Catálogo)</label>
              <select value={q.selEquipoId ?? ''} onChange={e => q.setSelEquipoId(Number(e.target.value))} className={`w-full border px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-nova-blue/20 outline-none text-sm font-medium ${d('bg-nova-bg/50 border-gray-100', 'bg-gray-700 border-gray-600 text-gray-100')}`}>
                {q.catEquipos.length === 0 && <option>Cargando...</option>}
                {q.catEquipos.map(eq => (
                  <option key={eq.id_equipo} value={eq.id_equipo}>
                    {eq.tag} — {eq.nombre_equipo} ({eq.flujo_referencia} {eq.unidad})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Costo Ref.</label>
              <input type="text" value={q.selEquipo ? fmt(Number(q.selEquipo.costo)) : '—'} disabled className={`w-full border px-3 py-2.5 rounded-xl text-sm font-medium ${d('bg-gray-50 border-gray-100 text-gray-500', 'bg-gray-700/50 border-gray-700 text-gray-400')}`} />
            </div>
            <div>
              <label className={labelCls}>Factor (N)</label>
              <input type="text" value={q.selEquipo ? q.selEquipo.factor_n : '—'} disabled className={`w-full border px-3 py-2.5 rounded-xl text-sm font-medium ${d('bg-gray-50 border-gray-100 text-gray-500', 'bg-gray-700/50 border-gray-700 text-gray-400')}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Flujo</label>
              <input type="number" value={q.flow} onChange={e => q.setFlow(e.target.value)} placeholder="GPM" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Cantidad</label>
              <input type="number" value={q.equipQty} min={1} onChange={e => q.setEquipQty(+e.target.value)} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Notas (Opcional)</label>
              <div className="flex gap-2">
                <input type="text" value={q.equipNotes} onChange={e => q.setEquipNotes(e.target.value)} placeholder="Ej. Incluir variador" className={`flex-1 min-w-0 border px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-nova-blue/20 outline-none text-sm ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-700 border-gray-600 text-gray-100')}`} />
                <button onClick={q.handleAddEquipo} className="bg-emerald-600 text-white px-3 py-2.5 rounded-xl font-bold hover:-translate-y-0.5 transition-transform flex items-center gap-1.5 flex-shrink-0 text-sm">
                  <Plus size={16} /><span className="hidden xs:inline">Agregar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── AGREGAR TARIFA ── */}
        {q.catTarifas.length > 0 && (
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${d('text-slate-400', 'text-gray-500')}`}>
                <DollarSign size={13} className="text-emerald-500" /> Agregar Tarifa
              </h2>
              <button onClick={() => q.setShowTarifaModal(true)} className={btnGestionar}>
                <Settings size={13} /> Gestionar
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="col-span-1 sm:col-span-2">
                <label className={labelCls}>Tarifa</label>
                <select value={q.selTarifaId ?? ''} onChange={e => q.setSelTarifaId(Number(e.target.value))} className={`w-full border px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-nova-blue/20 outline-none text-sm font-medium ${d('bg-nova-bg/50 border-gray-100', 'bg-gray-700 border-gray-600 text-gray-100')}`}>
                  {q.catTarifas.map(t => (
                    <option key={t.id_tarifa} value={t.id_tarifa}>
                      {t.nombre_tarifa} — {fmt(Number(t.costo))}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Cantidad</label>
                <div className="flex gap-2">
                  <input type="number" value={q.tarifaQty} min={1} onChange={e => q.setTarifaQty(+e.target.value)} className={`flex-1 min-w-0 border px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-nova-blue/20 outline-none text-sm ${d('bg-white border-gray-200', 'bg-gray-700 border-gray-600 text-gray-100')}`} />
                  <button onClick={q.handleAddTarifa} className="bg-emerald-500 text-white px-3 py-2.5 rounded-xl font-bold hover:-translate-y-0.5 transition-transform flex items-center gap-1.5 flex-shrink-0 text-sm">
                    <Plus size={16} /><span className="hidden xs:inline">Agregar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PARTIDAS DE EQUIPOS ── */}
        <div className={`rounded-2xl md:rounded-[2rem] shadow-soft border overflow-hidden ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`}>
          <SectionHeader icon={Package} title="Partidas de Equipos" count={q.equipItems.length} color="text-nova-blue" />
          {q.equipItems.length === 0 ? (
            <div className={`p-8 flex flex-col items-center ${d('text-gray-400', 'text-gray-500')}`}>
              <Calculator size={28} className="mb-2 opacity-40" />
              <p className="text-sm font-medium">Agrega equipos desde el panel superior</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className={`hidden md:block ${dividerCls}`}>
                {q.equipItems.map((eq, i) => (
                  <div key={eq.id} className="flex items-center gap-3 p-4 text-sm">
                    <span className={`font-bold w-5 flex-shrink-0 ${d('text-gray-400', 'text-gray-500')}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate ${d('text-gray-800', 'text-gray-100')}`}>{eq.name}</p>
                      {eq.notes && <p className={`text-xs truncate ${d('text-gray-400', 'text-gray-500')}`}>{eq.notes}</p>}
                    </div>
                    <span className={`flex-shrink-0 ${d('text-gray-500', 'text-gray-400')}`}>{eq.flow} GPM</span>
                    <span className={`flex-shrink-0 ${d('text-gray-500', 'text-gray-400')}`}>x{eq.qty}</span>
                    <span className={`flex-shrink-0 ${d('text-gray-700', 'text-gray-300')}`}>{fmt(eq.unitCost)}</span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`font-black ${d('text-slate-800', 'text-gray-100')}`}>{fmt(eq.total)}</span>
                      <button onClick={() => q.setEquipItems(prev => prev.filter(e => e.id !== eq.id))} className="text-red-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Mobile */}
              <div className={`block md:hidden ${dividerCls}`}>
                {q.equipItems.map(eq => (
                  <MobileCard key={eq.id}>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className={`text-sm font-bold leading-snug flex-1 min-w-0 line-clamp-2 ${d('text-gray-800', 'text-gray-100')}`}>{eq.name}</p>
                      <button onClick={() => q.setEquipItems(prev => prev.filter(e => e.id !== eq.id))} className="text-red-400 flex-shrink-0 mt-0.5"><Trash2 size={15} /></button>
                    </div>
                    {eq.notes && <p className={`text-xs mb-1 ${d('text-gray-400', 'text-gray-500')}`}>{eq.notes}</p>}
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className={d('text-gray-400', 'text-gray-500')}>Flujo: <b className={d('text-gray-600', 'text-gray-300')}>{eq.flow} GPM</b> · x{eq.qty}</span>
                      <span className={`font-black ${d('text-slate-800', 'text-gray-100')}`}>{fmt(eq.total)}</span>
                    </div>
                  </MobileCard>
                ))}
              </div>
              <div className={subtotalBarCls}>
                <span className={`text-xs font-bold uppercase ${d('text-slate-500', 'text-gray-400')}`}>Subtotal Equipos</span>
                <span className="text-xl font-black text-nova-blue">{fmt(q.totalEquipos)}</span>
              </div>
            </>
          )}
        </div>

        {/* ── TARIFAS ── */}
        {q.tarifaItems.length > 0 && (
          <div className={`rounded-2xl md:rounded-[2rem] shadow-soft border overflow-hidden ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`}>
            <SectionHeader icon={DollarSign} title="Tarifas" count={q.tarifaItems.length} color="text-emerald-500" />
            {/* Desktop */}
            <div className={`hidden md:block ${dividerCls}`}>
              {q.tarifaItems.map(t => (
                <div key={t.id} className="flex items-center gap-4 p-4 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${d('text-gray-800', 'text-gray-100')}`}>{t.nombre}</p>
                    {t.tipo && <p className={`text-xs ${d('text-gray-400', 'text-gray-500')}`}>{t.tipo}</p>}
                  </div>
                  <span className={`flex-shrink-0 ${d('text-gray-500', 'text-gray-400')}`}>x{t.cantidad}</span>
                  <span className={`font-black flex-shrink-0 ${d('text-slate-800', 'text-gray-100')}`}>{fmt(t.total)}</span>
                  <button onClick={() => q.setTarifaItems(prev => prev.filter(x => x.id !== t.id))} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            {/* Mobile */}
            <div className={`block md:hidden ${dividerCls}`}>
              {q.tarifaItems.map(t => (
                <MobileCard key={t.id}>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${d('text-gray-800', 'text-gray-100')}`}>{t.nombre}</p>
                      {t.tipo && <p className={`text-xs ${d('text-gray-400', 'text-gray-500')}`}>{t.tipo}</p>}
                    </div>
                    <button onClick={() => q.setTarifaItems(prev => prev.filter(x => x.id !== t.id))} className="text-red-400 flex-shrink-0"><Trash2 size={15} /></button>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={d('text-gray-400', 'text-gray-500')}>Cantidad: <b className={d('text-gray-600', 'text-gray-300')}>x{t.cantidad}</b></span>
                    <span className={`font-black ${d('text-slate-800', 'text-gray-100')}`}>{fmt(t.total)}</span>
                  </div>
                </MobileCard>
              ))}
            </div>
            <div className={subtotalBarCls}>
              <span className={`text-xs font-bold uppercase ${d('text-slate-500', 'text-gray-400')}`}>Subtotal Tarifas</span>
              <span className="text-xl font-black text-emerald-600">{fmt(q.totalTarifas)}</span>
            </div>
          </div>
        )}

        {/* ── COSTOS INDIRECTOS ── */}
        <div className={`rounded-2xl md:rounded-[2rem] shadow-soft border overflow-hidden ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`}>
          <div className={`flex justify-between items-center p-4 md:p-5 border-b ${d('border-gray-50 bg-gray-50/30', 'border-gray-700 bg-gray-900/30')}`}>
            <h2 className={`text-xs font-black uppercase tracking-wider ${d('text-slate-800', 'text-gray-200')}`}>Costos Indirectos</h2>
            <button onClick={() => q.setShowIndirectoModal(true)} className={btnGestionar}>
              <Settings size={13} /> Gestionar
            </button>
          </div>
          {q.indirectoItems.length === 0 ? (
            <p className={`text-center text-sm py-6 ${d('text-gray-400', 'text-gray-500')}`}>Sin costos indirectos en el catálogo</p>
          ) : (
            <>
              {/* Desktop */}
              <div className={`hidden md:block ${dividerCls}`}>
                <div className={`flex items-center gap-3 px-4 py-2 border-b text-[10px] font-black uppercase tracking-wider ${d('bg-gray-50/60 border-gray-100 text-gray-400', 'bg-gray-900/40 border-gray-700 text-gray-500')}`}>
                  <span className="w-6 flex-shrink-0 text-center">#</span>
                  <span className="flex-1 min-w-0">Concepto</span>
                  <span className="w-16 flex-shrink-0 text-center">Cantidad</span>
                  <span className="w-14 flex-shrink-0 text-center">Tipo</span>
                  <span className="w-28 flex-shrink-0 text-right">% o Monto</span>
                  <span className="min-w-[5rem] flex-shrink-0 text-right">Subtotal</span>
                </div>
                {q.computedInds.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-3 p-4 text-sm">
                    <span className={`w-6 flex-shrink-0 text-center text-xs font-bold ${d('text-gray-400', 'text-gray-500')}`}>{idx + 1}</span>
                    <span className={`font-bold flex-1 min-w-0 truncate ${d('text-gray-800', 'text-gray-100')}`}>{item.concepto}</span>
                    <input type="number" value={item.qty} min={1} onChange={e => q.updateIndirecto(item.id, 'qty', +e.target.value)} className={`w-16 flex-shrink-0 border rounded-lg px-2 py-1 text-center outline-none ${d('border-gray-200 focus:border-nova-blue', 'border-gray-600 bg-gray-700 text-gray-100 focus:border-nova-blue')}`} />
                    <span className={`font-medium w-14 text-center flex-shrink-0 ${d('text-gray-500', 'text-gray-400')}`}>{item.tipo === 'Porcentaje' ? '% Eq.' : 'Fijo'}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <input type="number" step={0.10} value={item.val} onChange={e => q.updateIndirecto(item.id, 'val', +e.target.value)} className={`w-24 border rounded-lg px-3 py-1 text-right outline-none font-medium ${d('border-gray-200 focus:border-nova-blue', 'border-gray-600 bg-gray-700 text-gray-100 focus:border-nova-blue')}`} />
                      <span className={`text-xs w-3 ${d('text-gray-400', 'text-gray-500')}`}>{item.tipo === 'Porcentaje' ? '%' : ''}</span>
                    </div>
                    <span className={`font-black text-right flex-shrink-0 min-w-[5rem] ${d('text-slate-800', 'text-gray-100')}`}>{fmt(item.total)}</span>
                  </div>
                ))}
              </div>
              {/* Mobile */}
              <div className={`block md:hidden ${dividerCls}`}>
                {q.computedInds.map(item => (
                  <MobileCard key={item.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-bold flex-1 min-w-0 pr-2 line-clamp-2 ${d('text-gray-800', 'text-gray-100')}`}>{item.concepto}</span>
                      <span className={`font-black flex-shrink-0 ${d('text-slate-800', 'text-gray-100')}`}>{fmt(item.total)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className={`text-[10px] font-bold uppercase block mb-1 ${d('text-gray-400', 'text-gray-500')}`}>Cant.</label>
                        <input type="number" value={item.qty} min={1} onChange={e => q.updateIndirecto(item.id, 'qty', +e.target.value)} className={`w-full border rounded-lg px-2 py-1.5 text-center text-sm outline-none ${d('border-gray-200', 'border-gray-600 bg-gray-700 text-gray-100')}`} />
                      </div>
                      <div>
                        <label className={`text-[10px] font-bold uppercase block mb-1 ${d('text-gray-400', 'text-gray-500')}`}>Tipo</label>
                        <div className={`border rounded-lg px-2 py-1.5 text-xs text-center ${d('border-gray-100 bg-gray-50 text-gray-500', 'border-gray-700 bg-gray-700 text-gray-400')}`}>{item.tipo === 'Porcentaje' ? '% Eq.' : 'Fijo'}</div>
                      </div>
                      <div>
                        <label className={`text-[10px] font-bold uppercase block mb-1 ${d('text-gray-400', 'text-gray-500')}`}>Valor {item.tipo === 'Porcentaje' ? '(%)' : ''}</label>
                        <input type="number" step={0.10} value={item.val} onChange={e => q.updateIndirecto(item.id, 'val', +e.target.value)} className={`w-full border rounded-lg px-2 py-1.5 text-right text-sm outline-none ${d('border-gray-200', 'border-gray-600 bg-gray-700 text-gray-100')}`} />
                      </div>
                    </div>
                  </MobileCard>
                ))}
              </div>
              <div className={subtotalBarCls}>
                <span className={`text-xs font-bold uppercase ${d('text-slate-500', 'text-gray-400')}`}>Total Indirectos</span>
                <span className="text-xl font-black text-nova-blue">{fmt(q.totalIndirectos)}</span>
              </div>
            </>
          )}
        </div>

        {/* ── GRAN TOTAL + BOTONES ── */}
        <div className={cardCls}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className={`text-xs font-black uppercase tracking-wider ${d('text-slate-400', 'text-gray-500')}`}>Total del Proyecto</p>
              <p className="text-3xl md:text-4xl font-black text-nova-blue mt-1">{fmt(q.grandTotal)}</p>
              <p className={`text-xs mt-0.5 ${d('text-gray-400', 'text-gray-500')}`}>Equipos + Tarifas + Indirectos</p>
            </div>
            <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={q.saveCotizacion}
                disabled={q.saving || q.saved}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all text-sm flex-1 sm:flex-none ${q.saved ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : d('bg-slate-100 text-slate-700 hover:bg-slate-200', 'bg-gray-700 text-gray-200 hover:bg-gray-600')}`}
              >
                {q.saved ? <><Check size={18} /> Guardado</> : <><Save size={18} /> {q.saving ? 'Guardando...' : 'Guardar'}</>}
              </button>
              <button onClick={q.generatePDF} className="flex items-center justify-center gap-2.5 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm flex-1 sm:flex-none">
                <FileText size={20} /> Generar PDF
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── MODAL: EQUIPOS ── */}
      {q.showEquipoModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className={modalCls}>
            <div className={modalHeaderCls}>
              <h2 className={modalTitleCls}><Package size={18} className="text-blue-400" /> Gestión de Equipos</h2>
              <button onClick={() => { q.setShowEquipoModal(false); q.setEditingEquipo(null); }} className={`p-2 rounded-xl transition-colors ${d('hover:bg-gray-100 text-gray-400', 'hover:bg-gray-800 text-gray-500')}`}><X size={20} /></button>
            </div>
            <div className={modalFormCls}>
              <p className={`text-xs font-black uppercase tracking-wider mb-3 ${d('text-slate-400', 'text-gray-500')}`}>
                {q.editingEquipo ? `Editando: ${q.editingEquipo.nombre_equipo}` : 'Nuevo Equipo'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="col-span-2 sm:col-span-2">
                  <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Nombre del Equipo</label>
                  <input value={q.equipoForm.nombre_equipo} onChange={e => q.setEquipoForm(f => ({ ...f, nombre_equipo: e.target.value }))} placeholder="Ej. Bomba centrífuga" className={modalInputCls} />
                </div>
                <div>
                  <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>TAG</label>
                  <input value={q.equipoForm.tag} onChange={e => q.setEquipoForm(f => ({ ...f, tag: e.target.value }))} placeholder="Ej. FZ1000" className={modalInputCls} />
                </div>
                <div>
                  <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Tipo</label>
                  <input value={q.equipoForm.tipo} onChange={e => q.setEquipoForm(f => ({ ...f, tipo: e.target.value }))} placeholder="Ej. Bomba" className={modalInputCls} />
                </div>
                <div>
                  <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Flujo Ref.</label>
                  <input type="number" min={0} value={q.equipoForm.flujo_referencia} onChange={e => q.setEquipoForm(f => ({ ...f, flujo_referencia: e.target.value }))} placeholder="0" className={modalInputCls} />
                </div>
                <div>
                  <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Unidad</label>
                  <input value={q.equipoForm.unidad} onChange={e => q.setEquipoForm(f => ({ ...f, unidad: e.target.value }))} placeholder="Ej. GPM" className={modalInputCls} />
                </div>
                <div>
                  <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Costo Ref. (MXN)</label>
                  <input type="number" min={0} value={q.equipoForm.costo} onChange={e => q.setEquipoForm(f => ({ ...f, costo: e.target.value }))} placeholder="0.00" className={`${modalInputCls} text-right`} />
                </div>
                <div>
                  <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Factor N</label>
                  <input type="number" min={0} step={0.01} value={q.equipoForm.factor_n} onChange={e => q.setEquipoForm(f => ({ ...f, factor_n: e.target.value }))} placeholder="0.00" className={modalInputCls} />
                </div>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                {q.editingEquipo && (
                  <button onClick={() => { q.setEditingEquipo(null); q.setEquipoForm({ nombre_equipo: '', tag: '', tipo: '', flujo_referencia: '', unidad: '', costo: '', factor_n: '' }); }} className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors hover:text-red-500 hover:border-red-200 ${d('text-slate-500 border-gray-200', 'text-gray-400 border-gray-600')}`}>
                    Cancelar edición
                  </button>
                )}
                <button onClick={q.saveEquipo} disabled={q.equipoSaving || !q.equipoForm.nombre_equipo} className="flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-40">
                  <Save size={13} /> {q.equipoSaving ? 'Guardando...' : q.editingEquipo ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </div>
            <div className={`flex-1 overflow-y-auto px-2 divide-y ${d('divide-gray-50', 'divide-gray-700')}`}>
              {q.catEquipos.length === 0 ? (
                <p className={`text-center text-sm py-8 ${d('text-gray-400', 'text-gray-500')}`}>Sin equipos en el catálogo</p>
              ) : q.catEquipos.map(eq => (
                <div key={eq.id_equipo} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${d('text-gray-800', 'text-gray-100')}`}>{eq.tag ? `${eq.tag} — ` : ''}{eq.nombre_equipo}</p>
                    <p className={`text-xs ${d('text-gray-400', 'text-gray-500')}`}>{eq.tipo ?? ''}{eq.flujo_referencia ? ` · ${eq.flujo_referencia} ${eq.unidad ?? ''}` : ''} · Factor: {eq.factor_n}</p>
                  </div>
                  <span className="text-sm font-black text-blue-500 flex-shrink-0">{fmt(Number(eq.costo))}</span>
                  <button onClick={() => q.openEditEquipo(eq)} className={`p-2 rounded-xl transition-colors flex-shrink-0 ${d('text-gray-400 hover:bg-blue-50 hover:text-blue-500', 'text-gray-500 hover:bg-blue-900/30 hover:text-blue-400')}`}><Pencil size={14} /></button>
                  <button onClick={() => q.deleteEquipo(eq.id_equipo)} className={`p-2 rounded-xl transition-colors flex-shrink-0 ${d('text-gray-400 hover:bg-red-50 hover:text-red-500', 'text-gray-500 hover:bg-red-900/30 hover:text-red-400')}`}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: INDIRECTOS ── */}
      {q.showIndirectoModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className={modalCls}>
            <div className={modalHeaderCls}>
              <h2 className={modalTitleCls}><Settings size={18} className="text-nova-blue" /> Gestión de Costos Indirectos</h2>
              <button onClick={() => { q.setShowIndirectoModal(false); q.setEditingIndirecto(null); }} className={`p-2 rounded-xl transition-colors ${d('hover:bg-gray-100 text-gray-400', 'hover:bg-gray-800 text-gray-500')}`}><X size={20} /></button>
            </div>
            <div className={modalFormCls}>
              <p className={`text-xs font-black uppercase tracking-wider mb-3 ${d('text-slate-400', 'text-gray-500')}`}>
                {q.editingIndirecto ? `Editando: ${q.editingIndirecto.concepto}` : 'Nuevo Costo Indirecto'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Concepto</label>
                  <input value={q.indirectoForm.concepto} onChange={e => q.setIndirectoForm(f => ({ ...f, concepto: e.target.value }))} placeholder="Ej. Ingeniería, Flete..." className={`w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-nova-blue/20 ${d('border-gray-200', 'border-gray-600 bg-gray-700 text-gray-100')}`} />
                </div>
                <div>
                  <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Tipo</label>
                  <select value={q.indirectoForm.tipo} onChange={e => q.setIndirectoForm(f => ({ ...f, tipo: e.target.value as 'Porcentaje' | 'Monto Fijo' }))} className={`w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-nova-blue/20 ${d('border-gray-200 bg-white', 'border-gray-600 bg-gray-700 text-gray-100')}`}>
                    <option value="Porcentaje">Porcentaje</option>
                    <option value="Monto Fijo">Monto Fijo</option>
                  </select>
                </div>
                <div>
                  <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Cantidad</label>
                  <input type="number" min={1} value={q.indirectoForm.cantidad} onChange={e => q.setIndirectoForm(f => ({ ...f, cantidad: e.target.value }))} className={`w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-nova-blue/20 ${d('border-gray-200', 'border-gray-600 bg-gray-700 text-gray-100')}`} />
                </div>
                {q.indirectoForm.tipo === 'Porcentaje' ? (
                  <div>
                    <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Factor / Porcentaje default</label>
                    <input type="number" step={0.1} min={0} value={q.indirectoForm.porcentaje_default} onChange={e => q.setIndirectoForm(f => ({ ...f, porcentaje_default: e.target.value }))} placeholder="Ej. 1.00" className={`w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-nova-blue/20 ${d('border-gray-200', 'border-gray-600 bg-gray-700 text-gray-100')}`} />
                  </div>
                ) : (
                  <div>
                    <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Monto Fijo (MXN)</label>
                    <input type="number" min={0} value={q.indirectoForm.monto_fijo} onChange={e => q.setIndirectoForm(f => ({ ...f, monto_fijo: e.target.value }))} placeholder="0.00" className={`w-full border rounded-xl px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-nova-blue/20 ${d('border-gray-200', 'border-gray-600 bg-gray-700 text-gray-100')}`} />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                {q.editingIndirecto && (
                  <button onClick={() => { q.setEditingIndirecto(null); q.setIndirectoForm({ concepto: '', tipo: 'Porcentaje', porcentaje_default: '', monto_fijo: '', cantidad: '1' }); }} className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors hover:text-red-500 hover:border-red-200 ${d('text-slate-500 border-gray-200', 'text-gray-400 border-gray-600')}`}>
                    Cancelar edición
                  </button>
                )}
                <button onClick={q.saveIndirecto} disabled={q.indirectoSaving || !q.indirectoForm.concepto} className="flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-40">
                  <Save size={13} /> {q.indirectoSaving ? 'Guardando...' : q.editingIndirecto ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </div>
            <div className={`flex-1 overflow-y-auto px-2 divide-y ${d('divide-gray-50', 'divide-gray-700')}`}>
              {q.indirectoItems.length === 0 ? (
                <p className={`text-center text-sm py-8 ${d('text-gray-400', 'text-gray-500')}`}>Sin costos indirectos en el catálogo</p>
              ) : q.indirectoItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`text-xs font-bold w-5 flex-shrink-0 ${d('text-gray-300', 'text-gray-600')}`}>{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${d('text-gray-800', 'text-gray-100')}`}>{item.concepto}</p>
                    <p className={`text-xs ${d('text-gray-400', 'text-gray-500')}`}>{item.tipo === 'Porcentaje' ? `Factor: ${item.val}` : fmt(item.monto_fijo)}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${item.tipo === 'Porcentaje' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {item.tipo === 'Porcentaje' ? '% Eq.' : 'Fijo'}
                  </span>
                  <button
                    onClick={() => {
                      const orig = { id_indirecto: item.id_indirecto, concepto: item.concepto, tipo: item.tipo, porcentaje_default: item.tipo === 'Porcentaje' ? item.val : 0, monto_fijo: item.monto_fijo, cantidad: item.qty } as any;
                      q.openEditIndirecto(orig);
                    }}
                    className={`p-2 rounded-xl transition-colors flex-shrink-0 ${d('text-gray-400 hover:bg-blue-50 hover:text-nova-blue', 'text-gray-500 hover:bg-blue-900/30 hover:text-blue-400')}`}
                  ><Pencil size={14} /></button>
                  <button onClick={() => q.deleteIndirecto(item.id_indirecto)} className={`p-2 rounded-xl transition-colors flex-shrink-0 ${d('text-gray-400 hover:bg-red-50 hover:text-red-500', 'text-gray-500 hover:bg-red-900/30 hover:text-red-400')}`}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: TARIFAS ── */}
      {q.showTarifaModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className={modalCls}>
            <div className={modalHeaderCls}>
              <h2 className={modalTitleCls}><Settings size={18} className="text-nova-blue" /> Gestión de Tarifas</h2>
              <button onClick={() => { q.setShowTarifaModal(false); q.setEditingTarifa(null); }} className={`p-2 rounded-xl transition-colors ${d('hover:bg-gray-100 text-gray-400', 'hover:bg-gray-800 text-gray-500')}`}><X size={20} /></button>
            </div>
            <div className={modalFormCls}>
              <p className={`text-xs font-black uppercase tracking-wider mb-3 ${d('text-slate-400', 'text-gray-500')}`}>
                {q.editingTarifa ? `Editando: ${q.editingTarifa.nombre_tarifa}` : 'Nueva Tarifa'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Nombre</label>
                  <input value={q.tarifaForm.nombre_tarifa} onChange={e => q.setTarifaForm(f => ({ ...f, nombre_tarifa: e.target.value }))} placeholder="Ej. Tarifa instalación" className={modalInputCls} />
                </div>
                <div>
                  <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Tipo</label>
                  <input value={q.tarifaForm.tipo_tarifa} onChange={e => q.setTarifaForm(f => ({ ...f, tipo_tarifa: e.target.value }))} placeholder="Ej. Mensual, Por hora" className={modalInputCls} />
                </div>
                <div>
                  <label className={`text-xs font-bold mb-1 block ${d('text-slate-500', 'text-gray-400')}`}>Costo (MXN)</label>
                  <input type="number" min={0} value={q.tarifaForm.costo} onChange={e => q.setTarifaForm(f => ({ ...f, costo: e.target.value }))} placeholder="0.00" className={`${modalInputCls} text-right`} />
                </div>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                {q.editingTarifa && (
                  <button onClick={() => { q.setEditingTarifa(null); q.setTarifaForm({ nombre_tarifa: '', tipo_tarifa: '', costo: '' }); }} className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors hover:text-red-500 hover:border-red-200 ${d('text-slate-500 border-gray-200', 'text-gray-400 border-gray-600')}`}>
                    Cancelar edición
                  </button>
                )}
                <button onClick={q.saveTarifa} disabled={q.tarifaSaving || !q.tarifaForm.nombre_tarifa || !q.tarifaForm.costo} className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-40">
                  <Save size={13} /> {q.tarifaSaving ? 'Guardando...' : q.editingTarifa ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </div>
            <div className={`flex-1 overflow-y-auto px-2 divide-y ${d('divide-gray-50', 'divide-gray-700')}`}>
              {q.catTarifas.length === 0 ? (
                <p className={`text-center text-sm py-8 ${d('text-gray-400', 'text-gray-500')}`}>Sin tarifas en el catálogo</p>
              ) : q.catTarifas.map(t => (
                <div key={t.id_tarifa} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${d('text-gray-800', 'text-gray-100')}`}>{t.nombre_tarifa}</p>
                    {t.tipo_tarifa && <p className={`text-xs ${d('text-gray-400', 'text-gray-500')}`}>{t.tipo_tarifa}</p>}
                  </div>
                  <span className="text-sm font-black text-nova-blue flex-shrink-0">{fmt(Number(t.costo))}</span>
                  <button onClick={() => q.openEditTarifa(t)} className={`p-2 rounded-xl transition-colors flex-shrink-0 ${d('text-gray-400 hover:bg-blue-50 hover:text-nova-blue', 'text-gray-500 hover:bg-blue-900/30 hover:text-blue-400')}`}><Pencil size={14} /></button>
                  <button onClick={() => q.deleteTarifa(t.id_tarifa)} className={`p-2 rounded-xl transition-colors flex-shrink-0 ${d('text-gray-400 hover:bg-red-50 hover:text-red-500', 'text-gray-500 hover:bg-red-900/30 hover:text-red-400')}`}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
