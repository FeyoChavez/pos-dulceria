import React from 'react';
import { DollarSign, Receipt, ArrowDownRight } from 'lucide-react';
import { formatMoney } from '@/lib/utils/format';

interface SalesKpisProps {
  totalIngresos: number;
  totalTickets: number;
  totalDevuelto: number;
}

export default function SalesKpis({ totalIngresos, totalTickets, totalDevuelto }: SalesKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200 flex flex-col justify-between">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Ingresos Netos
        </span>
        <span className="block text-2xl font-black text-zinc-900 mt-2">{formatMoney(totalIngresos)}</span>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200 flex flex-col justify-between">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
          <Receipt className="w-3.5 h-3.5 text-blue-500" /> Tickets Válidos
        </span>
        <span className="block text-2xl font-black text-zinc-900 mt-2">{totalTickets}</span>
      </div>

      <div className={`rounded-2xl p-5 shadow-sm border transition-all flex flex-col justify-between ${
        totalDevuelto > 0 ? 'bg-red-50/50 border-red-200 text-red-950' : 'bg-white border-zinc-200 text-zinc-400 opacity-60'
      }`}>
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          <ArrowDownRight className="w-3.5 h-3.5 text-red-500" /> Devoluciones
        </span>
        <span className={`block text-2xl font-black mt-2 ${totalDevuelto > 0 ? 'text-red-600' : 'text-zinc-400'}`}>
          {formatMoney(totalDevuelto)}
        </span>
      </div>
    </div>
  );
}