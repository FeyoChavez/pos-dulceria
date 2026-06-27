import React from 'react';
import { Trash2, PackageOpen } from 'lucide-react';

interface CartItem {
  product: any;
  quantity: number;
  costPrice: number;
}

interface ReceivedItemsTableProps {
  items: CartItem[];
  onUpdateQty: (index: number, qty: number) => void;
  onUpdateCost: (index: number, cost: number) => void;
  onRemove: (index: number) => void;
}

export default function ReceivedItemsTable({ items, onUpdateQty, onUpdateCost, onRemove }: ReceivedItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-zinc-300 p-12 text-center">
        <PackageOpen className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
        <p className="text-sm font-bold text-zinc-600">Almacén de recepción vacío</p>
        <p className="text-xs text-zinc-400 mt-1">Busca productos arriba para agregarlos a la nota de entrada.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 font-black">
            <tr>
              <th className="px-5 py-3.5 w-[40%]">Producto</th>
              <th className="px-5 py-3.5 w-[20%]">Cant. Recibida</th>
              <th className="px-5 py-3.5 w-[20%]">Costo Unitario ($)</th>
              <th className="px-5 py-3.5 w-[15%] text-right">Subtotal</th>
              <th className="px-5 py-3.5 w-[5%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {items.map((item, idx) => {
              const subtotal = item.quantity * item.costPrice;
              return (
                <tr key={item.product.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-zinc-900">{item.product.name}</td>
                  
                  {/* INPUT PIEZAS */}
                  <td className="px-5 py-3.5">
                    <input 
                      type="number" min="0.1" step="any" required
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={(e) => onUpdateQty(idx, Number(e.target.value))}
                      className="w-24 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl font-mono font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none"
                    />
                  </td>

                  {/* INPUT COSTO UNITARIO */}
                  <td className="px-5 py-3.5">
                    <input 
                      type="number" min="0" step="0.01" required
                      value={item.costPrice === 0 ? '' : item.costPrice}
                      onChange={(e) => onUpdateCost(idx, Number(e.target.value))}
                      className="w-28 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none"
                    />
                  </td>

                  <td className="px-5 py-3.5 text-right font-mono font-black text-zinc-900">
                    ${subtotal.toFixed(2)}
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <button type="button" onClick={() => onRemove(idx)} className="text-zinc-300 hover:text-red-600 p-1 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}