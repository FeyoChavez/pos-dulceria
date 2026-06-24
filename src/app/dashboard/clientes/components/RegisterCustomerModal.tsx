'use client';

import React, { useState } from 'react';
import { User, Phone } from 'lucide-react';

interface RegisterCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterCustomerModal({ isOpen, onClose, onSuccess }: RegisterCustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setFormError('');

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      if (res.ok) {
        setName(''); setPhone('');
        onSuccess();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || 'Error al registrar cliente.');
      }
    } catch {
      setFormError('Error de conexión.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <h3 className="font-bold text-base text-zinc-900">Agregar Cliente</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-xs">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold">{formError}</div>}

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Nombre del Cliente</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text" required placeholder="ej. Doña Mary" value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Teléfono (Opcional)</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text" placeholder="783XXXXXXX" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-xs">Cancelar</button>
            <button type="submit" disabled={isSaving} className="flex-1 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-xs disabled:opacity-50">
              {isSaving ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}