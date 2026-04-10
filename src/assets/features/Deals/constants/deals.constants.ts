export const ESTADOS_GANADOS  = ['ganada', 'ganado', 'cerrado', 'closed', 'won'];
export const ESTADOS_PERDIDOS = ['perdida', 'perdido', 'lost'];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
