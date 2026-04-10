export const GMAO_MODULES = [
  'gmao-dashboard',
  'gmao-clientes',
  'gmao-activos',
  'gmao-ordenes',
  'gmao-calendario',
  'gmao-alertas',
  'gmao-kpis',
] as const;

export type GMAOModule = typeof GMAO_MODULES[number];
