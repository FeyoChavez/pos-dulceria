'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AuditTable from './components/AuditTable';
import AuditDetailPanel from './components/AuditDetailPanel';

interface AuditReport {
  id: string;
  cashier: string;
  openedAt: string;
  closedAt: string;
  openingBalance: number;
  expectedBalance: number;
  closingBalance: number;
  difference: number;
  cashSales: number;
  cardSales: number;
  totalSales: number;
  salesCount: number;
  totalRefunded: number;
  salesDetail: any[];
}

export default function AuditoriaPage() {
  const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  };

  const [reports, setReports] = useState<AuditReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<AuditReport | null>(null);
  
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());

  const fetchAudit = useCallback(async () => {
    setIsLoading(true);
    setSelectedSession(null); 
    try {
      const res = await fetch(`/api/audit?startDate=${startDate}&endDate=${endDate}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  return (
    <div className="h-full bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LADO IZQUIERDO */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Auditoría de Cortes de Caja</h1>
              <p className="text-sm text-zinc-500 mt-1">Historial detallado de arqueos, cierres de turno y discrepancias de efectivo.</p>
            </div>
          </div>

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
              onClick={fetchAudit}
              className="bg-zinc-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all h-[38px] flex items-center justify-center"
            >
              Filtrar turno
            </button>
          </div>

          <AuditTable 
            isLoading={isLoading} 
            reports={reports} 
            selectedSessionId={selectedSession?.id}
            onSelectSession={setSelectedSession}
          />
        </div>

        {/* LADO DERECHO */}
        <AuditDetailPanel session={selectedSession} />

      </div>
    </div>
  );
}