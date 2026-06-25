'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { AlertTriangle } from 'lucide-react';
import SalesFilterBar from './components/SalesFilterBar';
import SalesKpis from './components/SalesKpis';
import SalesTable from './components/SalesTable';

export interface SaleItem {
  id: string;
  quantity: number;
  priceSnap: number;
  refunded: boolean;
  product: { 
    name: string,
    isByWeight: boolean 
  }
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

interface RefundModalState {
  isOpen: boolean;
  type: 'FULL' | 'PARTIAL';
  saleId: string;
  itemId?: string;
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

  const [refundModal, setRefundModal] = useState<RefundModalState>({ isOpen: false, type: 'FULL', saleId: '' });
  const [isProcessing, setIsProcessing] = useState(false);

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

  const openFullRefundModal = (saleId: string) => setRefundModal({ isOpen: true, type: 'FULL', saleId });
  const openPartialRefundModal = (saleId: string, itemId: string) => setRefundModal({ isOpen: true, type: 'PARTIAL', saleId, itemId });
  const closeModal = () => { if (!isProcessing) setRefundModal({ isOpen: false, type: 'FULL', saleId: '' }); };

  const executeRefund = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("Procesando devolución en el inventario...");

    try {
      const endpoint = refundModal.type === 'FULL' ? '/api/sales/refund' : '/api/sales/refund-item';
      const payload = refundModal.type === 'FULL' 
        ? { saleId: refundModal.saleId, restock: true }
        : { saleId: refundModal.saleId, itemId: refundModal.itemId };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.update(toastId, { render: "Devolución aplicada con éxito", type: "success", isLoading: false, autoClose: 3000 });
        closeModal();
        fetchSales(); 
      } else {
        toast.update(toastId, { render: data.error || "Rechazado por el servidor", type: "error", isLoading: false, autoClose: 4000 });
      }
    } catch {
      toast.update(toastId, { render: "Fallo de red al intentar devolver", type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setIsProcessing(false);
    }
  };

  let totalIngresos = 0;
  let totalDevuelto = 0;
  let totalTicketsValidos = 0;

  sales.forEach(sale => {
    const isAutoAnulado = sale.total <= 0.05; 
    const isTotalmenteDevuelto = !!sale.refund || isAutoAnulado;

    if (isTotalmenteDevuelto) {
      // Si el ticket se anuló por completo, TODO lo que valía es devolución
      totalDevuelto += (sale.refund ? sale.total : 0); 
      if (isAutoAnulado && !sale.refund) {
         sale.items.forEach(item => {
           totalDevuelto += (item.quantity * item.priceSnap);
         });
      }
    } else {
      // Si el ticket sigue vivo, sumamos su valor actual 
      totalIngresos += Math.max(0, sale.total);
      totalTicketsValidos += 1;
      
      // sumamos el dinero exacto de las piezas devueltas
      sale.items.forEach(item => {
        if (item.refunded) {
          totalDevuelto += (item.quantity * item.priceSnap);
        }
      });
    }
  });

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white relative">
      <div className="max-w-screen-xl mx-auto space-y-6">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Historial de Ventas</h1>
            <p className="text-sm text-zinc-500 mt-1">Auditoría de comprobantes emitidos y gestión de retornos de stock.</p>
          </div>
        </div>

        <SalesFilterBar 
          startDate={startDate} endDate={endDate}
          onStartChange={setStartDate} onEndChange={setEndDate}
          onSearch={fetchSales} isLoading={isLoading}
        />

        <SalesKpis 
          totalIngresos={totalIngresos} 
          totalTickets={totalTicketsValidos} 
          totalDevuelto={totalDevuelto} 
        />

        <SalesTable 
          sales={sales} 
          isLoading={isLoading} 
          onRefund={openFullRefundModal} 
          onRefundItem={openPartialRefundModal} 
        />

      </div>

      {refundModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200">
            
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-black text-zinc-900 leading-tight">
                {refundModal.type === 'FULL' ? '¿Anular ticket completo?' : '¿Devolver artículo?'}
              </h3>
              
              <p className="text-sm text-zinc-500 font-medium">
                {refundModal.type === 'FULL' 
                  ? 'El monto total se descontará de los ingresos del día y todos los artículos regresarán al inventario.' 
                  : 'El valor de esta pieza se restará del ticket original y su stock regresará al inventario.'}
              </p>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mt-2">
                Esta acción no se puede deshacer
              </p>
            </div>
            
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
              <button 
                onClick={closeModal}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={executeRefund}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Confirmar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}