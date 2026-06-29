'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MovementFilters from '../components/MovementFilters';
import MovementTable from '../components/MovementTable';

// Helper local inflexible (Evita saltos de fecha UTC a las 6pm)
const getTodayLocal = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HistorialMovimientosPage() {
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState(getTodayLocal);
  const [endDate, setEndDate] = useState(getTodayLocal);
  const [type, setType] = useState('ALL');
  const [search, setSearch] = useState('');

  const [metrics, setMetrics] = useState({
    entries: { pzas: 0, kg: 0 },
    exits:   { pzas: 0, kg: 0 },
    wastes:  { pzas: 0, kg: 0 }
  });

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ startDate, endDate, type, search }).toString();
      const res = await fetch(`/api/kardex/movements?${query}`);
      
      if (res.ok) {
        const data = await res.json();
        setMovements(data);
        
        let entPzas = 0, entKg = 0;
        let extPzas = 0, extKg = 0;
        let wstPzas = 0, wstKg = 0;

        data.forEach((m: any) => {
          const q = Number(m.quantity || 0);
          const isBulk = Boolean(m.product?.isByWeight);

          // Clasificar si suma stock
          if (['IN', 'INPUT', 'PURCHASE'].includes(m.type)) {
            if (isBulk) entKg += q;
            else entPzas += q;
          } 
          // Clasificar si resta stock (Venta o Merma)
          else if (['OUT', 'OUTPUT', 'SALE'].includes(m.type)) {
            const r = (m.reason || '').toLowerCase();
            const isMerma = r.includes('merma') || r.includes('dañ') || r.includes('rot') || r.includes('caduc');

            if (isMerma) {
              if (isBulk) wstKg += q;
              else wstPzas += q;
            } else {
              if (isBulk) extKg += q;
              else extPzas += q;
            }
          }
        });

        setMetrics({
          entries: { pzas: entPzas, kg: entKg },
          exits:   { pzas: extPzas, kg: extKg },
          wastes:  { pzas: wstPzas, kg: wstKg }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, type, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchMovements(), 250);
    return () => clearTimeout(timer);
  }, [fetchMovements]);

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Kardex Universal de Almacén</h1>
          <p className="text-xs text-zinc-500 mt-1">Bitácora inmutable de entradas por compra, salidas por venta y mermas declaradas.</p>
        </div>

        <MovementFilters
          startDate={startDate} endDate={endDate} type={type} search={search}
          setStartDate={setStartDate} setEndDate={setEndDate} setType={setType} setSearch={setSearch}
          metrics={metrics}
        />

        <MovementTable movements={movements} isLoading={isLoading} />
      </div>
    </div>
  );
}