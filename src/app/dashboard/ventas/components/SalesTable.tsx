import React, { useState } from 'react';
import { Sale } from '../page';
import { ChevronDown, ChevronRight, CornerDownRight, Package } from 'lucide-react';
import { formatMoney } from '@/lib/utils/format';

interface SalesTableProps {
  sales: Sale[];
  isLoading: boolean;
  onRefund: (id: string) => void;
  onRefundItem?: (saleId: string, itemId: string) => void;
}

const METODOS_ESPAÑOL: Record<string, { texto: string; dot: string }> = {
  CASH:     { texto: 'Efectivo',        dot: 'bg-emerald-500' },
  CARD:     { texto: 'Tarjeta',         dot: 'bg-blue-500' },
  TRANSFER: { texto: 'Transferencia',   dot: 'bg-purple-500' },
  CREDIT:   { texto: 'Crédito',         dot: 'bg-amber-500' },
};

export default function SalesTable({ sales, isLoading, onRefund, onRefundItem }: SalesTableProps) {
  // Estado para controlar qué filas están expandidas
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const getMetodo = (codigo: string) => {
    return METODOS_ESPAÑOL[codigo?.toUpperCase()] || { texto: codigo, dot: 'bg-zinc-400' };
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-zinc-50/90 border-b border-zinc-200">
            <tr className="text-zinc-500 text-[10px] uppercase tracking-wider font-black">
              <th className="px-4 py-4 w-10"></th> 
              <th className="px-4 py-4">Fecha de Emisión</th>
              <th className="px-4 py-4">Cajero</th>
              <th className="px-4 py-4">Volumen</th>
              <th className="px-4 py-4 text-center">Método de Pago</th>
              <th className="px-4 py-4 text-center">Importe Total</th>
              <th className="px-6 py-4 text-center">Auditoría</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-zinc-400 font-medium">Descargando bitácora de tickets...</td></tr>
            ) : sales.map((sale) => {
              const isDevuelto = !!sale.refund || sale.total <= 0.05;
              const displayTotal = Math.max(0, sale.total);
              
              const configMetodo = getMetodo(sale.paymentMethod);
              const isExpanded = expandedRows.has(sale.id);
              
              // Formateo limpio de fecha 
              const dateObj = new Date(sale.createdAt);
              const fecha = dateObj.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
              const hora = dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

              return (
                <React.Fragment key={sale.id}>
                  {/* FILA PRINCIPAL */}
                  <tr 
                    onClick={() => toggleRow(sale.id)}
                    className={`transition-colors cursor-pointer group ${isDevuelto ? 'bg-red-50/20 text-zinc-400' : 'hover:bg-zinc-50 text-zinc-800'}`}
                  >
                    <td className="px-4 py-4 text-center text-zinc-400 group-hover:text-zinc-900 transition-colors">
                      {isExpanded ? <ChevronDown className="w-4 h-4 mx-auto" /> : <ChevronRight className="w-4 h-4 mx-auto" />}
                    </td>
                    
                    <td className="px-4 py-4">
                      <p className={`font-semibold ${isDevuelto ? 'text-zinc-500' : 'text-zinc-900'}`}>{fecha}</p>
                      <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{hora}</p>
                    </td>
                    
                    <td className="px-4 py-4 font-medium">{sale.user.name}</td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-zinc-300" />
                        <span className="font-semibold">{sale.items.length} {sale.items.length === 1 ? 'artículo' : 'artículos'}</span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-zinc-700 font-bold text-[10px] uppercase tracking-wider bg-zinc-100/80 border border-zinc-200/80">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${configMetodo.dot}`} />
                        <span>{configMetodo.texto}</span>
                      </span>
                    </td>
                    
                    <td className={`px-4 py-4 text-center font-mono font-bold text-base ${isDevuelto ? 'text-red-400 line-through' : 'text-zinc-900'}`}>
                      {formatMoney(displayTotal)}
                    </td>
                    
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {isDevuelto ? (
                        <span className="text-[10px] font-black text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded uppercase tracking-widest">Anulado</span>
                      ) : (
                        <button 
                          onClick={() => onRefund(sale.id)} 
                          className="text-[10px] font-bold text-red-600 hover:text-white border border-red-200 hover:bg-red-600 transition-all px-3 py-1.5 rounded-lg active:scale-90 w-full uppercase tracking-wider"
                        >
                          Anular Ticket
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* FILA EXPANDIDA */}
                  {isExpanded && (
                    <tr className="bg-zinc-50/50 border-b border-zinc-200">
                      <td colSpan={7} className="p-0">
                        <div className="px-14 py-4 animate-in slide-in-from-top-2 duration-200">
                          
                          <div className="flex items-center gap-2 mb-3">
                            <CornerDownRight className="w-4 h-4 text-zinc-300" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Detalle de la compra</span>
                          </div>

                          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left table-fixed">
                              <thead className="bg-zinc-50 border-b border-zinc-100">
                                <tr className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                                  <th className="px-4 py-1.5 w-[10%] text-center">Cant</th>
                                  <th className="px-4 py-1.5 w-[40%]">Producto</th>
                                  <th className="px-4 py-1.5 w-[15%] text-center">P. Unit</th>
                                  <th className="px-4 py-1.5 w-[15%] text-center">Subtotal</th>
                                  <th className="px-4 py-1.5 w-[10%] text-center">Acción</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-50 text-xs">
                                {sale.items.map((item) => {
                                  const itemSubtotal = item.quantity * item.priceSnap;
                                  
                                  // Evaluamos si la pieza está devuelta o si el ticket entero se anulo
                                  const isItemDevuelto = item.refunded || isDevuelto;
                                  
                                  return (
                                    <tr key={item.id} className="hover:bg-zinc-50/50 group/item transition-colors">
                                      <td className="px-4 py-1.5 text-center font-mono text-zinc-500 font-medium">
                                        {item.product.isByWeight ? (
                                          <span>
                                            <strong className={`font-bold ${isItemDevuelto ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>{item.quantity.toFixed(3)}</strong>
                                            <span className="text-[10px] text-zinc-400 font-sans ml-0.5">kg</span>
                                          </span>
                                        ) : (
                                          <span>
                                            <strong className={`font-bold ${isItemDevuelto ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>{item.quantity}</strong>
                                            <span className="text-[10px] text-zinc-400 font-sans ml-0.5">pz</span>
                                          </span>
                                        )}
                                      </td>
                                      <td className={`px-4 py-1.5 font-semibold ${isItemDevuelto ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
                                        {item.product.name}
                                      </td>
                                      <td className="px-4 py-1.5 text-center font-mono text-zinc-500">
                                        {formatMoney(item.priceSnap)}
                                      </td>
                                      <td className={`px-4 py-1.5 text-center font-mono font-bold ${isItemDevuelto ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
                                        {formatMoney(itemSubtotal)}
                                      </td>
                                      <td className="px-4 py-1.5 text-center">
                                        {!isItemDevuelto && (
                                          <button 
                                            onClick={() => {
                                              if (onRefundItem) onRefundItem(sale.id, item.id);
                                            }}
                                            className="text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all px-2.5 py-1 rounded-md opacity-0 group-hover/item:opacity-100 active:scale-95 whitespace-nowrap"
                                          >
                                            Devolver
                                          </button>
                                        )}
                                        {isItemDevuelto && (
                                          <span className="text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase">Devuelto</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {sales.length === 0 && !isLoading && (
              <tr><td colSpan={7} className="text-center py-12 text-zinc-400 font-medium">No se encontraron ventas en este rango de fechas.</td></tr>
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}