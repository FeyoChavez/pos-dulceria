import React from 'react';

interface MetricUnit {
  pzas: number;
  kg: number;
}

interface FiltersProps {
  startDate: string;
  endDate: string;
  type: string;
  search: string;
  setStartDate: (val: string) => void;
  setEndDate: (val: string) => void;
  setType: (val: string) => void;
  setSearch: (val: string) => void;
  metrics: { entries: MetricUnit; exits: MetricUnit; wastes: MetricUnit };
}

export default function MovementFilters({
  startDate, endDate, type, search,
  setStartDate, setEndDate, setType, setSearch, metrics
}: FiltersProps) {
  return (
    <div className="space-y-6 mb-6">
      
      {/* TARJETAS DUALES (PIEZAS vs GRANEL) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* ENTRADAS */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Entradas Totales</span>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap font-mono">
            <div>
              <span className="text-2xl font-black text-emerald-600">+{metrics.entries.pzas}</span>
              <span className="text-[10px] font-bold text-zinc-400 ml-1">pzas</span>
            </div>
            {metrics.entries.kg > 0 && (
              <div className="border-l border-zinc-200 pl-2">
                <span className="text-2xl font-black text-emerald-600">+{metrics.entries.kg.toFixed(2)}</span>
                <span className="text-[10px] font-bold text-zinc-400 ml-1">kg</span>
              </div>
            )}
          </div>
        </div>

        {/* SALIDAS / VENTAS */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Salidas / Ventas POS</span>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap font-mono">
            <div>
              <span className="text-2xl font-black text-zinc-900">-{metrics.exits.pzas}</span>
              <span className="text-[10px] font-bold text-zinc-400 ml-1">pzas</span>
            </div>
            {metrics.exits.kg > 0 && (
              <div className="border-l border-zinc-200 pl-2">
                <span className="text-2xl font-black text-zinc-900">-{metrics.exits.kg.toFixed(2)}</span>
                <span className="text-[10px] font-bold text-zinc-400 ml-1">kg</span>
              </div>
            )}
          </div>
        </div>

        {/* MERMAS */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Mermas Declaradas</span>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap font-mono">
            <div>
              <span className="text-2xl font-black text-red-600">-{metrics.wastes.pzas}</span>
              <span className="text-[10px] font-bold text-zinc-400 ml-1">pzas</span>
            </div>
            {metrics.wastes.kg > 0 && (
              <div className="border-l border-zinc-200 pl-2">
                <span className="text-2xl font-black text-red-600">-{metrics.wastes.kg.toFixed(2)}</span>
                <span className="text-[10px] font-bold text-zinc-400 ml-1">kg</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <div className="lg:col-span-2">
          <label className="block text-xs font-bold text-zinc-600 mb-1">Buscar Producto</label>
          <input type="text" placeholder="Nombre o código..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900" />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-600 mb-1">Tipo de Movimiento</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900">
            <option value="ALL">Todos los movimientos</option>
            <option value="IN">Solo Entradas (+)</option>
            <option value="OUT">Solo Salidas / Mermas (-)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-600 mb-1">Desde</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 outline-none cursor-pointer" />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-600 mb-1">Hasta</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 outline-none cursor-pointer" />
        </div>
      </div>
    </div>
  );
}