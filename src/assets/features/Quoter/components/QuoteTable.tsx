import React from 'react';
import { Trash2 } from 'lucide-react';
import type { EquipItem, TarifaItem, IndirectoItem, TabuladorItem } from '../types/quoter.d';

const fmt = (n: number) =>
  Number(n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

// ── Tabla de Equipos ──────────────────────────────────────────────────────────
interface EquiposTableProps {
  items: EquipItem[];
  onRemove: (id: string) => void;
}

export const EquiposTable: React.FC<EquiposTableProps> = ({ items, onRemove }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="text-left text-slate-500 border-b border-slate-100">
        <th className="pb-2 font-medium">Equipo</th>
        <th className="pb-2 font-medium">Flujo</th>
        <th className="pb-2 font-medium text-right">Costo Ref.</th>
        <th className="pb-2 font-medium text-right">Cant.</th>
        <th className="pb-2 font-medium text-right">Total</th>
        <th className="pb-2" />
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr key={item.id} className="border-b border-slate-50">
          <td className="py-2 font-medium text-slate-700">{item.name}</td>
          <td className="py-2 text-slate-500">{item.flow}</td>
          <td className="py-2 text-right text-slate-600">{fmt(item.refCost)}</td>
          <td className="py-2 text-right text-slate-600">{item.qty}</td>
          <td className="py-2 text-right font-semibold text-slate-800">{fmt(item.total)}</td>
          <td className="py-2 text-right">
            <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
              <Trash2 size={14} />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// ── Tabla de Tarifas ──────────────────────────────────────────────────────────
interface TarifasTableProps {
  items: TarifaItem[];
  onRemove: (id: string) => void;
}

export const TarifasTable: React.FC<TarifasTableProps> = ({ items, onRemove }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="text-left text-slate-500 border-b border-slate-100">
        <th className="pb-2 font-medium">Tarifa</th>
        <th className="pb-2 font-medium">Tipo</th>
        <th className="pb-2 font-medium text-right">Cant.</th>
        <th className="pb-2 font-medium text-right">Costo Unit.</th>
        <th className="pb-2 font-medium text-right">Total</th>
        <th className="pb-2" />
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr key={item.id} className="border-b border-slate-50">
          <td className="py-2 font-medium text-slate-700">{item.nombre}</td>
          <td className="py-2 text-slate-500">{item.tipo}</td>
          <td className="py-2 text-right text-slate-600">{item.cantidad}</td>
          <td className="py-2 text-right text-slate-600">{fmt(item.costo_unitario)}</td>
          <td className="py-2 text-right font-semibold text-slate-800">{fmt(item.total)}</td>
          <td className="py-2 text-right">
            <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
              <Trash2 size={14} />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// ── Tabla de Indirectos ───────────────────────────────────────────────────────
interface IndirectosTableProps {
  items: IndirectoItem[];
  subtotal: number;
  onRemove: (id: string) => void;
}

export const IndirectosTable: React.FC<IndirectosTableProps> = ({ items, subtotal, onRemove }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="text-left text-slate-500 border-b border-slate-100">
        <th className="pb-2 font-medium">Concepto</th>
        <th className="pb-2 font-medium">Tipo</th>
        <th className="pb-2 font-medium text-right">Valor</th>
        <th className="pb-2 font-medium text-right">Monto</th>
        <th className="pb-2" />
      </tr>
    </thead>
    <tbody>
      {items.map(item => {
        const monto =
          item.tipo === 'Porcentaje' ? (subtotal * item.val) / 100 : item.val;
        return (
          <tr key={item.id} className="border-b border-slate-50">
            <td className="py-2 font-medium text-slate-700">{item.concepto}</td>
            <td className="py-2 text-slate-500">{item.tipo}</td>
            <td className="py-2 text-right text-slate-600">
              {item.tipo === 'Porcentaje' ? `${item.val}%` : fmt(item.val)}
            </td>
            <td className="py-2 text-right font-semibold text-slate-800">{fmt(monto)}</td>
            <td className="py-2 text-right">
              <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={14} />
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

// ── Tabla de Tabulador MO ─────────────────────────────────────────────────────
interface TabuladorTableProps {
  items: TabuladorItem[];
  onRemove: (id: string) => void;
}

export const TabuladorTable: React.FC<TabuladorTableProps> = ({ items, onRemove }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="text-left text-slate-500 border-b border-slate-100">
        <th className="pb-2 font-medium">Concepto</th>
        <th className="pb-2 font-medium text-right">Cant.</th>
        <th className="pb-2 font-medium text-right">Precio Unit.</th>
        <th className="pb-2 font-medium text-right">Total</th>
        <th className="pb-2" />
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr key={item.id} className="border-b border-slate-50">
          <td className="py-2 font-medium text-slate-700">{item.concepto}</td>
          <td className="py-2 text-right text-slate-600">{item.cantidad}</td>
          <td className="py-2 text-right text-slate-600">{fmt(item.precio_unitario)}</td>
          <td className="py-2 text-right font-semibold text-slate-800">{fmt(item.total)}</td>
          <td className="py-2 text-right">
            <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
              <Trash2 size={14} />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
