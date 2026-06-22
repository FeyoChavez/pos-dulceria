import React from 'react';

interface CartTableProps {
  cart: any[];
  updateQuantity: (id: string, amount: number) => void;
  removeFromCart: (id: string) => void;
}

export default function CartTable({ cart, updateQuantity, removeFromCart }: CartTableProps) {
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <svg className="w-16 h-16 mb-4 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-lg font-medium text-zinc-500">La caja está vacía</p>
        <p className="text-sm mt-1">Escanea un producto para comenzar a cobrar</p>
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse min-w-[650px]">
      <thead className="sticky top-0 bg-zinc-50/90 backdrop-blur-sm z-10">
        <tr className="text-zinc-500 text-xs uppercase tracking-wider font-semibold border-b border-zinc-200">
          <th className="px-6 py-4">Producto</th>
          <th className="px-6 py-4 text-center">Cantidad / Peso</th>
          <th className="px-6 py-4 text-right">Precio</th>
          <th className="px-6 py-4 text-right">Subtotal</th>
          <th className="px-6 py-4 text-center w-16"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {cart.map((item) => (
          <tr key={item.id} className="hover:bg-zinc-50 transition-colors group">
            <td className="px-6 py-4">
              <p className="font-medium text-zinc-900">{item.name}</p>
              {item.barcode && <p className="text-xs text-zinc-400 mt-0.5">{item.barcode}</p>}
            </td>
            <td className="px-6 py-4 text-center">
              <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg p-1">
                <button
                  onClick={() => updateQuantity(item.id, item.isByWeight ? -0.25 : -1)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 text-zinc-600 font-bold text-sm transition-colors"
                >-</button>
                <span className="min-w-[60px] text-sm font-semibold text-zinc-800">
                  {item.isByWeight ? `${item.quantity.toFixed(3)} kg` : `${item.quantity} pza`}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.isByWeight ? 0.25 : 1)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 text-zinc-600 font-bold text-sm transition-colors"
                >+</button>
              </div>
            </td>
            <td className="px-6 py-4 text-right text-zinc-600">${item.priceSale.toFixed(2)}</td>
            <td className="px-6 py-4 text-right font-semibold text-zinc-900 text-lg">${item.subtotal.toFixed(2)}</td>
            <td className="px-6 py-4 text-center">
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-zinc-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}