'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PurchasesHeaderFilter from './components/PurchasesHeaderFilter';
import PurchasesTable from './components/PurchasesTable';
import PurchaseDetailModal from './components/PurchaseDetailModal';

// Helper para obtener la fecha local de hoy en formato YYYY-MM-DD sin desfases de UTC
const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HistorialComprasPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [startDate, setStartDate] = useState(() => getLocalDateString(new Date()));
  const [endDate, setEndDate] = useState(() => getLocalDateString(new Date()));
  
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    try {
      const res = await fetch(`/api/purchases?${params.toString()}`);
      if (res.ok) {
        setPurchases(await res.json());
      } else {
        toast.error("No se pudo cargar el historial");
      }
    } catch { 
      toast.error("Error de conexión"); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { 
    fetchHistory(); 
  }, [startDate, endDate]);

  return (
    <div className="min-h-full bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <PurchasesHeaderFilter
          startDate={startDate} endDate={endDate}
          onStartChange={setStartDate} onEndChange={setEndDate}
          onRefresh={fetchHistory} isLoading={isLoading}
        />

        <PurchasesTable
          purchases={purchases} isLoading={isLoading}
          onSelect={setSelectedPurchase}
        />

        <PurchaseDetailModal
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />

      </div>
    </div>
  );
}