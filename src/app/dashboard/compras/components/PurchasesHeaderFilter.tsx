import React from 'react';
import Link from 'next/link';
import { Plus, Calendar, RefreshCw } from 'lucide-react';

interface PurchasesHeaderFilterProps {
  startDate: string;
  endDate: string;
  onStartChange: (val: string) => void;
  onEndChange: (val: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function PurchasesHeaderFilter({
  startDate, endDate, onStartChange, onEndChange, onRefresh, isLoading
}: PurchasesHeaderFilterProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Historial de Almacén</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Audita las notas de entrada de inventario y sus costos.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        {/* FILTROS DE FECHA */}
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 shadow-inner">
        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        <input 
            type="date" 
            value={startDate} 
            onChange={e => onStartChange(e.target.value)} 
            className="bg-transparent outline-none cursor-pointer text-zinc-900 font-semibold focus:text-zinc-900" 
        />
        <span className="text-zinc-300 font-normal">al</span>
        <input 
            type="date" 
            value={endDate} 
            onChange={e => onEndChange(e.target.value)} 
            className="bg-transparent outline-none cursor-pointer text-zinc-900 font-semibold focus:text-zinc-900" 
        />
        </div>

        <button 
          onClick={onRefresh} disabled={isLoading} title="Recargar lista"
          className="p-2.5 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 rounded-xl text-zinc-600 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        <Link 
          href="/dashboard/compras/nueva" 
          className="flex-1 md:flex-none bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" /> Recibir Mercancía
        </Link>
      </div>

    </div>
  );
}