import React from 'react';

interface Movement {
  id: string;
  quantity: number;
  type: string; 
  reason: string | null;
  createdAt: string;
  product: { name: string; barcode: string | null; isByWeight: boolean };
  user: { name: string | null } | null;
}

interface TableProps {
  movements: Movement[];
  isLoading: boolean;
}

const typeBadges: Record<string, { label: string, className: string }> = {
  IN: { label: 'Entrada', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  INPUT: { label: 'Entrada', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  OUT: { label: 'Salida', className: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
  OUTPUT: { label: 'Salida', className: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
  SALE: { label: 'Venta POS', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  PURCHASE: { label: 'Compra Almacén', className: 'bg-blue-50 text-blue-700 border-blue-200' }, 
};

export default function MovementTable({ movements, isLoading }: TableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px] table-fixed">
          
          <thead className="bg-zinc-50/90 border-b border-zinc-200">
            <tr className="text-zinc-500 text-xs uppercase tracking-wider font-bold">
              <th className="px-5 py-4 w-[16%]">Fecha y Hora</th>
              <th className="px-5 py-4 w-[24%]">Producto</th>
              <th className="px-5 py-4 w-[12%]">Tipo</th>
              <th className="px-5 py-4 w-[12%] text-center">Piezas</th>
              <th className="px-5 py-4 w-[24%]">Motivo / Bitácora</th>
              <th className="px-5 py-4 w-[12%] text-right">Usuario</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 text-sm">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-zinc-400 font-medium">Cargando bitácora de movimientos...</td></tr>
            ) : movements.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-zinc-400 font-medium">No se registraron movimientos con estos filtros.</td></tr>
            ) : (
              movements.map((mv) => {
                const badge = typeBadges[mv.type] || { label: mv.type, className: 'bg-zinc-100 text-zinc-700 border-zinc-200' };
                
                const isMerma = mv.reason?.toLowerCase().includes('merma') || mv.reason?.toLowerCase().includes('dañ') || mv.reason?.toLowerCase().includes('rot');
                const labelToShow = isMerma ? 'Merma' : badge.label;
                const classToShow = isMerma ? 'bg-red-50 text-red-700 border-red-200 font-bold' : badge.className;

                const isPositive = ['IN', 'INPUT', 'PURCHASE'].includes(mv.type);

                return (
                  <tr key={mv.id} className="hover:bg-zinc-50/60 transition-colors align-top">
                    
                    <td className="px-5 py-4 text-zinc-500 text-xs font-mono">
                      {new Date(mv.createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="px-5 py-4 pr-2">
                      <p className="font-bold text-zinc-900 leading-snug break-words">{mv.product?.name || 'Producto Eliminado'}</p>
                      {mv.product?.barcode && <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{mv.product.barcode}</p>}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] border ${classToShow}`}>
                        {labelToShow}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center font-mono font-black text-xs">
                      <span className={isPositive ? 'text-emerald-600' : 'text-zinc-900'}>
                        {isPositive ? '+' : '-'}{mv.product?.isByWeight ? `${mv.quantity.toFixed(3)} kg` : `${mv.quantity}`}
                      </span>
                    </td>

                     <td className="px-5 py-4 text-xs text-zinc-600 font-medium leading-relaxed break-words pr-4">
                      {mv.reason || <span className="text-zinc-300 italic">Movimiento sin descripción</span>}
                    </td>

                    <td className="px-5 py-4 text-right text-xs text-zinc-500 font-medium truncate">
                      {mv.user?.name || 'Sistema'}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}