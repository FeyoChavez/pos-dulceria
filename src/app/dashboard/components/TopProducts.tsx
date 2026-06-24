import React from 'react';

interface TopProductsProps {
  products: Array<{ name: string; qty: number }>;
}

export default function TopProducts({ products }: TopProductsProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-between h-full">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900">Dulces más Populares</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Top 5 de artículos con mayor rotación en vitrina.</p>
        </div>

        <div className="space-y-3">
          {products.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-md bg-zinc-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                  {index + 1}
                </span>
                <p className="text-xs font-semibold text-zinc-800 truncate max-w-[160px]">{product.name}</p>
              </div>
              <span className="text-xs font-black text-zinc-500 font-mono">{product.qty} uds</span>
            </div>
          ))}
          
          {products.length === 0 && (
            <div className="text-center py-12 text-zinc-400 text-xs">Sin ventas registradas.</div>
          )}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
        <span>Métricas automatizadas</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </div>
  );
}