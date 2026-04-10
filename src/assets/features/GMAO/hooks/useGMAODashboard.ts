import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../../lib/apiFetch';
import type { OTRow, GMAOStats } from '../types/gmao.d';

// ── Mapeo DB → OTRow ──────────────────────────────────────────────────────────
const mapOT = (row: any): OTRow => ({
  folio:      row.folio ?? `OT-${row.id_ot}`,
  actividad:  row.tipo_mantenimiento ?? '—',
  activo:     row.nombre_activo ? `${row.tag_activo ? row.tag_activo + ' · ' : ''}${row.nombre_activo}` : '—',
  cliente:    row.nombre_cliente ?? '—',
  prioridad:  mapPrioridad(row.prioridad),
  estado:     mapEstado(row.estado_ot),
  vencida:    !!row.fecha_programada && new Date(row.fecha_programada) < new Date() && row.estado_ot !== 'Cerrada',
  tecnico:    row.nombre_tecnico ?? 'Sin asignar',
  supervisor: row.nombre_supervisor ?? '—',
  fecha:      row.fecha_programada ? row.fecha_programada.slice(0, 10) : '—',
});

const mapPrioridad = (p: string): OTRow['prioridad'] => {
  if (p === 'Alta' || p === 'Crítica') return 'Alto';
  if (p === 'Media')                   return 'Medio';
  return 'Bajo';
};

const mapEstado = (e: string): OTRow['estado'] => {
  if (e === 'En Proceso')          return 'En ejecución';
  if (e === 'Cerrada')             return 'Completada';
  if (e === 'Pendiente Repuestos') return 'Planificada';
  return 'Planificada';
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useGMAODashboard = () => {
  const [ordenes,   setOrdenes]   = useState<OTRow[]>([]);
  const [stats,     setStats]     = useState<GMAOStats>({
    clientesActivos: 0, clientesTotal: 0,
    activosRegistrados: 0, activosFueraServicio: 0,
    otsAbiertas: 0, otsVencidas: 0,
    tasaCompletado: 0, completadas: 0, totalOTs: 0,
  });
  const [tecnicos,     setTecnicos]     = useState<string[]>(['todos']);
  const [supervisores, setSupervisores] = useState<string[]>(['todos']);
  const [loading, setLoading] = useState(true);

  const [filtroTecnico,    setFiltroTecnico]    = useState('todos');
  const [filtroSupervisor, setFiltroSupervisor] = useState('todos');
  const [busqueda,         setBusqueda]         = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [resOTs, resStats] = await Promise.all([
          apiFetch('/api/gmao/ordenes'),
          apiFetch('/api/gmao/dashboard'),
        ]);

        const rawOTs   = await resOTs.json();
        const rawStats = await resStats.json();

        const mapped: OTRow[] = (rawOTs as any[]).map(mapOT);
        setOrdenes(mapped);
        setStats(rawStats as GMAOStats);

        // Derivar listas únicas de técnicos y supervisores para los filtros
        const tecs = ['todos', ...Array.from(new Set(mapped.map(o => o.tecnico).filter(t => t !== 'Sin asignar')))];
        const sups = ['todos', ...Array.from(new Set(mapped.map(o => o.supervisor).filter(s => s !== '—')))];
        setTecnicos(tecs);
        setSupervisores(sups);
      } catch (err) {
        console.error('GMAO dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const ordenesFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return ordenes.filter(ot => {
      const matchT = filtroTecnico    === 'todos' || ot.tecnico    === filtroTecnico;
      const matchS = filtroSupervisor === 'todos' || ot.supervisor === filtroSupervisor;
      const matchQ = !q ||
        ot.folio.toLowerCase().includes(q)    ||
        ot.activo.toLowerCase().includes(q)   ||
        ot.cliente.toLowerCase().includes(q)  ||
        ot.actividad.toLowerCase().includes(q);
      return matchT && matchS && matchQ;
    });
  }, [ordenes, filtroTecnico, filtroSupervisor, busqueda]);

  return {
    stats, ordenesFiltradas, loading,
    tecnicos, supervisores,
    filtroTecnico, setFiltroTecnico,
    filtroSupervisor, setFiltroSupervisor,
    busqueda, setBusqueda,
  };
};
