import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../../../../lib/apiFetch';
import { mapContact } from '../constants/contacts.constants';
import type { Contact, NewContactForm } from '../types/contacts';

const EMPTY_FORM: NewContactForm = {
  nombre: '', apellido: '', company: '', email: '', phone: '', status: '', value: '',
};

export function useContacts() {
  const [contacts, setContacts]             = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery]       = useState('');
  const [statusFilter, setStatusFilter]     = useState('Todos');
  const [sortOrder, setSortOrder]           = useState('recientes');
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const [newContactOpen, setNewContactOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Contact | null>(null);

  const [newForm, setNewForm] = useState<NewContactForm>(EMPTY_FORM);
  const setNewField = (k: keyof NewContactForm, v: string) =>
    setNewForm(f => ({ ...f, [k]: v }));

  const recargar = () =>
    apiFetch('/api/contactos')
      .then(res => res.json())
      .then(data => setContacts(data.map(mapContact)))
      .catch(err => console.error('Error al recargar contactos:', err));

  useEffect(() => { recargar(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const parseValue = (v: string) => Number(v.replace(/[^0-9.]/g, '')) || 0;

  const filtered = contacts
    .filter(c => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'Todos' || c.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'valor_asc':  return parseValue(a.value) - parseValue(b.value);
        case 'valor_desc': return parseValue(b.value) - parseValue(a.value);
        case 'az':         return a.name.localeCompare(b.name);
        case 'recientes':  return b.id - a.id;
        case 'antiguos':   return a.id - b.id;
        default:           return 0;
      }
    });

  const startEdit  = (c: Contact) => { setEditingId(c.id); setEditDraft({ ...c }); };
  const cancelEdit = () => { setEditingId(null); setEditDraft(null); };

  const saveEdit = async () => {
    if (!editDraft) return;
    const raw = editDraft.value.replace(/[^0-9.]/g, '');
    await apiFetch(`/api/contactos/${editDraft.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_contacto: editDraft.name,
        empresa:         editDraft.company,
        correo:          editDraft.email,
        telefono:        editDraft.phone,
        estado:          editDraft.status,
        valor:           raw || null,
      }),
    });
    setEditingId(null);
    setEditDraft(null);
    recargar();
  };

  const deleteContact = async (id: number) => {
    await apiFetch(`/api/contactos/${id}`, { method: 'DELETE' });
    recargar();
  };

  const submitNewContact = async () => {
    const name = `${newForm.nombre} ${newForm.apellido}`.trim();
    if (!name) return;
    const raw = newForm.value.replace(/[^0-9.]/g, '');
    await apiFetch('/api/contactos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_contacto: name,
        empresa:         newForm.company,
        correo:          newForm.email,
        telefono:        newForm.phone,
        estado:          newForm.status || 'Prospecto',
        valor:           raw || null,
      }),
    });
    setNewForm(EMPTY_FORM);
    setNewContactOpen(false);
    recargar();
  };

  return {
    filtered,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    sortOrder, setSortOrder,
    dropdownOpen, setDropdownOpen, dropdownRef,
    newContactOpen, setNewContactOpen,
    editingId, editDraft, setEditDraft,
    startEdit, cancelEdit, saveEdit, deleteContact,
    newForm, setNewField, submitNewContact,
  };
}
