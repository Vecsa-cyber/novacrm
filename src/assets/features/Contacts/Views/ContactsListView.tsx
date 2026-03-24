import React from 'react';
import { Users, Search, Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';

const contactsListMock = [
  { id: 1, init: 'LM', color: 'bg-purple-100 text-purple-700', name: 'Laura Méndez',   company: 'Grupo Alfa',        email: 'laura@alfa.mx',        phone: '81-2200-0011', status: 'Cliente',    statusColor: 'bg-nova-emerald/20 text-nova-emerald', value: '$48,000' },
  { id: 2, init: 'CR', color: 'bg-blue-100 text-blue-700',     name: 'Carlos Rivera',  company: 'TechNova SA',       email: 'crivera@technova.com', phone: '55-3100-4422', status: 'Prospecto',  statusColor: 'bg-blue-100 text-blue-700',            value: '$22,000' },
  { id: 3, init: 'AG', color: 'bg-green-100 text-green-700',   name: 'Ana Gutiérrez',  company: 'Inversiones MX',    email: 'ana.g@invmx.com',      phone: '33-4400-9900', status: 'Interesado', statusColor: 'bg-amber-100 text-amber-700',           value: '$75,000' },
  { id: 4, init: 'DT', color: 'bg-amber-100 text-amber-700',   name: 'Diego Torres',   company: 'Constructora Reyes',email: 'dtorres@reyes.mx',     phone: '81-9900-1122', status: 'Inactivo',   statusColor: 'bg-gray-100 text-gray-500',             value: '$31,000' },
];

export const ContactsListView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="text-slate-800" size={28} />
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Contactos</h1>
            <p className="text-slate-400 font-medium text-sm mt-0.5">4 contactos registrados</p>
          </div>
        </div>
        <button className="bg-nova-emerald text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-soft hover:-translate-y-0.5 transition-transform text-sm">
          <Plus size={18} /> Nuevo contacto
        </button>
      </div>

      {/* Búsqueda y filtro */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center px-4 py-3">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nombre, empresa o email..."
            className="w-full bg-transparent border-none outline-none ml-3 text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <button className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between gap-3 text-sm font-bold text-gray-700 sm:min-w-[180px]">
          Todos los estados <ChevronDown size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Tabla — desktop */}
      <div className="bg-white rounded-[1.5rem] shadow-soft border border-gray-50 overflow-hidden hidden md:block">
        <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_1fr_88px] gap-4 px-5 py-4 border-b border-gray-50 bg-gray-50/30 text-xs font-black text-gray-400 uppercase tracking-wider">
          <span>Contacto</span>
          <span>Empresa</span>
          <span>Email</span>
          <span>Teléfono</span>
          <span>Estado</span>
          <span>Valor</span>
          <span></span>
        </div>
        <div className="divide-y divide-gray-50">
          {contactsListMock.map((contact) => (
            <div key={contact.id} className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_1fr_88px] gap-4 px-5 py-4 items-center hover:bg-nova-bg/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${contact.color}`}>{contact.init}</div>
                <span className="font-bold text-gray-800 truncate">{contact.name}</span>
              </div>
              <div><span className="bg-nova-bg px-3 py-1.5 rounded-full text-xs font-bold text-nova-slate">{contact.company}</span></div>
              <div className="text-nova-emerald font-bold text-sm truncate">{contact.email}</div>
              <div className="text-nova-slate text-sm font-medium">{contact.phone}</div>
              <div><span className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${contact.statusColor}`}>{contact.status}</span></div>
              <div className="font-black text-gray-800">{contact.value}</div>
              <div className="flex items-center gap-2">
                <button className="p-2 border border-amber-200 text-amber-500 rounded-lg hover:bg-amber-50 transition-colors"><Edit2 size={15} /></button>
                <button className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tarjetas — móvil */}
      <div className="flex flex-col gap-3 md:hidden">
        {contactsListMock.map((contact) => (
          <div key={contact.id} className="bg-white rounded-2xl shadow-soft border border-gray-50 p-4 flex flex-col gap-3">
            {/* Fila superior: avatar + nombre + acciones */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${contact.color}`}>{contact.init}</div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 truncate">{contact.name}</p>
                  <span className="bg-nova-bg px-2 py-0.5 rounded-full text-xs font-semibold text-nova-slate">{contact.company}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="p-2 border border-amber-200 text-amber-500 rounded-lg hover:bg-amber-50 transition-colors"><Edit2 size={15} /></button>
                <button className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>

            {/* Fila inferior: datos */}
            <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-50 pt-3">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Email</p>
                <p className="text-nova-emerald font-bold truncate">{contact.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Teléfono</p>
                <p className="text-nova-slate font-medium">{contact.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Estado</p>
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${contact.statusColor}`}>{contact.status}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Valor</p>
                <p className="font-black text-gray-800">{contact.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
