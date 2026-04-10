import React from 'react';

interface QuoteFormProps {
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  projectName: string;
  quoteNotes: string;
  onChange: (field: string, value: string) => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({
  clientName,
  clientCompany,
  clientEmail,
  projectName,
  quoteNotes,
  onChange,
}) => {
  const field = (
    label: string,
    key: string,
    value: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(key, e.target.value)}
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {field('Proyecto', 'projectName', projectName, 'text', 'Nombre del proyecto')}
      {field('Cliente', 'clientName', clientName, 'text', 'Nombre del cliente')}
      {field('Empresa', 'clientCompany', clientCompany, 'text', 'Empresa')}
      {field('Correo', 'clientEmail', clientEmail, 'email', 'correo@empresa.com')}
      <div className="md:col-span-2 flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Notas
        </label>
        <textarea
          value={quoteNotes}
          placeholder="Observaciones o condiciones de la cotización…"
          rows={3}
          onChange={e => onChange('quoteNotes', e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition resize-none"
        />
      </div>
    </div>
  );
};
