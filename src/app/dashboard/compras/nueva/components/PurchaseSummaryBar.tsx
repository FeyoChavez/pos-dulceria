import React from 'react';
import { ArrowDownToLine, Lock } from 'lucide-react';
import { formatMoney } from '@/lib/utils/format';

interface PurchaseSummaryBarProps {
  total: number;
  itemCount: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  disabled: boolean;
}

export default function PurchaseSummaryBar({ total, itemCount, onSubmit, isSubmitting, disabled }: PurchaseSummaryBarProps) {
  return (
    <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-6 z-20 border border-zinc-800">
      <div>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Inversión Total en Mercancía</span>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-3xl font-black font-mono tracking-tight">{formatMoney(total)}</span>
          <span className="text-xs text-zinc-400 font-medium">({itemCount} renglones)</span>
        </div>
      </div>

      <button 
        type="button" 
        onClick={onSubmit} 
        disabled={disabled || isSubmitting}
        className={`w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 transition-all ${
          disabled || isSubmitting
            ? 'bg-zinc-800/80 text-zinc-600 border border-zinc-700/40 cursor-not-allowed shadow-none select-none'
            : 'bg-white text-zinc-950 hover:bg-zinc-100 active:scale-95 cursor-pointer shadow-lg shadow-white/5'
        }`}
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
        ) : disabled ? (
          <>
            <Lock className="w-4 h-4 text-zinc-600" /> Faltan datos para procesar
          </>
        ) : (
          <>
            <ArrowDownToLine className="w-4 h-4 text-zinc-900" /> Registrar Entrada a Almacén
          </>
        )}
      </button>
    </div>
  );
}