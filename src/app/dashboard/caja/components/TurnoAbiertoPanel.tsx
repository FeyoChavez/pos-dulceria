'use client';

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface CashSessionData {
  id: string;
  openingBalance: number;
  openedAt: string;
  cashSales: number;
  cardSales: number;
  cashRefunds: number; 
  expectedBalance: number;
}

interface TurnoAbiertoPanelProps {
  data: CashSessionData;
  onCerrar: (monto: number) => Promise<void>;
}

export default function TurnoAbiertoPanel({ data, onCerrar }: TurnoAbiertoPanelProps) {
  const [montoFisico, setMontoFisico] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmCierre = async () => {
    setIsSubmitting(true);
    await onCerrar(Number(montoFisico));
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-4 mb-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Caja Abierta</span>
            <p className="text-xs text-zinc-400 mt-1">Iniciada a las {new Date(data.openedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Fondo Inicial</span>
            <p className="text-sm font-bold font-mono text-zinc-800">${data.openingBalance.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 md:p-4">
            <span className="text-xs text-zinc-500 font-medium">Ventas Efectivo</span>
            <p className="text-lg md:text-xl font-bold font-mono text-zinc-900 mt-0.5">${data.cashSales.toFixed(2)}</p>
          </div>
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 md:p-4">
            <span className="text-xs text-zinc-500 font-medium">Ventas Tarjeta</span>
            <p className="text-lg md:text-xl font-bold font-mono text-zinc-900 mt-0.5">${data.cardSales.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 md:p-4">
            <span className="text-xs text-red-600 font-medium">Devoluciones Efec.</span>
            <p className="text-lg md:text-xl font-bold font-mono text-red-700 mt-0.5">-${data.cashRefunds.toFixed(2)}</p>
          </div>
        </div>

        <div className="border-t border-zinc-100 pt-4 flex justify-between items-end">
          <div>
            <span className="text-sm font-semibold text-zinc-500">Efectivo Esperado en Sistema</span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">Fondo + Efectivo - Devoluciones</p>
          </div>
          <span className="text-3xl font-black font-mono text-zinc-900 tracking-tight">${data.expectedBalance.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
        <h3 className="text-base font-bold text-zinc-900 mb-2">Realizar Arqueo de Cierre</h3>
        <p className="text-sm text-zinc-500 mb-4">Cuenta físicamente todo el billete y moneda que tienes en el cajón e ingresa el monto exacto abajo.</p>
        
        <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(true); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Efectivo Físico Total ($)</label>
            <input required type="number" step="0.01" min="0" placeholder="0.00" value={montoFisico} onChange={(e) => setMontoFisico(e.target.value)} className="block w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <button type="submit" disabled={!montoFisico} className="w-full bg-zinc-900 text-white py-3 px-4 rounded-xl font-medium text-sm hover:bg-zinc-800 transition-colors">
            Efectuar Corte y Cerrar Turno
          </button>
        </form>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-black text-zinc-900 leading-tight">¿Cerrar caja definitivamente?</h3>
              <p className="text-sm text-zinc-500 font-medium">
                Se registrará un corte con <span className="font-bold text-zinc-900">${Number(montoFisico).toFixed(2)}</span> físicos. Ya no podrás procesar ventas en este turno.
              </p>
            </div>
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-100">Cancelar</button>
              <button onClick={handleConfirmCierre} disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 flex justify-center items-center">
                {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar Cierre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}