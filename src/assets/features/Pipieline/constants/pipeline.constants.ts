import type { Stage, DealForm } from '../types/pipeline.d';

export const STAGE_COLORS = [
  'bg-slate-50 border-slate-200',
  'bg-blue-50 border-blue-200',
  'bg-indigo-50 border-indigo-200',
  'bg-purple-50 border-purple-200',
  'bg-pink-50 border-pink-200',
  'bg-emerald-50 border-emerald-200',
  'bg-orange-50 border-orange-200',
  'bg-teal-50 border-teal-200',
];

export const INITIAL_STAGES: Stage[] = [
  { id: 1, name: 'PROSPECTO GENERAL',    color: STAGE_COLORS[0] },
  { id: 2, name: 'PROSPECTO CALIFICADO', color: STAGE_COLORS[1] },
  { id: 3, name: 'VISITA PENDIENTE',     color: STAGE_COLORS[2] },
  { id: 4, name: 'INFO PENDIENTE',       color: STAGE_COLORS[3] },
  { id: 5, name: 'COTIZACIÓN ENVIADA',   color: STAGE_COLORS[4] },
  { id: 6, name: 'GANADA',               color: STAGE_COLORS[5] },
];

export const INITIAL_LOSS_REASONS = [
  'Precio no competitivo',
  'Sin presupuesto del cliente',
  'Perdido con competidor',
  'Proyecto cancelado',
  'Sin respuesta del cliente',
  'Otro',
];

export const EMPTY_FORM: DealForm = {
  title: '', company: '', id_planta: '', id_usuario: '', value: '', fecha: '', stageId: '1',
};

export const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

export const parseMXN = (s: string) => Number(s.replace(/[^0-9.]/g, '')) || 0;

export const addDaysToDate = (dateStr: string, n: number) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

export const calcStatus = (fechaVisita: string | null): { status: string; statusType: string } => {
  if (!fechaVisita) return { status: 'Sin fecha', statusType: 'info' };
  const dateOnly = fechaVisita.split('T')[0].split(' ')[0];
  const fecha = new Date(dateOnly + 'T00:00:00');
  const now   = new Date();
  const diff  = Math.ceil((fecha.getTime() - now.getTime()) / 86400000);
  const label = fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  if (diff < 0)  return { status: `Vencida ${label}`,      statusType: 'danger' };
  if (diff === 0) return { status: 'Hoy',                  statusType: 'danger' };
  return               { status: `${label} · Pdte visita`, statusType: 'info'  };
};

export const mapRaw = (t: any, stages: Stage[]) => {
  const isLost = (t.estado ?? '').startsWith('Perdida');
  const lossReason = isLost
    ? (t.estado.includes(': ') ? t.estado.split(': ').slice(1).join(': ') : 'Sin especificar')
    : undefined;

  const stageMatch = !isLost
    ? stages.find((s: Stage) => s.name.toLowerCase() === (t.estado ?? '').toLowerCase())
    : undefined;
  const stageId = stageMatch ? stageMatch.id : 1;
  const { status, statusType } = calcStatus(t.fecha_visita);

  return {
    id:          t.id_trato,
    id_usuario:  t.id_usuario  ?? null,
    id_planta:   t.id_planta   ?? null,
    id_contacto: t.id_contacto ?? null,
    title:       t.nombre_servicio,
    company:     t.empresa ?? t.nombre_planta ?? '',
    user:        t.nombre_usuario ?? 'Sin asignar',
    value:       fmt(Number(t.presupuesto) || 0),
    presupuesto: Number(t.presupuesto) || 0,
    stageId,
    status,
    statusType,
    fecha_visita:      t.fecha_visita      ? t.fecha_visita.split('T')[0]      : '',
    fecha_vencimiento: t.fecha_vencimiento ? t.fecha_vencimiento.split('T')[0] : '',
    lossReason,
  };
};
