import React from 'react';
import { Users, Plus } from 'lucide-react';
import { useContacts } from '../hooks/useContacts';
import { ContactsFilters } from '../components/ContactsFilters';
import { ContactsTable } from '../components/ContactsTable';
import { ContactsCards } from '../components/ContactsCards';
import { NewContactDrawer } from '../components/NewContactDrawer';

interface ContactsListViewProps {
  darkMode?: boolean;
}

export const ContactsListView: React.FC<ContactsListViewProps> = ({ darkMode = false }) => {
  const c = useContacts();
  const d = (light: string, dark: string) => darkMode ? dark : light;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className={d('text-slate-800', 'text-gray-200')} size={28} />
          <div>
            <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${d('text-slate-800', 'text-white')}`}>Contactos</h1>
            <p className={`font-medium text-sm mt-0.5 ${d('text-slate-400', 'text-gray-400')}`}>
              {c.filtered.length} contacto{c.filtered.length !== 1 ? 's' : ''} registrado{c.filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => c.setNewContactOpen(true)}
          className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-soft hover:-translate-y-0.5 transition-transform text-sm"
        >
          <Plus size={18} /> Nuevo contacto
        </button>
      </div>

      {/* Drawer */}
      {c.newContactOpen && (
        <NewContactDrawer
          form={c.newForm}
          onChangeField={c.setNewField}
          onSubmit={c.submitNewContact}
          onClose={() => c.setNewContactOpen(false)}
          darkMode={darkMode}
        />
      )}

      {/* Filtros */}
      <ContactsFilters
        searchQuery={c.searchQuery}      onSearchChange={c.setSearchQuery}
        statusFilter={c.statusFilter}    onStatusChange={(v) => { c.setStatusFilter(v); c.setDropdownOpen(false); }}
        sortOrder={c.sortOrder}          onSortChange={c.setSortOrder}
        dropdownOpen={c.dropdownOpen}    onDropdownToggle={() => c.setDropdownOpen(o => !o)}
        dropdownRef={c.dropdownRef}
        darkMode={darkMode}
      />

      {/* Tabla — desktop */}
      <ContactsTable
        contacts={c.filtered}
        editingId={c.editingId}
        editDraft={c.editDraft}
        onSetDraft={c.setEditDraft}
        onStartEdit={c.startEdit}
        onSaveEdit={c.saveEdit}
        onCancelEdit={c.cancelEdit}
        onDelete={c.deleteContact}
        darkMode={darkMode}
      />

      {/* Tarjetas — móvil */}
      <ContactsCards
        contacts={c.filtered}
        editingId={c.editingId}
        editDraft={c.editDraft}
        onSetDraft={c.setEditDraft}
        onStartEdit={c.startEdit}
        onSaveEdit={c.saveEdit}
        onCancelEdit={c.cancelEdit}
        onDelete={c.deleteContact}
        darkMode={darkMode}
      />

    </div>
  );
};
