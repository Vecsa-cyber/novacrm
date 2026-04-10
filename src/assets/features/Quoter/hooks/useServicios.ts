import { useState } from 'react';
import type { LineaServicio, TabuladorDB, TabuladorItem } from '../types/quoter.d';
import { apiFetch } from '../../../../lib/apiFetch';

export function useServicios(currentUser: any) {
  const [lineas,        setLineas]        = useState<LineaServicio[]>([]);
  const [tabuladorCat,  setTabuladorCat]  = useState<TabuladorDB[]>([]);
  const [tabuladorItems, setTabuladorItems] = useState<TabuladorItem[]>([]);
  const [loading,       setLoading]       = useState(false);

  const [clientName,    setClientName]    = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail,   setClientEmail]   = useState('');
  const [projectName,   setProjectName]   = useState('');

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const loadTabulador = async () => {
    setLoading(true);
    try {
      const data: TabuladorDB[] = await apiFetch('/api/tabulador-mo').then(r => r.json());
      setTabuladorCat(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addLinea = () => {
    setLineas(prev => [
      ...prev,
      { id: crypto.randomUUID(), descripcion: '', cantidad: 1, precio_unitario: 0 },
    ]);
  };

  const updateLinea = (id: string, field: keyof LineaServicio, value: string | number) => {
    setLineas(prev =>
      prev.map(l => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const removeLinea = (id: string) => {
    setLineas(prev => prev.filter(l => l.id !== id));
  };

  const addTabuladorItem = (item: TabuladorDB, cantidad: number) => {
    setTabuladorItems(prev => [
      ...prev,
      {
        id:              crypto.randomUUID(),
        id_tabulador:    item.id_tabulador,
        concepto:        item.concepto,
        cantidad,
        precio_unitario: item.precio_unitario,
        total:           item.precio_unitario * cantidad,
      },
    ]);
  };

  const removeTabuladorItem = (id: string) => {
    setTabuladorItems(prev => prev.filter(i => i.id !== id));
  };

  const totalLineas    = lineas.reduce((s, l) => s + l.cantidad * l.precio_unitario, 0);
  const totalTabulador = tabuladorItems.reduce((s, i) => s + i.total, 0);
  const total          = totalLineas + totalTabulador;

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch('/api/cotizaciones-servicios', {
        method: 'POST',
        body: JSON.stringify({
          nombre_proyecto: projectName,
          nombre_cliente:  clientName,
          empresa:         clientCompany,
          correo:          clientEmail,
          id_usuario:      currentUser?.id_usuario ?? null,
          lineas,
          tabulador: tabuladorItems.map(i => ({
            id_tabulador:    i.id_tabulador,
            cantidad:        i.cantidad,
            precio_aplicado: i.precio_unitario,
          })),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return {
    lineas, tabuladorCat, tabuladorItems,
    loading,
    clientName, setClientName,
    clientCompany, setClientCompany,
    clientEmail, setClientEmail,
    projectName, setProjectName,
    loadTabulador,
    addLinea, updateLinea, removeLinea,
    addTabuladorItem, removeTabuladorItem,
    totalLineas, totalTabulador, total,
    saving, saved, handleSave,
  };
}
