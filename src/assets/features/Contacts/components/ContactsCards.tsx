import React from 'react';
import { Check, X, Edit2, Trash2 } from 'lucide-react';
import { EDIT_STATUS_OPTIONS, getInitials } from '../constants/contacts.constants';
import type { Contact } from '../types/contacts';

interface ContactsCardsProps {
  contacts: Contact[];
  editingId: number | null;
  editDraft: Contact | null;
  onSetDraft: (updater: (prev: Contact | null) => Contact | null) => void;
  onStartEdit: (c: Contact) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: number) => void;
  darkMode?: boolean;
}

export const ContactsCards: React.FC<ContactsCardsProps> = ({
  contacts, editingId, editDraft, onSetDraft,
  onStartEdit, onSaveEdit, onCancelEdit, onDelete,
  darkMode = false,
}) => {
  const d = (light: string, dark: string) => darkMode ? dark : light;
  const inputCls = d(
    'border border-blue-300 rounded-lg px-2 py-1 text-sm text-gray-800 outline-none focus:border-blue-500 w-full bg-white',
    'border border-blue-500 rounded-lg px-2 py-1 text-sm text-gray-100 outline-none focus:border-blue-400 w-full bg-gray-700',
  );

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {contacts.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-6">No hay contactos con este estado.</p>
      ) : contacts.map(contact => {
        const isEditing = editingId === contact.id;
        return (
          <div key={contact.id} className={`rounded-2xl shadow-soft border p-4 flex flex-col gap-3 ${
            isEditing
              ? d('bg-white border-blue-200', 'bg-gray-800 border-blue-500/50')
              : d('bg-white border-gray-50',  'bg-gray-800 border-gray-700')
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${contact.color}`}>
                  {isEditing ? getInitials(editDraft?.name ?? '') || contact.init : contact.init}
                </div>
                <div className="min-w-0 flex-1">
                  {isEditing
                    ? <input autoFocus value={editDraft?.name ?? ''} onChange={e => onSetDraft(d2 => d2 ? { ...d2, name: e.target.value } : d2)} className={inputCls + ' mb-1'} />
                    : <p className={`font-bold truncate ${d('text-gray-800', 'text-gray-100')}`}>{contact.name}</p>}
                  {isEditing
                    ? <input value={editDraft?.company ?? ''} onChange={e => onSetDraft(d2 => d2 ? { ...d2, company: e.target.value } : d2)} placeholder="Empresa" className={inputCls} />
                    : <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d('bg-slate-50 text-slate-600', 'bg-gray-700 text-gray-300')}`}>{contact.company}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {isEditing ? (
                  <>
                    <button onClick={onSaveEdit} className="p-2 border border-emerald-200 text-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors"><Check size={15} /></button>
                    <button onClick={onCancelEdit} className={`p-2 border rounded-lg transition-colors text-gray-400 ${d('border-gray-200 hover:bg-gray-50', 'border-gray-600 hover:bg-gray-700')}`}><X size={15} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => onStartEdit(contact)} className="p-2 border border-amber-200 text-amber-500 rounded-lg hover:bg-amber-50 transition-colors"><Edit2 size={15} /></button>
                    <button onClick={() => onDelete(contact.id)} className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                  </>
                )}
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-2 text-sm border-t pt-3 ${d('border-gray-50', 'border-gray-700')}`}>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Email</p>
                {isEditing
                  ? <input type="email" value={editDraft?.email ?? ''} onChange={e => onSetDraft(d2 => d2 ? { ...d2, email: e.target.value } : d2)} className={inputCls} />
                  : <p className="text-emerald-500 font-bold truncate">{contact.email}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Teléfono</p>
                {isEditing
                  ? <input value={editDraft?.phone ?? ''} onChange={e => onSetDraft(d2 => d2 ? { ...d2, phone: e.target.value } : d2)} className={inputCls} />
                  : <p className={`font-medium ${d('text-slate-600', 'text-gray-400')}`}>{contact.phone}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Estado</p>
                {isEditing
                  ? <select value={editDraft?.status ?? ''} onChange={e => onSetDraft(d2 => d2 ? { ...d2, status: e.target.value } : d2)} className={inputCls}>
                      {EDIT_STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  : <span className={`px-2 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${contact.statusColor}`}>{contact.status}</span>}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Valor</p>
                {isEditing
                  ? <input value={editDraft?.value ?? ''} onChange={e => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      onSetDraft(d2 => d2 ? { ...d2, value: raw ? '$' + Number(raw).toLocaleString('en-US') : '' } : d2);
                    }} className={inputCls} />
                  : <p className={`font-black ${d('text-gray-800', 'text-gray-100')}`}>{contact.value}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
