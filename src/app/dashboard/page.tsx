'use client';

import React, { useEffect, useState } from 'react';
import KpiCards from './components/KpiCards';
import WeeklyChart from './components/WeeklyChart';
import TopProducts from './components/TopProducts';
import PaymentBreakdown from './components/PaymentBreakdown';
import CriticalStock from './components/CriticalStock';

export interface DashboardData {
  kpis: { revenue: number; netProfit: number; salesCount: number; lowStockCount: number; };
  chartData: Array<{ dia: string; ventas: number; ganancia: number }>;
  topProducts: Array<{ name: string; qty: number }>;
  breakdown: { CASH: number; CARD: number; TRANSFER: number; CREDIT: number; };
  lowStockList: Array<{ name: string; stock: number }>;
}

export default function DashboardPrincipalPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats') 
      .then(res => res.json())
      .then(json => {
        if (!json.error) setData(json);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
        <p className="text-zinc-500 text-sm font-medium animate-pulse">Compilando analíticas generales...</p>
      </div>
    );
  }
 
  if (!data) return null;

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <div className="max-w-screen-xl mx-auto space-y-8">
        
        {/* CABECERA */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Resumen de Operaciones</h1>
          <p className="text-sm text-zinc-500 mt-1">Monitorea los ingresos, márgenes de utilidad y el rendimiento logístico semanal.</p>
        </div>

        <KpiCards kpis={data.kpis} />

        <WeeklyChart chartData={data.chartData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <PaymentBreakdown desglose={data.breakdown} />
          <TopProducts products={data.topProducts} />
          <CriticalStock items={data.lowStockList} />
        </div>

      </div>
    </div>
  );
}