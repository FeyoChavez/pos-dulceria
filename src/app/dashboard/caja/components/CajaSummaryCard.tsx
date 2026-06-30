import { formatMoney } from '@/lib/utils/format';
import React from 'react';
import { EyeOff } from 'lucide-react'; 

interface CajaSummaryCardProps {
  data: {
    openedAt: string;
    openingBalance: number;
    cashSales: number;
    cardSales: number;
    cashRefunds: number;
    totalExpenses?: number;
    expectedBalance: number;
  };
  isAdmin?: boolean; 
}

export default function CajaSummaryCard({ data, isAdmin = false }: CajaSummaryCardProps) {
  
  // Si es admin muestra el dinero, si no, muestra asteriscos.
  const displayMoney = (amount: number) => isAdmin ? formatMoney(amount) : '***';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 relative overflow-hidden">
      
      {/* Indicador visual de modo ciego para el cajero */}
      {!isAdmin && (
        <div className="absolute top-0 right-0 bg-zinc-100 px-3 py-1 rounded-bl-xl border-b border-l border-zinc-200 flex items-center gap-1.5">
          <EyeOff className="w-3 h-3 text-zinc-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Corte Ciego Activo</span>
        </div>
      )}

      <div className="flex justify-between items-center border-b border-zinc-100 pb-4 mb-4 mt-2">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Caja Abierta</span>
          <p className="text-xs text-zinc-400 mt-1">Iniciada a las {new Date(data.openedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="text-right pr-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Fondo Inicial</span>
          {/* El fondo inicial sí se lo podemos mostrar al cajero porque él lo contó al entrar */}
          <p className="text-sm font-bold font-mono text-zinc-800">{formatMoney(data.openingBalance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3">
          <span className="text-[11px] text-zinc-500 font-bold block">Ventas Efectivo</span>
          <p className="text-base font-bold font-mono text-zinc-900 mt-0.5">{displayMoney(data.cashSales)}</p>
        </div>
        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3">
          <span className="text-[11px] text-zinc-500 font-bold block">Ventas Tarjeta</span>
          <p className="text-base font-bold font-mono text-zinc-900 mt-0.5">{displayMoney(data.cardSales)}</p>
        </div>
        <div className="bg-red-50/50 border border-red-100 rounded-xl p-3">
          <span className="text-[11px] text-red-600 font-bold block">Devoluciones</span>
          <p className="text-base font-bold font-mono text-red-700 mt-0.5">-{displayMoney(data.cashRefunds)}</p>
        </div>
        <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3">
          <span className="text-[11px] text-amber-800 font-bold block">Gastos (Caja Chica)</span>
          <p className="text-base font-bold font-mono text-amber-900 mt-0.5">-{displayMoney(data.totalExpenses || 0)}</p>
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-4 flex justify-between items-end">
        <div>
          <span className="text-sm font-bold text-zinc-700">Efectivo Físico Esperado</span>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mt-0.5">Fondo + Efectivo - Devoluciones - Gastos</p>
        </div>
        <span className="text-3xl font-black font-mono text-zinc-900 tracking-tight">
          {displayMoney(data.expectedBalance)}
        </span>
      </div>
    </div>
  );
}