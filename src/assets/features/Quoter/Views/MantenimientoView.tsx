import React from 'react';
import { HardHat, Plus, Trash2 } from 'lucide-react';
import { useMantenimiento } from '../hooks/useMantenimiento';
import { fmt } from '../hooks/useQuoterView';
import type { MantenimientoProps } from '../types/quoter.d';

// ── Constantes de catálogo estático ──────────────────────────────────────────
const TIPOS_POLIZA = [
  'A) Póliza por Visitas + HH',
  'B) Póliza con Personal Dedicado',
] as const;

const FRECUENCIAS = [
  { label: '1 visita/mes (1/mes)',          value: 1  },
  { label: '1 visita/quincena (2/mes)',      value: 2  },
  { label: '1 visita/semana (4/mes)',        value: 4  },
  { label: '2 visitas/semana (8/mes)',       value: 8  },
  { label: '3 visitas/semana (12/mes)',      value: 12 },
];

const CATEGORIAS_ACTIVO = [
  'Torre de Enfriamiento',
  'Caldera',
  'Sistema de Osmosis Inversa',
  'Enfriador / Chiller',
  'Equipo de Filtración',
  'Otro',
];

const CLASIFICACIONES = ['Pequeña', 'Mediana', 'Grande'] as const;

const GRUPO_LABELS: Record<string, string> = {
  mo:          'Mano de Obra / Servicio',
  analisis:    'Análisis Físico-Químicos',
  comodato:    'Comodato',
  consumibles: 'Consumibles',
  personal:    'Personal Dedicado',
};

const GRUPO_COLORS: Record<string, string> = {
  mo:          'bg-blue-50 text-blue-700 border-blue-200',
  analisis:    'bg-purple-50 text-purple-700 border-purple-200',
  comodato:    'bg-amber-50 text-amber-700 border-amber-200',
  consumibles: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  personal:    'bg-rose-50 text-rose-700 border-rose-200',
};

// ── Vista principal ───────────────────────────────────────────────────────────
export const MantenimientoView: React.FC<MantenimientoProps> = ({ darkMode = false }) => {
  const m = useMantenimiento();
  const { state, dispatch } = m;
  const d = (light: string, dark: string) => darkMode ? dark : light;

  // Clases reutilizables
  const cardCls    = `rounded-2xl md:rounded-[2rem] shadow-soft border ${d('bg-white border-gray-50', 'bg-gray-800 border-gray-700')}`;
  const inputCls   = `w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400/20 transition-colors ${d('border-gray-200 text-gray-800 bg-white', 'border-gray-600 text-gray-100 bg-gray-700')}`;
  const selectCls  = `w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400/20 transition-colors ${d('border-gray-200 text-gray-800 bg-white', 'border-gray-600 text-gray-100 bg-gray-700')}`;
  const labelCls   = `text-xs font-bold mb-1 block ${d('text-gray-500', 'text-gray-400')}`;
  const sectionTitleCls = `text-xs font-black uppercase tracking-wider flex items-center gap-2 ${d('text-slate-800', 'text-gray-200')}`;
  const thCls      = `text-[10px] font-black uppercase tracking-wider px-3 py-2 ${d('text-gray-400', 'text-gray-500')}`;
  const dividerCls = `divide-y ${d('divide-gray-50', 'divide-gray-700')}`;

  const set = (field: any, value: any) => dispatch({ type: 'SET', field, value });

  return (
    <div className="flex flex-col gap-4 md:gap-6 fade-in pb-24 px-2 sm:px-0">

      {/* ── ENCABEZADO ── */}
      <div>
        <div className="flex items-center gap-3">
          <HardHat className="text-amber-500 flex-shrink-0" size={28} />
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${d('text-slate-800', 'text-white')}`}>
            Cotización de Mantenimiento
          </h1>
        </div>
        <p className={`font-medium mt-1 text-sm ${d('text-slate-400', 'text-gray-400')}`}>
          Póliza de servicio, comodato y consumibles mensuales.
        </p>
      </div>

      {/* ── SECCIÓN 1: DATOS DE LA COTIZACIÓN ── */}
      <div className={`${cardCls} p-4 md:p-6`}>
        <h2 className={`${sectionTitleCls} mb-4`}>
          <HardHat size={13} className="text-amber-500" /> Datos de la Cotización
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className={labelCls}>Folio</label>
            <input value={state.folio} onChange={e => set('folio', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Fecha</label>
            <input type="date" value={state.fecha} onChange={e => set('fecha', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Validez</label>
            <input value={state.validez} onChange={e => set('validez', e.target.value)} placeholder="Ej. 30 Días" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Meses de contrato</label>
            <input type="number" min={1} value={state.mesesContrato} onChange={e => set('mesesContrato', Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Atención a (Cliente)</label>
            <input value={state.atencionA} onChange={e => set('atencionA', e.target.value)} placeholder="Nombre del cliente" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Correo</label>
            <input type="email" value={state.email} onChange={e => set('email', e.target.value)} placeholder="correo@empresa.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Presupuestado por</label>
            <input value={state.presupuestadoPor} onChange={e => set('presupuestadoPor', e.target.value)} placeholder="Nombre del vendedor" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Condiciones de pago</label>
            <input value={state.condicionesPago} onChange={e => set('condicionesPago', e.target.value)} placeholder="Ej. Mensualidad anticipada" className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 2: PASO 1 — TIPO DE PÓLIZA ── */}
      <div className={`${cardCls} p-4 md:p-6`}>
        <h2 className={`${sectionTitleCls} mb-4`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${d('bg-amber-100 text-amber-700', 'bg-amber-900/40 text-amber-400')}`}>1</span>
          Tipo de Póliza y Frecuencia
        </h2>

        {/* Fila base: tipo + frecuencia + planta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Tipo de Póliza</label>
            <select
              value={state.tipoPoliza}
              onChange={e => set('tipoPoliza', e.target.value)}
              className={selectCls}
            >
              {TIPOS_POLIZA.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Frecuencia de visitas</label>
            <select value={state.frecuencia} onChange={e => set('frecuencia', Number(e.target.value))} className={selectCls}>
              {FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Planta / Ubicación</label>
            <input value={state.planta} onChange={e => set('planta', e.target.value)} placeholder="Ej. Planta Norte" className={inputCls} />
          </div>
        </div>

        {/* Campos extra para Personal Dedicado */}
        {state.tipoPoliza === 'B) Póliza con Personal Dedicado' && (
          <div className={`mt-4 pt-4 border-t ${d('border-amber-100', 'border-amber-800/40')}`}>
            <p className={`text-[10px] font-black uppercase tracking-wider mb-3 ${d('text-amber-600', 'text-amber-500')}`}>
              Configuración de Personal Dedicado
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Tipo de técnico */}
              <div>
                <label className={labelCls}>Tipo de técnico</label>
                <select
                  value={state.tipoTecnico}
                  onChange={e => set('tipoTecnico', e.target.value)}
                  className={selectCls}
                >
                  <option value="Sin supervisor en planta">Sin supervisor en planta</option>
                  <option value="Con supervisor en planta">Con supervisor en planta</option>
                </select>
              </div>

              {/* Cantidad de técnicos */}
              <div>
                <label className={labelCls}>Cantidad de técnicos</label>
                <input
                  type="number"
                  min={1}
                  value={state.cantidadTecnicos}
                  onChange={e => set('cantidadTecnicos', Math.max(1, Number(e.target.value)))}
                  className={inputCls}
                />
              </div>

              {/* Supervisor en planta */}
              <div>
                <label className={labelCls}>Supervisor en planta</label>
                <select
                  value={state.supervisorEnPlanta}
                  onChange={e => set('supervisorEnPlanta', e.target.value)}
                  className={selectCls}
                >
                  <option value="No incluir">No incluir</option>
                  <option value="1 supervisor">1 supervisor</option>
                  <option value="2 supervisores">2 supervisores</option>
                </select>
              </div>

              {/* Químico */}
              <div>
                <label className={labelCls}>Químico</label>
                <select
                  value={state.quimico}
                  onChange={e => set('quimico', e.target.value)}
                  className={selectCls}
                >
                  <option value="No incluir">No incluir</option>
                  <option value="1 químico">1 químico</option>
                  <option value="2 químicos">2 químicos</option>
                </select>
              </div>
            </div>

            {/* Badge resumen de personal con precios del tabulador */}
            {(() => {
              const findMO = (kw: string) =>
                m.catTabuladorMO.find(t => t.concepto?.toLowerCase().includes(kw.toLowerCase()));
              const tecConcepto = state.tipoTecnico === 'Con supervisor en planta' ? 'con supervisor' : 'sin supervisor';
              const tecRow  = findMO(tecConcepto);
              const supRow  = findMO('supervisor en planta');
              const quiRow  = m.catTabuladorMO.find(t =>
                t.concepto?.toLowerCase().includes('qu') && t.concepto?.toLowerCase().includes('mico')
              );
              const supQty  = state.supervisorEnPlanta === '1 supervisor' ? 1 : state.supervisorEnPlanta === '2 supervisores' ? 2 : 0;
              const quiQty  = state.quimico === '1 químico' ? 1 : state.quimico === '2 químicos' ? 2 : 0;
              return (
                <div className={`mt-3 px-3 py-2 rounded-xl text-xs space-y-0.5 ${d('bg-rose-50 text-rose-700', 'bg-rose-900/20 text-rose-400')}`}>
                  <div>
                    <strong>{state.cantidadTecnicos} técnico{state.cantidadTecnicos !== 1 ? 's' : ''}</strong>
                    {tecRow ? <> · <span className="opacity-80">{fmt(Number(tecRow.precio_unitario))}/técnico</span> = <strong>{fmt(state.cantidadTecnicos * Number(tecRow.precio_unitario))}/mes</strong></> : null}
                  </div>
                  {supQty > 0 && supRow && (
                    <div>
                      <strong>{supQty} supervisor{supQty > 1 ? 'es' : ''}</strong>
                      <> · <span className="opacity-80">{fmt(Number(supRow.precio_unitario))}/supervisor</span> = <strong>{fmt(supQty * Number(supRow.precio_unitario))}/mes</strong></>
                    </div>
                  )}
                  {quiQty > 0 && quiRow && (
                    <div>
                      <strong>{quiQty} químico{quiQty > 1 ? 's' : ''}</strong>
                      <> · <span className="opacity-80">{fmt(Number(quiRow.precio_unitario))}/químico</span> = <strong>{fmt(quiQty * Number(quiRow.precio_unitario))}/mes</strong></>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Badge frecuencia (solo tipo A) */}
        {state.tipoPoliza === 'A) Póliza por Visitas + HH' && (
          <div className={`mt-3 px-3 py-2 rounded-xl text-xs font-medium ${d('bg-amber-50 text-amber-700', 'bg-amber-900/20 text-amber-400')}`}>
            Frecuencia activa: <strong>{state.frecuencia} visitas/mes</strong> — este valor multiplica los cálculos de MO y análisis.
          </div>
        )}
      </div>

      {/* ── SECCIÓN 3: PASO 2 — ACTIVOS DEL CLIENTE ── */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className={`flex items-center justify-between p-4 md:p-5 border-b ${d('border-gray-50', 'border-gray-700')}`}>
          <h2 className={sectionTitleCls}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${d('bg-blue-100 text-blue-700', 'bg-blue-900/40 text-blue-400')}`}>2</span>
            Activos del Cliente
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${d('bg-blue-50 text-blue-600', 'bg-blue-900/30 text-blue-400')}`}>{state.activos.length}</span>
          </h2>
          <button
            onClick={() => dispatch({ type: 'ADD_ACTIVO' })}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${d('text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100', 'text-blue-400 bg-blue-900/20 border border-blue-700 hover:bg-blue-900/40')}`}
          >
            <Plus size={13} /> Agregar activo
          </button>
        </div>

        {/* Cabecera desktop */}
        <div className={`hidden md:grid grid-cols-[1.5fr_80px_100px_90px_130px_1fr_44px] gap-2 px-4 py-2 border-b ${d('border-gray-50 bg-gray-50/40', 'border-gray-700 bg-gray-900/30')}`}>
          {['Categoría', 'Cantidad', 'Capacidad', 'Unidad', 'Clasificación', 'Notas', ''].map(h => (
            <span key={h} className={thCls}>{h}</span>
          ))}
        </div>

        <div className={dividerCls}>
          {state.activos.map((activo, idx) => (
            <div key={activo.id} className="p-3 md:px-4 md:py-2.5">
              {/* Desktop */}
              <div className="hidden md:grid grid-cols-[1.5fr_80px_100px_90px_130px_1fr_44px] gap-2 items-center">
                <select
                  value={activo.categoria}
                  onChange={e => dispatch({ type: 'UPD_ACTIVO', id: activo.id, field: 'categoria', value: e.target.value })}
                  className={`${selectCls} text-xs`}
                >
                  {CATEGORIAS_ACTIVO.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" min={1} value={activo.cantidad}
                  onChange={e => dispatch({ type: 'UPD_ACTIVO', id: activo.id, field: 'cantidad', value: Number(e.target.value) })}
                  className={`${inputCls} text-center text-xs`} />
                <input type="number" min={0} value={activo.capacidad || ''}
                  onChange={e => dispatch({ type: 'UPD_ACTIVO', id: activo.id, field: 'capacidad', value: Number(e.target.value) })}
                  placeholder="0"
                  className={`${inputCls} text-center text-xs`} />
                <input value={activo.unidad}
                  onChange={e => dispatch({ type: 'UPD_ACTIVO', id: activo.id, field: 'unidad', value: e.target.value })}
                  placeholder="GPM"
                  className={`${inputCls} text-xs`} />
                <select
                  value={activo.clasificacion}
                  onChange={e => dispatch({ type: 'UPD_ACTIVO', id: activo.id, field: 'clasificacion', value: e.target.value })}
                  className={`${selectCls} text-xs`}
                >
                  {CLASIFICACIONES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={activo.notas}
                  onChange={e => dispatch({ type: 'UPD_ACTIVO', id: activo.id, field: 'notas', value: e.target.value })}
                  placeholder="Obs. opcionales"
                  className={`${inputCls} text-xs`} />
                <button
                  onClick={() => dispatch({ type: 'DEL_ACTIVO', id: activo.id })}
                  disabled={state.activos.length === 1}
                  className="text-red-400 hover:text-red-600 disabled:opacity-0 mx-auto"
                ><Trash2 size={14} /></button>
              </div>

              {/* Mobile */}
              <div className="md:hidden flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase ${d('text-gray-400', 'text-gray-500')}`}>Activo {idx + 1}</span>
                  <button onClick={() => dispatch({ type: 'DEL_ACTIVO', id: activo.id })} disabled={state.activos.length === 1} className="text-red-400 disabled:opacity-0"><Trash2 size={13} /></button>
                </div>
                <select value={activo.categoria} onChange={e => dispatch({ type: 'UPD_ACTIVO', id: activo.id, field: 'categoria', value: e.target.value })} className={selectCls}>
                  {CATEGORIAS_ACTIVO.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={labelCls}>Cantidad</label>
                    <input type="number" min={1} value={activo.cantidad} onChange={e => dispatch({ type: 'UPD_ACTIVO', id: activo.id, field: 'cantidad', value: Number(e.target.value) })} className={`${inputCls} text-center`} />
                  </div>
                  <div>
                    <label className={labelCls}>Capacidad</label>
                    <input type="number" min={0} value={activo.capacidad || ''} onChange={e => dispatch({ type: 'UPD_ACTIVO', id: activo.id, field: 'capacidad', value: Number(e.target.value) })} placeholder="0" className={`${inputCls} text-center`} />
                  </div>
                  <div>
                    <label className={labelCls}>Unidad</label>
                    <input value={activo.unidad} onChange={e => dispatch({ type: 'UPD_ACTIVO', id: activo.id, field: 'unidad', value: e.target.value })} placeholder="GPM" className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Clasificación</label>
                    <select value={activo.clasificacion} onChange={e => dispatch({ type: 'UPD_ACTIVO', id: activo.id, field: 'clasificacion', value: e.target.value })} className={selectCls}>
                      {CLASIFICACIONES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Notas</label>
                    <input value={activo.notas} onChange={e => dispatch({ type: 'UPD_ACTIVO', id: activo.id, field: 'notas', value: e.target.value })} placeholder="Opcional" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECCIÓN 4: PASO 3 — EQUIPOS EN COMODATO ── */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className={`p-4 md:p-5 border-b ${d('border-gray-50', 'border-gray-700')}`}>
          <h2 className={`${sectionTitleCls} mb-4`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${d('bg-amber-100 text-amber-700', 'bg-amber-900/40 text-amber-400')}`}>3</span>
            Equipos en Comodato (Renta Mensual)
          </h2>
          {/* Formulario de selección */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className={labelCls}>Equipo del catálogo</label>
              <select
                value={m.selComodatoId ?? ''}
                onChange={e => m.setSelComodatoId(Number(e.target.value))}
                className={selectCls}
              >
                {m.catEquipos.length === 0 && <option>Cargando...</option>}
                {m.catEquipos.map(eq => (
                  <option key={eq.id_equipo} value={eq.id_equipo}>
                    {eq.tag ? `${eq.tag} — ` : ''}{eq.nombre_equipo} — {fmt(Number(eq.costo))}/mes
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Capacidad</label>
              <input
                type="number" min={0}
                value={m.comodatoCapacidad || ''}
                onChange={e => m.setComodatoCapacidad(Number(e.target.value))}
                placeholder="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Cantidad</label>
              <div className="flex gap-2">
                <input
                  type="number" min={1}
                  value={m.comodatoCantidad}
                  onChange={e => m.setComodatoCantidad(Number(e.target.value))}
                  className={`flex-1 min-w-0 ${inputCls}`}
                />
                <button
                  onClick={m.addComodato}
                  disabled={!m.selComodatoEquipo}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl font-bold flex-shrink-0 text-sm disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {state.comodatos.length === 0 ? (
          <p className={`text-center text-sm py-8 ${d('text-gray-400', 'text-gray-500')}`}>
            Sin equipos en comodato. Selecciona un equipo del catálogo y agrégalo.
          </p>
        ) : (
          <>
            <div className={`hidden md:grid grid-cols-[2fr_100px_90px_140px_140px_44px] gap-2 px-4 py-2 border-b ${d('border-gray-50 bg-gray-50/40', 'border-gray-700 bg-gray-900/30')}`}>
              {['Equipo', 'Capacidad', 'Cantidad', 'Renta/Mes Unit.', 'Subtotal/Mes', ''].map(h => (
                <span key={h} className={thCls}>{h}</span>
              ))}
            </div>
            <div className={dividerCls}>
              {state.comodatos.map(c => (
                <div key={c.id} className="hidden md:grid grid-cols-[2fr_100px_90px_140px_140px_44px] gap-2 px-4 py-3 items-center">
                  <span className={`text-sm font-semibold truncate ${d('text-gray-800', 'text-gray-100')}`}>{c.nombre}</span>
                  <input type="number" min={0} value={c.capacidad || ''}
                    onChange={e => dispatch({ type: 'UPD_COMODATO', id: c.id, field: 'capacidad', value: Number(e.target.value) })}
                    className={`${inputCls} text-center text-xs`} />
                  <input type="number" min={1} value={c.cantidad}
                    onChange={e => dispatch({ type: 'UPD_COMODATO', id: c.id, field: 'cantidad', value: Number(e.target.value) })}
                    className={`${inputCls} text-center text-xs`} />
                  <input type="number" min={0} value={c.rentaMes}
                    onChange={e => dispatch({ type: 'UPD_COMODATO', id: c.id, field: 'rentaMes', value: Number(e.target.value) })}
                    className={`${inputCls} text-right text-xs`} />
                  <span className={`text-sm font-black text-right ${d('text-slate-800', 'text-gray-100')}`}>{fmt(c.cantidad * c.rentaMes)}</span>
                  <button onClick={() => dispatch({ type: 'DEL_COMODATO', id: c.id })} className="text-red-400 hover:text-red-600 mx-auto"><Trash2 size={14} /></button>
                </div>
              ))}
              {/* Mobile comodatos */}
              {state.comodatos.map(c => (
                <div key={`mob-${c.id}`} className="md:hidden p-3 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-bold ${d('text-gray-800', 'text-gray-100')}`}>{c.nombre}</span>
                    <button onClick={() => dispatch({ type: 'DEL_COMODATO', id: c.id })} className="text-red-400"><Trash2 size={13} /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className={labelCls}>Capacidad</label>
                      <input type="number" value={c.capacidad || ''} onChange={e => dispatch({ type: 'UPD_COMODATO', id: c.id, field: 'capacidad', value: Number(e.target.value) })} className={`${inputCls} text-center`} /></div>
                    <div><label className={labelCls}>Cantidad</label>
                      <input type="number" value={c.cantidad} onChange={e => dispatch({ type: 'UPD_COMODATO', id: c.id, field: 'cantidad', value: Number(e.target.value) })} className={`${inputCls} text-center`} /></div>
                    <div><label className={labelCls}>Renta/Mes</label>
                      <input type="number" value={c.rentaMes} onChange={e => dispatch({ type: 'UPD_COMODATO', id: c.id, field: 'rentaMes', value: Number(e.target.value) })} className={`${inputCls} text-right`} /></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={d('text-gray-400', 'text-gray-500')}>Subtotal/Mes</span>
                    <span className={`font-black ${d('text-slate-800', 'text-gray-100')}`}>{fmt(c.cantidad * c.rentaMes)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── SECCIÓN 5: DESGLOSE DE COTIZACIÓN (CALCULADO) ── */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className={`p-4 md:p-5 border-b ${d('border-gray-50', 'border-gray-700')}`}>
          <h2 className={sectionTitleCls}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${d('bg-slate-100 text-slate-600', 'bg-gray-700 text-gray-300')}`}>4</span>
            Desglose de Cotización
            <span className={`text-[10px] font-medium ml-1 ${d('text-gray-400', 'text-gray-500')}`}>(calculado automáticamente)</span>
          </h2>
        </div>

        {m.desglose.length === 0 ? (
          <div className={`p-8 text-center text-sm ${d('text-gray-400', 'text-gray-500')}`}>
            Completa los pasos 1–3 para ver el desglose calculado.
          </div>
        ) : (
          <>
            {/* Cabecera desktop */}
            <div className={`hidden md:grid grid-cols-[2fr_80px_160px_140px_80px] gap-2 px-4 py-2 border-b ${d('border-gray-50 bg-gray-50/40', 'border-gray-700 bg-gray-900/30')}`}>
              {['Concepto', 'Grupo', 'Cantidad', 'Precio Unitario', 'Subtotal'].map((h, i) => (
                <span key={h} className={`${thCls} ${i >= 2 ? 'text-right' : ''}`}>{h}</span>
              ))}
            </div>

            <div className={dividerCls}>
              {m.desglose.map((row, idx) => (
                <div key={idx} className={`hidden md:grid grid-cols-[2fr_80px_160px_140px_80px] gap-2 px-4 py-3 items-center`}>
                  <span className={`text-sm font-semibold truncate ${d('text-gray-800', 'text-gray-100')}`}>{row.concepto}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${GRUPO_COLORS[row.grupo] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {GRUPO_LABELS[row.grupo]?.split(' ')[0]}
                  </span>
                  <span className={`text-sm text-right ${d('text-gray-500', 'text-gray-400')}`}>{row.cantidad}</span>
                  <span className={`text-sm text-right ${d('text-gray-600', 'text-gray-300')}`}>{fmt(row.precioUnitario)}</span>
                  <span className={`text-sm font-black text-right ${d('text-slate-800', 'text-gray-100')}`}>{fmt(row.subtotal)}</span>
                </div>
              ))}
              {/* Mobile */}
              {m.desglose.map((row, idx) => (
                <div key={`mob-${idx}`} className="md:hidden p-3 flex justify-between items-center">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className={`text-sm font-semibold truncate ${d('text-gray-800', 'text-gray-100')}`}>{row.concepto}</p>
                    <p className={`text-xs ${d('text-gray-400', 'text-gray-500')}`}>{row.cantidad} × {fmt(row.precioUnitario)}</p>
                  </div>
                  <span className={`text-sm font-black flex-shrink-0 ${d('text-slate-800', 'text-gray-100')}`}>{fmt(row.subtotal)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── SECCIÓN 6: RESUMEN COMERCIAL ── */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className={`px-5 py-3 border-b ${d('border-gray-50 bg-gray-50/60', 'border-gray-700 bg-gray-900/40')}`}>
          <h2 className={sectionTitleCls}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${d('bg-emerald-100 text-emerald-700', 'bg-emerald-900/40 text-emerald-400')}`}>5</span>
            Resumen Comercial
          </h2>
        </div>

        {/* Grupos de subtotales */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 border-b ${d('divide-x divide-gray-50 border-gray-50', 'divide-x divide-gray-700 border-gray-700')}`}>
          {[
            { label: 'Mano de Obra / Servicio',   value: m.resumen.mo,          color: 'text-blue-600'    },
            { label: 'Análisis Físico-Químicos',   value: m.resumen.analisis,    color: 'text-purple-600'  },
            { label: 'Comodato',                   value: m.resumen.comodato,    color: 'text-amber-600'   },
            { label: 'Consumibles',                value: m.resumen.consumibles, color: 'text-emerald-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="px-4 py-3 flex flex-col gap-0.5">
              <span className={`text-[10px] font-black uppercase tracking-wider leading-tight ${d('text-slate-400', 'text-gray-500')}`}>{label}</span>
              <span className={`text-sm font-black ${color}`}>{fmt(value)}</span>
            </div>
          ))}
        </div>

        {/* Subtotal técnico */}
        <div className={`flex items-center justify-between px-5 py-3 border-b ${d('border-gray-50', 'border-gray-700')}`}>
          <span className={`text-sm font-black uppercase tracking-wide ${d('text-slate-600', 'text-gray-300')}`}>Subtotal Técnico</span>
          <span className={`text-lg font-black ${d('text-slate-800', 'text-gray-100')}`}>{fmt(m.resumen.subtotalTecnico)}</span>
        </div>

        {/* Admón + Reportes + Riesgo */}
        <div className={`flex items-center gap-4 px-5 py-3 border-b ${d('border-gray-50', 'border-gray-700')}`}>
          <span className={`text-sm font-semibold flex-1 ${d('text-slate-600', 'text-gray-300')}`}>Admón. + Reportes + Riesgo</span>
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} max={100}
              value={state.adminPct}
              onChange={e => set('adminPct', Number(e.target.value))}
              className={`w-16 border rounded-lg px-2 py-1.5 text-sm text-center outline-none ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-700 border-gray-600 text-gray-100')}`}
            />
            <span className={`text-sm ${d('text-gray-400', 'text-gray-500')}`}>%</span>
          </div>
          <span className="text-sm font-black text-slate-500 w-28 text-right">{fmt(m.resumen.admin)}</span>
        </div>

        {/* Costo financiero */}
        <div className={`flex items-center gap-4 px-5 py-3 border-b ${d('border-gray-50', 'border-gray-700')}`}>
          <span className={`text-sm font-semibold flex-1 ${d('text-slate-600', 'text-gray-300')}`}>Costo Financiero</span>
          <div className="flex items-center gap-2">
            <input
              type="number" min={0}
              value={state.diasCredito}
              onChange={e => set('diasCredito', Number(e.target.value))}
              className={`w-16 border rounded-lg px-2 py-1.5 text-sm text-center outline-none ${d('bg-white border-gray-200 text-gray-800', 'bg-gray-700 border-gray-600 text-gray-100')}`}
            />
            <span className={`text-sm whitespace-nowrap ${d('text-gray-400', 'text-gray-500')}`}>días × 0.05%/día</span>
          </div>
          <span className="text-sm font-black text-orange-500 w-28 text-right">{fmt(m.resumen.costoFinanciero)}</span>
        </div>

        {/* Total sin IVA */}
        <div className={`flex items-center justify-between px-5 py-3 border-b ${d('border-gray-50', 'border-gray-700')}`}>
          <span className={`text-sm font-semibold ${d('text-slate-500', 'text-gray-400')}`}>Total sin IVA</span>
          <span className={`text-base font-black ${d('text-slate-700', 'text-gray-200')}`}>{fmt(m.resumen.totalSinIVA)}</span>
        </div>

        {/* IVA */}
        <div className={`flex items-center justify-between px-5 py-3 border-b ${d('border-gray-50', 'border-gray-700')}`}>
          <span className={`text-sm ${d('text-slate-400', 'text-gray-500')}`}>IVA (16%)</span>
          <span className={`text-sm font-semibold ${d('text-slate-500', 'text-gray-400')}`}>{fmt(m.resumen.iva)}</span>
        </div>

        {/* Total con IVA — resaltado */}
        <div className={`flex items-center justify-between px-5 py-5 ${d('bg-emerald-50', 'bg-emerald-900/10')}`}>
          <div>
            <p className={`text-xs font-black uppercase tracking-wider mb-0.5 ${d('text-emerald-600', 'text-emerald-500')}`}>Total con IVA (Mensual)</p>
            <p className={`text-xs ${d('text-gray-400', 'text-gray-500')}`}>× {state.mesesContrato} meses = {fmt(m.resumen.totalConIVA * state.mesesContrato)}</p>
          </div>
          <span className={`text-3xl font-black ${d('text-emerald-600', 'text-emerald-400')}`}>{fmt(m.resumen.totalConIVA)}</span>
        </div>
      </div>

    </div>
  );
};
