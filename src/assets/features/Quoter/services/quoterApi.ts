import { apiFetch } from '../../../../lib/apiFetch';
import type { EquipoDB, TarifaDB, IndirectoDB, TabuladorDB, IndirectoItem } from '../types/quoter.d';

// ── Equipos ───────────────────────────────────────────────────
export const getEquipos  = (): Promise<EquipoDB[]> =>
  apiFetch('/api/equipos').then(r => r.json());

export const createEquipo = (body: Omit<EquipoDB, 'id_equipo'>) =>
  apiFetch('/api/equipos', { method: 'POST', body: JSON.stringify(body) });

export const updateEquipo = (id: number, body: Omit<EquipoDB, 'id_equipo'>) =>
  apiFetch(`/api/equipos/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteEquipo = (id: number) =>
  apiFetch(`/api/equipos/${id}`, { method: 'DELETE' });

// ── Tarifas ───────────────────────────────────────────────────
export const getTarifas  = (): Promise<TarifaDB[]> =>
  apiFetch('/api/tarifas').then(r => r.json());

export const createTarifa = (body: Pick<TarifaDB, 'nombre_tarifa' | 'tipo_tarifa' | 'costo'>) =>
  apiFetch('/api/tarifas', { method: 'POST', body: JSON.stringify(body) });

export const updateTarifa = (id: number, body: Pick<TarifaDB, 'nombre_tarifa' | 'tipo_tarifa' | 'costo'>) =>
  apiFetch(`/api/tarifas/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteTarifa = (id: number) =>
  apiFetch(`/api/tarifas/${id}`, { method: 'DELETE' });

// ── Costos Indirectos ─────────────────────────────────────────
export const getIndirectos = (): Promise<IndirectoDB[]> =>
  apiFetch('/api/costos-indirectos').then(r => r.json());

export const createIndirecto = (body: Omit<IndirectoDB, 'id_indirecto'>) =>
  apiFetch('/api/costos-indirectos', { method: 'POST', body: JSON.stringify(body) });

export const updateIndirecto = (id: number, body: Omit<IndirectoDB, 'id_indirecto'>) =>
  apiFetch(`/api/costos-indirectos/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteIndirecto = (id: number) =>
  apiFetch(`/api/costos-indirectos/${id}`, { method: 'DELETE' });

// ── Tabulador MO ──────────────────────────────────────────────
export const getTabulador = (): Promise<TabuladorDB[]> =>
  apiFetch('/api/tabulador-mo').then(r => r.json());

// ── Cotizaciones ──────────────────────────────────────────────
export interface SaveCotizacionPayload {
  nombre_proyecto: string;
  nombre_cliente: string;
  empresa: string;
  correo: string;
  id_usuario: number | null;
  id_planta: number | null;
  equipos: { id_equipo: number; cantidad: number; precio_unitario_venta: number }[];
  tarifas: { id_tarifa: number; cantidad: number; costo_unitario_aplicado: number }[];
  indirectos: { id_indirecto: number; monto_aplicado: number }[];
  tabulador: { id_tabulador: number; cantidad: number; precio_aplicado: number }[];
}

export const saveCotizacion = (payload: SaveCotizacionPayload) =>
  apiFetch('/api/cotizaciones', { method: 'POST', body: JSON.stringify(payload) });

// ── Helpers ───────────────────────────────────────────────────
export const indirectoDBtoItem = (i: IndirectoDB): IndirectoItem => ({
  id:           `ind-${i.id_indirecto}`,
  id_indirecto: i.id_indirecto,
  concepto:     i.concepto,
  tipo:         i.tipo,
  qty:          Number(i.cantidad) || 1,
  val:          i.tipo === 'Porcentaje' ? Number(i.porcentaje_default) : Number(i.monto_fijo),
  monto_fijo:   Number(i.monto_fijo),
});
