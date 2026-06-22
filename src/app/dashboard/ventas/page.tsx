'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface SaleItem {
  id: string;
  quantity: number;
  priceSnap: number;
  product: { name: string };
}

interface Sale {
  id: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  user: { name: string };
  items: SaleItem[];
  refund: any | null;
}

export default function VentasPage() {
  // Obtener fecha de hoy local en formato YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  };

  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para los filtros de fecha (Por defecto: Hoy)
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sales?startDate=${startDate}&endDate=${endDate}`);
      if (res.ok) {
        const data = await res.json();
        setSales(data);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleRefund = async (saleId: string) => {
    const confirmar = confirm('¿Seguro que deseas devolver este ticket? El dinero se descontará de la caja actual y los dulces regresarán al inventario.');
    if (!confirmar) return;

    try {
      const res = await fetch('/api/sales/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId, restock: true }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Devolución procesada correctamente.');
        fetchSales(); // Recargamos la tabla
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error de red al intentar devolver.');
    }
  };

  // KPIs Inteligentes (Excluyendo dinero de tickets devueltos)
  const ventasValidas = sales.filter(sale => !sale.refund);
  const ventasDevueltas = sales.filter(sale => sale.refund);
  const totalIngresos = ventasValidas.reduce((acc, sale) => acc + sale.total, 0);
  const totalTickets = ventasValidas.length;

  return (
    <div className="h-full bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-screen-xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Historial de Ventas</h1>
            <p className="text-sm text-zinc-500 mt-1">Revisa tickets y gestiona devoluciones.</p>
          </div>
          {ventasDevueltas.length > 0 && (
            <div className="text-right">
              <span className="text-xs font-bold text-red-500 uppercase">Total Devuelto</span>
              <p className="text-lg font-bold text-red-600">-${ventasDevueltas.reduce((acc, s) => acc + s.total, 0).toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* BARRA DE FILTROS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Desde</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" 
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Hasta</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" 
            />
          </div>
          <button 
            onClick={fetchSales}
            className="bg-zinc-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all h-[38px] flex items-center justify-center"
          >
            Buscar Ventas
          </button>
        </div>

        {/* Tarjetas KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
            <span className="text-sm font-medium text-zinc-500 mb-1">Ingresos Reales (Netos)</span>
            <span className="block text-3xl font-bold text-zinc-900">${totalIngresos.toFixed(2)}</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
            <span className="text-sm font-medium text-zinc-500 mb-1">Tickets Válidos</span>
            <span className="block text-3xl font-bold text-zinc-900">{totalTickets}</span>
          </div>
        </div>

        {/* TABLA DE VENTAS */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-zinc-50/90 border-b border-zinc-200">
                <tr className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Fecha y Hora</th>
                  <th className="px-6 py-4">Cajero</th>
                  <th className="px-6 py-4">Artículos</th>
                  <th className="px-6 py-4 text-center">Método</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-10 text-zinc-500">Cargando...</td></tr>
                ) : sales.map((sale) => {
                  const isDevuelto = !!sale.refund;
                  return (
                    <tr key={sale.id} className={`${isDevuelto ? 'bg-red-50/30 opacity-75' : 'hover:bg-zinc-50'}`}>
                      <td className="px-6 py-4 text-sm font-medium">{new Date(sale.createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4 text-sm">{sale.user.name}</td>
                      <td className="px-6 py-4 text-sm">{sale.items[0]?.product.name} {sale.items.length > 1 && `(+${sale.items.length - 1})`}</td>
                      <td className="px-6 py-4 text-center text-xs">{sale.paymentMethod}</td>
                      <td className={`px-6 py-4 text-right font-bold text-lg ${isDevuelto ? 'text-red-500 line-through' : 'text-zinc-900'}`}>${sale.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        {isDevuelto ? (
                          <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-md">DEVUELTO</span>
                        ) : (
                          <button onClick={() => handleRefund(sale.id)} className="text-xs font-medium text-red-600 hover:text-white border border-red-200 hover:bg-red-500 transition-colors px-3 py-1.5 rounded-lg">
                            Devolver
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}