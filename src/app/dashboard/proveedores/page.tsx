'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SupplierHeader from './components/SupplierHeader';
import SupplierTable from './components/SupplierTable';
import SupplierModal from './components/SupplierModal';

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export default function ProveedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/suppliers');
      if (res.ok) setSuppliers(await res.json());
    } catch { toast.error('Error al cargar proveedores'); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  // Abre el modal limpio para uno NUEVO
  const handleOpenNew = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  // Abre el modal cargado para EDITAR
  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  // Decide si hace POST o PUT
  const handleSaveSupplier = async (formData: any) => {
    setSaving(true);
    const method = editingSupplier ? 'PUT' : 'POST';
    const toastId = toast.loading(editingSupplier ? 'Actualizando...' : 'Registrando...');

    try {
      const res = await fetch('/api/suppliers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.update(toastId, { render: editingSupplier ? 'Actualizado correctamente' : 'Registrado exitosamente', type: 'success', isLoading: false, autoClose: 2000 });
        setIsModalOpen(false);
        fetchSuppliers();
      } else {
        const data = await res.json();
        toast.update(toastId, { render: data.error || 'Error al guardar', type: 'error', isLoading: false, autoClose: 3500 });
      }
    } catch {
      toast.update(toastId, { render: 'Error de conexión', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setSaving(false);
    }
  };

  // Disparador de Borrado
  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás completamente seguro de eliminar a "${name}"?`)) return;

    const toastId = toast.loading('Eliminando...');
    try {
      const res = await fetch(`/api/suppliers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.update(toastId, { render: 'Proveedor eliminado', type: 'success', isLoading: false, autoClose: 2000 });
        fetchSuppliers();
      } else {
        const data = await res.json();
        toast.update(toastId, { render: data.error, type: 'error', isLoading: false, autoClose: 4500 });
      }
    } catch {
      toast.update(toastId, { render: 'Fallo de red al eliminar', type: 'error', isLoading: false, autoClose: 3000 });
    }
  };

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-full bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <SupplierHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} onNewClick={handleOpenNew} />
        
        <SupplierTable 
          suppliers={filtered} 
          isLoading={isLoading} 
          onEdit={handleOpenEdit} 
          onDelete={handleDeleteSupplier} 
        />
        
        <SupplierModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveSupplier} 
          saving={saving}
          initialData={editingSupplier} 
        />
      </div>
    </div>
  );
}