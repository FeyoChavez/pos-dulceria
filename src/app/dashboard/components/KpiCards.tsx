import { formatMoney } from '@/lib/utils/format';
import React from 'react';

interface KpiCardsProps {
  kpis: { revenue: number; netProfit: number; salesCount: number; lowStockCount: number; };
}

export default function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-between">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ingresos Brutos (7d)</span>
        <span className="text-3xl font-black text-zinc-900 mt-2">{formatMoney(kpis.revenue)}</span>
        <span className="text-[10px] text-zinc-400 mt-1">Suma total facturada</span>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-between">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Utilidad Neta (Ganancia)</span>
        <span className="text-3xl font-black text-indigo-600 mt-2">{formatMoney(kpis.netProfit)}</span>
        <span className="text-[10px] text-indigo-400 mt-1">Descontando costo de catálogo</span>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-between">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tickets Emitidos</span>
        <span className="text-3xl font-black text-zinc-900 mt-2">{kpis.salesCount} tickets</span>
        <span className="text-[10px] text-zinc-400 mt-1">Transacciones completadas</span>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-between">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Alertas de Almacén</span>
        <span className={`text-3xl font-black mt-2 ${kpis.lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
          {kpis.lowStockCount}
        </span>
        <span className="text-[10px] text-zinc-400 mt-1">Productos con stock crítico (≤ 5)</span>
      </div>
    </div>
  );
}