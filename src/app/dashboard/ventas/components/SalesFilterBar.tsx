import React from 'react';
import { Calendar, Search } from 'lucide-react';

interface SalesFilterBarProps {
  startDate: string;
  endDate: string;
  onStartChange: (val: string) => void;
  onEndChange: (val: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export default function SalesFilterBar({ startDate, endDate, onStartChange, onEndChange, onSearch, isLoading }: SalesFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Fecha Inicial
        </label>
        <input 
          type="date" value={startDate} onChange={e => onStartChange(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all" 
        />
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Fecha Final
        </label>
        <input 
          type="date" value={endDate} onChange={e => onEndChange(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all" 
        />
      </div>

      <button 
        onClick={onSearch} disabled={isLoading}
        className="bg-zinc-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all h-[36px] flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
      >
        <Search className="w-3.5 h-3.5" />
        <span>{isLoading ? 'Buscando...' : 'Filtrar Tickets'}</span>
      </button>
    </div>
  );
}