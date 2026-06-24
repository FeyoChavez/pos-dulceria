import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface CriticalStockProps {
  items: Array<{ name: string; stock: number }>;
}

export default function CriticalStock({ items }: CriticalStockProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-between h-full">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500" /> Surtir de Nuevo
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Artículos en vitrina próximos a agotarse (≤ 5).</p>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const isZero = item.stock <= 0;
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <p className="text-xs font-semibold text-zinc-800 truncate max-w-[180px]">{item.name}</p>
                
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                  isZero ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isZero ? 'Agotado' : `${item.stock} uds`}
                </span>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="text-center py-12 text-zinc-400 text-xs">
              ¡Excelente almacén! Ningún producto en riesgo.
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
        <span>Prioridad logística</span>
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
      </div>
    </div>
  );
}