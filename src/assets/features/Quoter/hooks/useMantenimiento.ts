import { useReducer, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../../lib/apiFetch';
import type { EquipoDB, TabuladorDB, ConsumibleDB, ActivoRow, ComodatoRow, DesgloseRow } from '../types/quoter.d';

// ── Estado inicial ────────────────────────────────────────────────────────────

const mkActivo = (): ActivoRow => ({
  id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  categoria: 'Torre de Enfriamiento',
  cantidad: 1,
  capacidad: 0,
  unidad: 'GPM',
  clasificacion: 'Pequeña',
  notas: '',
});

export interface MantenimientoState {
  folio: string;
  fecha: string;
  validez: string;
  condicionesPago: string;
  atencionA: string;
  mesesContrato: number;
  presupuestadoPor: string;
  email: string;
  // Paso 1
  tipoPoliza: 'A) Póliza por Visitas + HH' | 'B) Póliza con Personal Dedicado';
  frecuencia: number;
  planta: string;
  // Solo para Personal Dedicado
  tipoTecnico: 'Con supervisor en planta' | 'Sin supervisor en planta';
  cantidadTecnicos: number;
  supervisorEnPlanta: 'No incluir' | '1 supervisor' | '2 supervisores';
  quimico: 'No incluir' | '1 químico' | '2 químicos';
  // Resto
  activos: ActivoRow[];
  comodatos: ComodatoRow[];
  adminPct: number;
  diasCredito: number;
}

const INITIAL: MantenimientoState = {
  folio:              `MTO-${Date.now().toString().slice(-6)}`,
  fecha:              new Date().toISOString().split('T')[0],
  validez:            '30 Días',
  condicionesPago:    'Mensualidad anticipada',
  atencionA:          '',
  mesesContrato:      12,
  presupuestadoPor:   '',
  email:              '',
  tipoPoliza:         'A) Póliza por Visitas + HH',
  frecuencia:         4,
  planta:             '',
  tipoTecnico:        'Sin supervisor en planta',
  cantidadTecnicos:   1,
  supervisorEnPlanta: 'No incluir',
  quimico:            'No incluir',
  activos:            [mkActivo()],
  comodatos:          [],
  adminPct:           15,
  diasCredito:        30,
};

// ── Reducer ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET'; field: keyof MantenimientoState; value: any }
  | { type: 'ADD_ACTIVO' }
  | { type: 'UPD_ACTIVO'; id: string; field: keyof ActivoRow; value: any }
  | { type: 'DEL_ACTIVO'; id: string }
  | { type: 'ADD_COMODATO'; row: ComodatoRow }
  | { type: 'UPD_COMODATO'; id: string; field: keyof ComodatoRow; value: any }
  | { type: 'DEL_COMODATO'; id: string };

function reducer(state: MantenimientoState, action: Action): MantenimientoState {
  switch (action.type) {
    case 'SET':
      return { ...state, [action.field]: action.value };
    case 'ADD_ACTIVO':
      return { ...state, activos: [...state.activos, mkActivo()] };
    case 'UPD_ACTIVO':
      return { ...state, activos: state.activos.map(a => a.id === action.id ? { ...a, [action.field]: action.value } : a) };
    case 'DEL_ACTIVO':
      return { ...state, activos: state.activos.filter(a => a.id !== action.id) };
    case 'ADD_COMODATO':
      return { ...state, comodatos: [...state.comodatos, action.row] };
    case 'UPD_COMODATO':
      return { ...state, comodatos: state.comodatos.map(c => c.id === action.id ? { ...c, [action.field]: action.value } : c) };
    case 'DEL_COMODATO':
      return { ...state, comodatos: state.comodatos.filter(c => c.id !== action.id) };
    default:
      return state;
  }
}

// ── Hook principal ────────────────────────────────────────────────────────────

export function useMantenimiento() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // Catálogos externos
  const [catEquipos,      setCatEquipos]      = useState<EquipoDB[]>([]);
  const [catTabuladorMO,  setCatTabuladorMO]  = useState<TabuladorDB[]>([]);
  const [catConsumibles,  setCatConsumibles]  = useState<ConsumibleDB[]>([]);

  // Formulario temporal para agregar comodato
  const [selComodatoId,    setSelComodatoId]    = useState<number | null>(null);
  const [comodatoCapacidad, setComodatoCapacidad] = useState<number>(0);
  const [comodatoCantidad,  setComodatoCantidad]  = useState<number>(1);

  // Estado de guardado
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    apiFetch('/api/equipos')
      .then(r => r.json())
      .then((d: EquipoDB[]) => { setCatEquipos(d); if (d.length > 0) setSelComodatoId(d[0].id_equipo); })
      .catch(console.error);

    apiFetch('/api/tabulador-mo')
      .then(r => r.json())
      .then(setCatTabuladorMO)
      .catch(console.error);

    // Endpoint futuro — falla silenciosamente si no existe aún
    apiFetch('/api/tabulador-consumibles')
      .then(r => r.json())
      .then(setCatConsumibles)
      .catch(() => {});
  }, []);

  // ── Equipo de comodato seleccionado ───────────────────────────────────────
  const selComodatoEquipo = catEquipos.find(e => e.id_equipo === selComodatoId) ?? null;

  // ── Agregar comodato ──────────────────────────────────────────────────────
  const addComodato = () => {
    if (!selComodatoEquipo) return;
    dispatch({
      type: 'ADD_COMODATO',
      row: {
        id:         `com-${Date.now()}`,
        id_equipo:  selComodatoEquipo.id_equipo,
        nombre:     `${selComodatoEquipo.tag ? selComodatoEquipo.tag + ' — ' : ''}${selComodatoEquipo.nombre_equipo}`,
        capacidad:  comodatoCapacidad,
        cantidad:   comodatoCantidad,
        rentaMes:   Number(selComodatoEquipo.costo),
      },
    });
    setComodatoCapacidad(0);
    setComodatoCantidad(1);
  };

  // ── Motor de cálculo (desglose) ────────────────────────────────────────────
  const desglose = useMemo<DesgloseRow[]>(() => {
    const rows: DesgloseRow[] = [];
    const totalActivos = state.activos.reduce((s, a) => s + a.cantidad, 0);
    const frec = state.frecuencia;

    // 1. Visitas mensuales
    const visitaRow = catTabuladorMO.find(t =>
      t.categoria?.toLowerCase().includes('visita')
    );
    if (visitaRow) {
      rows.push({
        concepto:       'Visitas Mensuales',
        cantidad:        frec,
        precioUnitario:  Number(visitaRow.precio_unitario),
        subtotal:        frec * Number(visitaRow.precio_unitario),
        grupo:          'mo',
      });
    }

    // 2. Horas Hombre (busca por rango desde/hasta de activos)
    const hhRow = catTabuladorMO.find(t => {
      const cat = t.categoria?.toLowerCase() ?? '';
      const inRange = totalActivos >= (t.desde ?? 0) && totalActivos <= (t.hasta ?? 9999);
      return (cat.includes('hh') || cat.includes('hora')) && inRange;
    });
    if (hhRow && totalActivos > 0) {
      rows.push({
        concepto:       'Horas Hombre',
        cantidad:        frec,
        precioUnitario:  Number(hhRow.precio_unitario),
        subtotal:        frec * Number(hhRow.precio_unitario),
        grupo:          'mo',
      });
    }

    // 3. Análisis técnico por activo
    const analisisRow = catTabuladorMO.find(t =>
      t.categoria?.toLowerCase().includes('analisis') ||
      t.categoria?.toLowerCase().includes('análisis')
    );
    if (analisisRow && totalActivos > 0) {
      const qty = totalActivos * frec;
      rows.push({
        concepto:       'Análisis Técnicos',
        cantidad:        qty,
        precioUnitario:  Number(analisisRow.precio_unitario),
        subtotal:        qty * Number(analisisRow.precio_unitario),
        grupo:          'analisis',
      });
    }

    // 4. Equipos en comodato
    state.comodatos.forEach(c => {
      const sub = c.cantidad * c.rentaMes;
      if (sub > 0) {
        rows.push({
          concepto:       `Comodato: ${c.nombre}`,
          cantidad:        c.cantidad,
          precioUnitario:  c.rentaMes,
          subtotal:        sub,
          grupo:          'comodato',
        });
      }
    });

    // 5. Consumibles por clasificación de activo
    state.activos.forEach(activo => {
      const cRow = catConsumibles.find(c =>
        c.clasificacion?.toLowerCase() === activo.clasificacion.toLowerCase()
      );
      if (cRow) {
        const sub = activo.cantidad * Number(cRow.costo_mensual);
        rows.push({
          concepto:       `Consumibles ${activo.clasificacion} (${activo.categoria})`,
          cantidad:        activo.cantidad,
          precioUnitario:  Number(cRow.costo_mensual),
          subtotal:        sub,
          grupo:          'consumibles',
        });
      }
    });

    // 6. Personal Dedicado (solo tipo B)
    if (state.tipoPoliza === 'B) Póliza con Personal Dedicado') {
      // Técnicos
      const tecConcepto = state.tipoTecnico === 'Con supervisor en planta'
        ? 'con supervisor'
        : 'sin supervisor';
      const tecRow = catTabuladorMO.find(t =>
        t.concepto?.toLowerCase().includes(tecConcepto)
      );
      if (tecRow) {
        rows.push({
          concepto:       `Técnico dedicado (${state.tipoTecnico})`,
          cantidad:        state.cantidadTecnicos,
          precioUnitario:  Number(tecRow.precio_unitario),
          subtotal:        state.cantidadTecnicos * Number(tecRow.precio_unitario),
          grupo:          'personal',
        });
      }

      // Supervisor en planta
      if (state.supervisorEnPlanta !== 'No incluir') {
        const supRow = catTabuladorMO.find(t =>
          t.concepto?.toLowerCase().includes('supervisor en planta')
        );
        const qty = state.supervisorEnPlanta === '1 supervisor' ? 1 : 2;
        if (supRow) {
          rows.push({
            concepto:       `Supervisor en planta`,
            cantidad:        qty,
            precioUnitario:  Number(supRow.precio_unitario),
            subtotal:        qty * Number(supRow.precio_unitario),
            grupo:          'personal',
          });
        }
      }

      // Químico
      if (state.quimico !== 'No incluir') {
        const quimicoRow = catTabuladorMO.find(t =>
          t.concepto?.toLowerCase().includes('qu') &&
          (t.concepto?.toLowerCase().includes('mico') || t.concepto?.toLowerCase().includes('mico'))
        );
        const qty = state.quimico === '1 químico' ? 1 : 2;
        if (quimicoRow) {
          rows.push({
            concepto:       `Químico / Laboratorista`,
            cantidad:        qty,
            precioUnitario:  Number(quimicoRow.precio_unitario),
            subtotal:        qty * Number(quimicoRow.precio_unitario),
            grupo:          'personal',
          });
        }
      }
    }

    return rows;
  }, [
    state.activos, state.comodatos, state.frecuencia,
    state.tipoPoliza, state.tipoTecnico, state.cantidadTecnicos,
    state.supervisorEnPlanta, state.quimico,
    catTabuladorMO, catConsumibles,
  ]);

  // ── Resumen comercial ──────────────────────────────────────────────────────
  const resumen = useMemo(() => {
    const mo          = desglose.filter(r => r.grupo === 'mo').reduce((s, r) => s + r.subtotal, 0);
    const analisis    = desglose.filter(r => r.grupo === 'analisis').reduce((s, r) => s + r.subtotal, 0);
    const comodato    = desglose.filter(r => r.grupo === 'comodato').reduce((s, r) => s + r.subtotal, 0);
    const consumibles = desglose.filter(r => r.grupo === 'consumibles').reduce((s, r) => s + r.subtotal, 0);
    const personal    = desglose.filter(r => r.grupo === 'personal').reduce((s, r) => s + r.subtotal, 0);
    const subtotalTecnico = mo + analisis + comodato + consumibles + personal;
    const admin           = subtotalTecnico * (state.adminPct / 100);
    const costoFinanciero = (subtotalTecnico + admin) * state.diasCredito * 0.0005;
    const totalSinIVA     = subtotalTecnico + admin + costoFinanciero;
    const iva             = totalSinIVA * 0.16;
    const totalConIVA     = totalSinIVA + iva;
    return { mo, analisis, comodato, consumibles, personal, subtotalTecnico, admin, costoFinanciero, totalSinIVA, iva, totalConIVA };
  }, [desglose, state.adminPct, state.diasCredito]);

  return {
    state, dispatch,
    // catálogos
    catEquipos, catTabuladorMO, catConsumibles,
    // formulario comodato
    selComodatoId, setSelComodatoId,
    selComodatoEquipo,
    comodatoCapacidad, setComodatoCapacidad,
    comodatoCantidad,  setComodatoCantidad,
    addComodato,
    // cálculos
    desglose, resumen,
    // guardado
    saving, saved,
  };
}
