'use client';

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function CajaClosingCard({ onCerrar }: { onCerrar: (monto: number) => Promise<void> }) {
  const [montoFisico, setMontoFisico] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    await onCerrar(Number(montoFisico));
    setSubmitting(false);
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
      <h3 className="text-base font-bold text-zinc-900 mb-2">Realizar Arqueo de Cierre</h3>
      <p className="text-sm text-zinc-500 mb-4">Cuenta físicamente todo el dinero en el cajón e ingresa el monto exacto abajo.</p>
      
      <form onSubmit={(e) => { e.preventDefault(); setIsOpen(true); }} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Efectivo Físico Contado ($)</label>
          <input required type="number" step="0.01" min="0" placeholder="0.00" value={montoFisico} onChange={(e) => setMontoFisico(e.target.value)} className="block w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xl font-mono font-black focus:outline-none focus:ring-2 focus:ring-zinc-900" />
        </div>
        <button type="submit" disabled={!montoFisico} className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-md">
          Efectuar Corte y Cerrar Turno
        </button>
      </form>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-2"><AlertTriangle className="w-6 h-6 text-amber-500" /></div>
              <h3 className="text-lg font-black text-zinc-900 leading-tight">¿Cerrar caja definitivamente?</h3>
              <p className="text-sm text-zinc-500 font-medium">Corte con <span className="font-bold text-zinc-900">${Number(montoFisico).toFixed(2)}</span> físicos. Ya no podrás procesar ventas.</p>
            </div>
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
              <button onClick={() => setIsOpen(false)} disabled={submitting} className="flex-1 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold">Cancelar</button>
              <button onClick={handleConfirm} disabled={submitting} className="flex-1 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold flex justify-center items-center">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar Cierre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}