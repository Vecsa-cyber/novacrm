import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../../../lib/apiFetch';
import { ESTADOS_GANADOS, ESTADOS_PERDIDOS } from '../constants/deals.constants';
import type { Usuario, Trato, SellerStats } from '../types/deals.d';

export function useDeals() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tratos,   setTratos]   = useState<Trato[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/usuarios/todos').then(r => r.json()),
      apiFetch('/api/tratos').then(r => r.json()),
    ])
      .then(([users, deals]) => {
        setUsuarios(users);
        setTratos(deals);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sellers = useMemo((): SellerStats[] => {
    return usuarios
      .map(u => {
        const misTratos = tratos.filter(t => t.id_usuario === u.id_usuario);
        const estadoLow = (t: Trato) => (t.estado ?? '').toLowerCase();

        const esGanado  = (t: Trato) => ESTADOS_GANADOS.some(k  => estadoLow(t).startsWith(k));
        const esPerdido = (t: Trato) => ESTADOS_PERDIDOS.some(k => estadoLow(t).startsWith(k));

        const ganados  = misTratos.filter(t =>  esGanado(t));
        const perdidos = misTratos.filter(t =>  esPerdido(t));
        const activos  = misTratos.filter(t => !esGanado(t) && !esPerdido(t));

        const wonAmount      = ganados.reduce((s, t) => s + (Number(t.presupuesto) || 0), 0);
        const lostAmount     = perdidos.reduce((s, t) => s + (Number(t.presupuesto) || 0), 0);
        const pipelineAmount = activos.reduce((s, t) => s + (Number(t.presupuesto) || 0), 0);
        const cerrados       = ganados.length + perdidos.length;
        const effectiveness  = cerrados > 0 ? Math.round((ganados.length / cerrados) * 100) : 0;

        return {
          id: u.id_usuario,
          nombre: u.nombre,
          id_rol: u.id_rol,
          dealsAssigned: misTratos.length,
          wonAmount,
          lostCount:  perdidos.length,
          lostAmount,
          pipelineAmount,
          effectiveness,
        };
      })
      .filter(s => {
        if (s.id_rol === 2) return true;                  // vendedores siempre
        if (s.id_rol === 1) return s.pipelineAmount > 0;  // admins solo si tienen pipeline
        return false;
      })
      .sort((a, b) => b.wonAmount - a.wonAmount);
  }, [usuarios, tratos]);

  return { sellers, loading };
}
