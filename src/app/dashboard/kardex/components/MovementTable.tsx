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
};

export default function MovementTable({ movements, isLoading }: TableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-zinc-50/90 border-b border-zinc-200">
            <tr className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Fecha y Hora</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4 text-center">Cantidad</th>
              <th className="px-6 py-4">Motivo / Concepto</th>
              <th className="px-6 py-4 text-right">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10 text-zinc-500">Cargando historial de movimientos...</td></tr>
            ) : movements.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-zinc-500">No se encontraron movimientos con los filtros aplicados.</td></tr>
            ) : (
              movements.map((mv) => {
                // Validación defensiva: Si no encuentra el tipo, evita que la app muera
                const badge = typeBadges[mv.type] || { label: mv.type, className: 'bg-zinc-100 text-zinc-700 border-zinc-200' };
                
                // Mapear visualmente si es una merma de forma dinámica
                const isMerma = mv.reason?.toLowerCase().includes('merma') || mv.reason?.toLowerCase().includes('dañ');
                const labelToShow = isMerma ? 'Merma' : badge.label;
                const classToShow = isMerma ? 'bg-red-50 text-red-700 border-red-200' : badge.className;

                return (
                  <tr key={mv.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(mv.createdAt).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900">{mv.product?.name || 'Producto Eliminado'}</p>
                      {mv.product?.barcode && <p className="text-xs text-zinc-400">Cód: {mv.product.barcode}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${classToShow}`}>
                        {labelToShow}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      <span className={mv.type === 'IN' || mv.type === 'INPUT' ? 'text-emerald-600' : 'text-zinc-900'}>
                        {mv.type === 'IN' || mv.type === 'INPUT' ? '+' : '-'}{mv.product?.isByWeight ? `${mv.quantity.toFixed(3)} kg` : `${mv.quantity} pza`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 italic max-w-[250px] truncate" title={mv.reason || ''}>
                      {mv.reason || <span className="text-zinc-300">Sin descripción</span>}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-500">
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