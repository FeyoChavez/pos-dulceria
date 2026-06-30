import { formatMoney } from '@/lib/utils/format';
import React from 'react';

interface OrderSummaryProps {
  itemsCount: number;
  totalVenta: number;
  isCobrande: boolean;
  onCobrar: () => void;
}

export default function OrderSummary({ itemsCount, totalVenta, isCobrande, onCobrar }: OrderSummaryProps) {
  return (
    <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-zinc-900 mb-6">Resumen de Venta</h2>
        <div className="space-y-4 text-sm text-zinc-600">
          <div className="flex justify-between items-center py-2 border-b border-zinc-100">
            <span>Total de artículos</span>
            <span className="font-medium text-zinc-900">{itemsCount}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-zinc-100">
            <span>Subtotal base</span>
            <span className="font-medium text-zinc-900">{formatMoney(totalVenta)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-200">
        <div className="flex justify-between items-end mb-6">
          <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total a Pagar</span>
          <span className="text-4xl font-bold text-zinc-900 tracking-tight">{formatMoney(totalVenta)}</span>
        </div>
        <button
          onClick={onCobrar}
          disabled={itemsCount === 0 || isCobrande}
          className="w-full bg-zinc-900 text-white py-4 px-6 rounded-xl font-medium text-lg shadow-md shadow-zinc-900/20 hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isCobrande ? 'Imprimiendo...' : 'Cobrar e Imprimir'}
        </button>
        <p className="text-center text-xs text-zinc-400 mt-3">Presiona F12 para cobrar rápidamente</p>
      </div>
    </div>
  );
}