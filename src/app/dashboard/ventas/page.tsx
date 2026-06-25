'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import SalesFilterBar from './components/SalesFilterBar';
import SalesKpis from './components/SalesKpis';
import SalesTable from './components/SalesTable';

export interface SaleItem {
  id: string;
  quantity: number;
  priceSnap: number;
  product: { name: string };
}

export interface Sale {
  id: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  user: { name: string };
  items: SaleItem[];
  refund: any | null;
}

export default function VentasPage() {
  const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  };

  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sales?startDate=${startDate}&endDate=${endDate}`);
      if (res.ok) setSales(await res.json());
    } catch {
      toast.error("Error al conectar con la base de datos");
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleRefund = async (saleId: string) => {
    const confirmar = confirm('¿Seguro que deseas devolver este ticket? El dinero se descontará de la caja y el stock regresará al inventario.');
    if (!confirmar) return;

    const toastId = toast.loading("Procesando devolución en el inventario...");

    try {
      const res = await fetch('/api/sales/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId, restock: true }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.update(toastId, { render: "Ticket devuelto con éxito", type: "success", isLoading: false, autoClose: 3000 });
        fetchSales(); 
      } else {
        toast.update(toastId, { render: data.error || "Rechazado por el servidor", type: "error", isLoading: false, autoClose: 4000 });
      }
    } catch {
      toast.update(toastId, { render: "Fallo de red al intentar devolver", type: "error", isLoading: false, autoClose: 4000 });
    }
  };

  const ventasValidas = sales.filter(s => !s.refund);
  const ventasDevueltas = sales.filter(s => s.refund);

  const totalIngresos = ventasValidas.reduce((acc, s) => acc + s.total, 0);
  const totalDevuelto = ventasDevueltas.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <div className="max-w-screen-xl mx-auto space-y-6">
        
        {/* CABECERA */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Historial de Ventas</h1>
          <p className="text-sm text-zinc-500 mt-1">Auditoría de comprobantes emitidos y gestión de retornos de stock.</p>
        </div>

        <SalesFilterBar 
          startDate={startDate} endDate={endDate}
          onStartChange={setStartDate} onEndChange={setEndDate}
          onSearch={fetchSales} isLoading={isLoading}
        />

        <SalesKpis 
          totalIngresos={totalIngresos} 
          totalTickets={ventasValidas.length} 
          totalDevuelto={totalDevuelto} 
        />

        <SalesTable 
          sales={sales} 
          isLoading={isLoading} 
          onRefund={handleRefund} 
        />

      </div>
    </div>
  );
}