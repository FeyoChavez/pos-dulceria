'use client';

import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface TurnoCerradoPanelProps {
  onAbrir: (monto: number) => Promise<void>;
}

export default function TurnoCerradoPanel({ onAbrir }: TurnoCerradoPanelProps) {
  const [monto, setMonto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || isSubmitting) return;
    setIsSubmitting(true);
    await onAbrir(Number(monto));
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8 animate-in fade-in duration-300">
      <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-600 mb-6">
        <Lock className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-bold text-zinc-900 mb-2">Turno Cerrado</h2>
      <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
        Para comenzar a facturar y registrar dulces en el POS, introduce la cantidad de dinero en efectivo con la que inicias en caja (Fondo de caja para cambio).
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Monto Inicial en Efectivo ($)</label>
          <input required type="number" step="0.01" min="0" placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} className="block w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono text-lg" />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full bg-zinc-900 text-white py-3 px-4 rounded-xl font-medium text-sm hover:bg-zinc-800 disabled:opacity-50 flex justify-center items-center gap-2 transition-all active:scale-[0.98]">
          {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Abrir Caja Inicial'}
        </button>
      </form>
    </div>
  );
}