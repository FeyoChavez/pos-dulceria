'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MovementFilters from '../components/MovementFilters';
import MovementTable from '../components/MovementTable';

export default function HistorialMovimientosPage() {
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Por defecto carga los últimos 30 días
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('ALL');
  const [search, setSearch] = useState('');

  const [metrics, setMetrics] = useState({ entries: 0, exits: 0, wastes: 0 });

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ startDate, endDate, type, search }).toString();
      const res = await fetch(`/api/kardex/movements?${query}`);
      if (res.ok) {
        const data = await res.json();
        setMovements(data);
        
        let entries = 0, exits = 0, wastes = 0;
        data.forEach((m: any) => {
          if (m.type === 'IN') {
            entries += m.quantity;
          } else if (m.type === 'OUT') {
            if (m.reason?.toLowerCase().includes('merma') || m.reason?.toLowerCase().includes('dañ')) {
              wastes += m.quantity;
            } else {
              exits += m.quantity;
            }
          }
        });
        setMetrics({ entries, exits, wastes });
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
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900">
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">Kardex de Inventario</h1>
          <p className="text-sm text-zinc-500 mt-1">Registro inmutable de todas las entradas, salidas y mermas de almacén.</p>
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