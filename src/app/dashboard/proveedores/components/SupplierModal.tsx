import React, { useState, useEffect } from 'react';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
  initialData?: any | null; 
}

export default function SupplierModal({ isOpen, onClose, onSave, saving, initialData }: SupplierModalProps) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });

  // Cada que se abre el modal o cambia el proveedor seleccionado, rellenamos los inputs
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || ''
      });
    } else {
      setFormData({ name: '', phone: '', email: '', address: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || saving) return;
    
    // Si estabamos editando, le devolvemos al padre el objeto con todo y su ID original
    if (initialData) {
      await onSave({ ...formData, id: initialData.id });
    } else {
      await onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-base font-black text-zinc-900">
              {initialData ? 'Editar Proveedor' : 'Registrar Proveedor'}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {initialData ? 'Modifica los datos de contacto de esta empresa.' : 'Ingresa los datos para identificarlo en compras.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">Nombre Comercial *</label>
            <input required type="text" placeholder="Ej. Sabritas S.A." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">Teléfono</label>
              <input type="tel" placeholder="Opcional" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">Correo</label>
              <input type="email" placeholder="Opcional" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">Dirección</label>
            <textarea rows={2} placeholder="Opcional" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-900 resize-none" />
          </div>

          <div className="pt-3 flex gap-3">
            <button type="button" disabled={saving} onClick={onClose} className="flex-1 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-50">Cancelar</button>
            <button type="submit" disabled={saving || !formData.name.trim()} className="flex-1 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 shadow-md flex justify-center items-center">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (initialData ? 'Actualizar Cambios' : 'Guardar Proveedor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}