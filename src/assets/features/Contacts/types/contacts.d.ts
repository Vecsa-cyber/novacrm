export interface Contact {
  id: number;
  init: string;
  color: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  statusColor: string;
  value: string;
}

export interface NewContactForm {
  nombre: string;
  apellido: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  value: string;
}
