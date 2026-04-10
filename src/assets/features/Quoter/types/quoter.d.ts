// ── Catálogos (DB) ────────────────────────────────────────────
export interface EquipoDB {
  id_equipo: number;
  tag: string;
  nombre_equipo: string;
  tipo: string;
  flujo_referencia: number;
  unidad: string;
  costo: number;
  factor_n: number;
}

export interface TarifaDB {
  id_tarifa: number;
  nombre_tarifa: string;
  tipo_tarifa: string;
  costo: number;
}

export interface IndirectoDB {
  id_indirecto: number;
  concepto: string;
  tipo: 'Porcentaje' | 'Monto Fijo';
  porcentaje_default: number;
  monto_fijo: number;
  cantidad: number;
}

export interface TabuladorDB {
  id_tabulador: number;
  categoria: string;
  concepto: string;
  precio_unitario: number;
  desde: number;
  hasta: number;
}

// ── Ítems en cotización ───────────────────────────────────────
export interface EquipItem {
  id: string;
  id_equipo: number;
  name: string;
  refCost: number;
  factor: number;
  flow: string;
  qty: number;
  notes: string;
  unitCost: number;
  total: number;
}

export interface TarifaItem {
  id: string;
  id_tarifa: number;
  nombre: string;
  tipo: string;
  cantidad: number;
  costo_unitario: number;
  total: number;
}

export interface IndirectoItem {
  id: string;
  id_indirecto: number;
  concepto: string;
  tipo: 'Porcentaje' | 'Monto Fijo';
  qty: number;
  val: number;
  monto_fijo: number;
}

export interface TabuladorItem {
  id: string;
  id_tabulador: number;
  concepto: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
}

export interface LineaServicio {
  id: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

// ── Mantenimiento ─────────────────────────────────────────────
export interface ActivoRow {
  id: string;
  categoria: string;
  cantidad: number;
  capacidad: number;
  unidad: string;
  clasificacion: 'Pequeña' | 'Mediana' | 'Grande';
  notas: string;
}

export interface ComodatoRow {
  id: string;
  id_equipo: number;
  nombre: string;
  capacidad: number;
  cantidad: number;
  rentaMes: number;
}

export interface DesgloseRow {
  concepto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  grupo: 'mo' | 'analisis' | 'comodato' | 'consumibles' | 'personal';
}

export interface ConsumibleDB {
  id_consumible: number;
  clasificacion: string;
  concepto: string;
  costo_mensual: number;
}

// ── Props de vistas ───────────────────────────────────────────
export interface QuoterProps {
  currentUser: any;
  darkMode?: boolean;
}

export interface ServiciosGeneralesProps {
  currentUser: any;
  darkMode?: boolean;
}

export interface MantenimientoProps {
  darkMode?: boolean;
}
