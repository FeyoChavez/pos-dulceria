'use client';

import React, { useState, useEffect } from 'react';

interface CashSessionData {
  id: string;
  openingBalance: number;
  openedAt: string;
  cashSales: number;
  cardSales: number;
  cashRefunds: number; 
  expectedBalance: number;
}

export default function CajaPage() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [sessionData, setSessionData] = useState<CashSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [openingBalanceInput, setOpeningBalanceInput] = useState('');
  const [closingBalanceInput, setClosingBalanceInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkCajaStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cash-session');
      if (res.ok) {
        const data = await res.json();
        setIsOpen(data.isOpen);
        if (data.isOpen) {
          setSessionData(data.session);
        } else {
          setSessionData(null);
        }
      }
    } catch (error) {
      console.error('Error al validar estado de caja:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkCajaStatus();
  }, []);

  const handleAbrirCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openingBalanceInput || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/cash-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openingBalance: openingBalanceInput }),
      });

      if (res.ok) {
        setOpeningBalanceInput('');
        await checkCajaStatus();
      } else {
        alert('Error al intentar abrir la caja');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCerrarCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingBalanceInput || !sessionData || isSubmitting) return;

    const confirmar = confirm('¿Estás seguro de que deseas realizar el corte y cerrar la caja? Ya no podrás registrar más ventas en este turno.');
    if (!confirmar) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/cash-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionData.id,
          closingBalance: closingBalanceInput,
          expectedBalance: sessionData.expectedBalance,
        }),
      });

      if (res.ok) {
        setClosingBalanceInput('');
        await checkCajaStatus();
        alert('Caja cerrada con éxito. El reporte ha sido guardado.');
      } else {
        alert('Error al cerrar la caja');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-50 font-sans">
        <p className="text-zinc-500 text-sm font-medium">Validando estado de la caja...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <div className="max-w-2xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Arqueo y Corte de Caja</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isOpen ? 'Monitorea las ventas del turno y realiza el cierre de caja.' : 'Abre un nuevo turno para poder operar el Punto de Venta.'}
          </p>
        </div>

        {/* Formulario Apertura */}
        {!isOpen && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8">
            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-600 mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mb-2">Turno Cerrado</h2>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">Para comenzar a facturar y registrar dulces en el POS, introduce la cantidad de dinero en efectivo con la que inicias en caja (Fondo de caja para cambio).</p>
            
            <form onSubmit={handleAbrirCaja} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Monto Inicial en Efectivo ($)</label>
                <input required type="number" step="0.01" min="0" placeholder="0.00" value={openingBalanceInput} onChange={(e) => setOpeningBalanceInput(e.target.value)} className="block w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-zinc-900 text-white py-3 px-4 rounded-xl font-medium text-sm hover:bg-zinc-800 disabled:opacity-50">
                {isSubmitting ? 'Abriendo Turno...' : 'Abrir Caja Inicial'}
              </button>
            </form>
          </div>
        )}

        {/* Resumen Operativo (Caja Abierta) */}
        {isOpen && sessionData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4 mb-4">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Caja Abierta</span>
                  <p className="text-xs text-zinc-400 mt-1">Iniciada a las {new Date(sessionData.openedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Fondo Inicial</span>
                  <p className="text-sm font-bold text-zinc-800">${sessionData.openingBalance.toFixed(2)}</p>
                </div>
              </div>

              {/* Múltiplos Financieros (Añadimos Devoluciones aquí) */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 md:p-4">
                  <span className="text-xs text-zinc-500 font-medium">Efectivo</span>
                  <p className="text-lg md:text-xl font-bold text-zinc-900 mt-0.5">${sessionData.cashSales.toFixed(2)}</p>
                </div>
                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 md:p-4">
                  <span className="text-xs text-zinc-500 font-medium">Tarjeta</span>
                  <p className="text-lg md:text-xl font-bold text-zinc-900 mt-0.5">${sessionData.cardSales.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 md:p-4">
                  <span className="text-xs text-red-600 font-medium">Devoluciones</span>
                  <p className="text-lg md:text-xl font-bold text-red-700 mt-0.5">-${sessionData.cashRefunds.toFixed(2)}</p>
                </div>
              </div>

              {/* Balance Total */}
              <div className="border-t border-zinc-100 pt-4 flex justify-between items-end">
                <div>
                  <span className="text-sm font-semibold text-zinc-500">Efectivo Estimado en Sistema</span>
                  <p className="text-xs text-zinc-400 mt-0.5">(Fondo + Efectivo - Devoluciones)</p>
                </div>
                <span className="text-2xl font-black text-zinc-900">${sessionData.expectedBalance.toFixed(2)}</span>
              </div>
            </div>

            {/* Formulario Cierre */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
              <h3 className="text-base font-bold text-zinc-900 mb-2">Realizar Arqueo de Cierre</h3>
              <p className="text-sm text-zinc-500 mb-4">Cuenta físicamente todo el billete y moneda que tienes en el cajón e ingresa el monto exacto abajo.</p>
              
              <form onSubmit={handleCerrarCaja} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Efectivo Físico Total ($)</label>
                  <input required type="number" step="0.01" min="0" placeholder="0.00" value={closingBalanceInput} onChange={(e) => setClosingBalanceInput(e.target.value)} className="block w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-zinc-900 text-white py-3 px-4 rounded-xl font-medium text-sm hover:bg-zinc-800 disabled:opacity-50">
                  {isSubmitting ? 'Procesando Corte...' : 'Efectuar Corte y Cerrar Turno'}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}