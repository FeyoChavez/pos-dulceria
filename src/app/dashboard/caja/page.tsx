'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
// 🔥 FIX 1: Cambiamos useSession por getSession
import { getSession } from 'next-auth/react'; 
import TurnoCerradoPanel from './components/TurnoCerradoPanel';
import TurnoAbiertoPanel from './components/TurnoAbiertoPanel';

export interface CashSessionData {
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
  
  const [isAdmin, setIsAdmin] = useState(false); 

  const checkCajaStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cash-session');
      if (res.ok) {
        const data = await res.json();
        setIsOpen(data.isOpen);
        setSessionData(data.isOpen ? data.session : null);
      }
    } catch (error) {
      toast.error('Fallo de red al consultar la caja');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    const init = async () => {
      const session = await getSession();
      // Verificamos el rol y lo guardamos en el estado
      setIsAdmin((session?.user as any)?.role === 'ADMIN');
      await checkCajaStatus();
    };
    init();
  }, []);

  const handleAbrirCaja = async (monto: number) => {
    const toastId = toast.loading("Abriendo turno...");
    try {
      const res = await fetch('/api/cash-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openingBalance: monto }),
      });
      if (res.ok) {
        toast.update(toastId, { render: "Caja abierta correctamente", type: "success", isLoading: false, autoClose: 2000 });
        await checkCajaStatus();
      } else {
        toast.update(toastId, { render: "Error al abrir la caja", type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (error) {
      toast.update(toastId, { render: "Error de conexión", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const handleCerrarCaja = async (montoFisico: number) => {
    if (!sessionData) return;
    const toastId = toast.loading("Auditando billetes y registrando corte...");
    
    try {
      const res = await fetch('/api/cash-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionData.id,
          closingBalance: montoFisico,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.difference === 0) {
          toast.update(toastId, { render: "¡Corte exacto! Caja cuadrada al centavo. 👏", type: "success", isLoading: false, autoClose: 4000 });
        } else if (data.difference < 0) {
          toast.update(toastId, { render: `Turno cerrado. FALTANTE de $${Math.abs(data.difference).toFixed(2)} ⚠️`, type: "error", isLoading: false, autoClose: 5000 });
        } else {
          toast.update(toastId, { render: `Turno cerrado. SOBRANTE de $${data.difference.toFixed(2)} 💰`, type: "warning", isLoading: false, autoClose: 5000 });
        }
        await checkCajaStatus();
      } else {
        toast.update(toastId, { render: data.error || "Error al registrar el corte", type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (error) {
      toast.update(toastId, { render: "Error de red al cerrar caja", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-50 font-sans">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Validando estado de la caja...</p>
        </div>
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

        {!isOpen && <TurnoCerradoPanel onAbrir={handleAbrirCaja} />}
        
        {isOpen && sessionData && (
          <TurnoAbiertoPanel 
            data={sessionData} 
            isAdmin={isAdmin} 
            onCerrar={handleCerrarCaja} 
          />
        )}
        
      </div>
    </div>
  );
}