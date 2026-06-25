import React from 'react';
import { Sale } from '../page';

interface SalesTableProps {
  sales: Sale[];
  isLoading: boolean;
  onRefund: (id: string) => void;
}

const METODOS_ESPAÑOL: Record<string, { texto: string; dot: string }> = {
  CASH:     { texto: 'Efectivo',        dot: 'bg-emerald-500' },
  CARD:     { texto: 'Tarjeta',         dot: 'bg-blue-500' },
  TRANSFER: { texto: 'Transferencia',   dot: 'bg-purple-500' },
  CREDIT:   { texto: 'Crédito', dot: 'bg-amber-500' },
};

export default function SalesTable({ sales, isLoading, onRefund }: SalesTableProps) {
  
  const getMetodo = (codigo: string) => {
    return METODOS_ESPAÑOL[codigo?.toUpperCase()] || { texto: codigo, dot: 'bg-zinc-400' };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse min-w-[800px]">
          <thead className="bg-zinc-50/90 border-b border-zinc-200">
            <tr className="text-zinc-400 text-[11px] uppercase tracking-wider font-bold">
              <th className="px-6 py-3.5">Fecha y Hora</th>
              <th className="px-6 py-3.5">Cajero</th>
              <th className="px-6 py-3.5">Artículos</th>
              <th className="px-6 py-3.5 text-center">Método de Pago</th>
              <th className="px-6 py-3.5 text-right">Importe</th>
              <th className="px-6 py-3.5 text-center">Auditoría</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs">
            
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-zinc-400 font-medium">Descargando bitácora de tickets...</td></tr>
            ) : sales.map((sale) => {
              const isDevuelto = !!sale.refund;
              const configMetodo = getMetodo(sale.paymentMethod);

              return (
                <tr key={sale.id} className={`transition-colors ${isDevuelto ? 'bg-red-50/25 text-zinc-400' : 'hover:bg-zinc-50/80 text-zinc-700'}`}>
                  
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {new Date(sale.createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  
                  <td className="px-6 py-4 font-semibold">{sale.user.name}</td>
                  
                  <td className="px-6 py-4">
                    <span className="font-bold text-zinc-900">{sale.items[0]?.product.name}</span>
                    {sale.items.length > 1 && <span className="text-zinc-400 font-normal ml-1">(+{sale.items.length - 1} más)</span>}
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-zinc-700 font-semibold text-[12px]">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${configMetodo.dot}`} />
                      <span>{configMetodo.texto}</span>
                    </span>
                  </td>
                  
                  <td className={`px-6 py-4 text-right font-mono font-bold text-sm ${isDevuelto ? 'text-red-400 line-through' : 'text-zinc-900'}`}>
                    ${sale.total.toFixed(2)}
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    {isDevuelto ? (
                      <span className="text-[10px] font-black text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded">DEVUELTO</span>
                    ) : (
                      <button 
                        onClick={() => onRefund(sale.id)} 
                        className="text-[11px] font-bold text-red-600 hover:text-white border border-red-200 hover:bg-red-600 transition-all px-3 py-1 rounded-lg active:scale-90"
                      >
                        Devolver
                      </button>
                    )}
                  </td>

                </tr>
              );
            })}

            {sales.length === 0 && !isLoading && (
              <tr><td colSpan={6} className="text-center py-12 text-zinc-400">No se encontraron ventas en este rango de fechas.</td></tr>
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}