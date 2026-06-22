import React from 'react';

interface FiltersProps {
  startDate: string;
  endDate: string;
  type: string;
  search: string;
  setStartDate: (val: string) => void;
  setEndDate: (val: string) => void;
  setType: (val: string) => void;
  setSearch: (val: string) => void;
  metrics: { entries: number; exits: number; wastes: number };
}

export default function MovementFilters({
  startDate, endDate, type, search,
  setStartDate, setEndDate, setType, setSearch, metrics
}: FiltersProps) {
  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Entradas Totales</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1">+{metrics.entries}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Salidas / Ventas</span>
          <span className="text-2xl font-bold text-zinc-900 mt-1">-{metrics.exits}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Mermas Declaradas</span>
          <span className="text-2xl font-bold text-red-600 mt-1">-{metrics.wastes}</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-zinc-600 mb-1">Buscar Producto</label>
          <input type="text" placeholder="Nombre o código..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Movimiento</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium">
            <option value="ALL">Todos los tipos</option>
            <option value="IN">Solo Entradas (+)</option>
            <option value="OUT">Solo Salidas (-)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Desde</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Hasta</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" />
        </div>
      </div>
    </div>
  );
}