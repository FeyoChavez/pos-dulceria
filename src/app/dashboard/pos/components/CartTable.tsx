import React, { useState, useEffect } from 'react';

interface CartTableProps {
  cart: any[];
  updateQuantity: (id: string, amount: number) => void;
  setExactQuantity: (id: string, exactQty: number) => void; 
  removeFromCart: (id: string) => void;
}

// Manejar la logica de teclear sin bugear el carrito
const QuantityInputControl = ({ item, updateQuantity, setExactQuantity }: any) => {
  const [localVal, setLocalVal] = useState(item.quantity.toString());

  useEffect(() => {
    setLocalVal(item.isByWeight ? item.quantity.toFixed(3) : item.quantity.toString());
  }, [item.quantity, item.isByWeight]);

  const handleCommit = () => {
    let num = parseFloat(localVal);
    // Si borró todo o puso cero, regresamos al valor seguro anterior
    if (isNaN(num) || num <= 0) {
      setLocalVal(item.isByWeight ? item.quantity.toFixed(3) : item.quantity.toString());
      return;
    }
    setExactQuantity(item.id, num);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur(); 
  };

  return (
    <div className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-lg p-1">
      <button 
        onClick={() => updateQuantity(item.id, item.isByWeight ? -0.25 : -1)}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-zinc-200 text-zinc-600 font-bold text-sm transition-colors active:bg-zinc-300"
      >-</button>
      
      <div className="relative flex items-center justify-center">
        <input
          type="number" step="any"
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          className="w-20 text-center text-sm font-bold text-zinc-800 bg-transparent border-none focus:ring-0 outline-none py-0 pl-2 pr-5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-[10px] font-bold text-zinc-400 absolute right-1.5 pointer-events-none">
          {item.isByWeight ? 'kg' : 'pz'}
        </span>
      </div>

      <button 
        onClick={() => updateQuantity(item.id, item.isByWeight ? 0.25 : 1)}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-zinc-200 text-zinc-600 font-bold text-sm transition-colors active:bg-zinc-300"
      >+</button>
    </div>
  );
};

export default function CartTable({ cart, updateQuantity, setExactQuantity, removeFromCart }: CartTableProps) {
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <svg className="w-16 h-16 mb-4 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        <p className="text-lg font-medium text-zinc-500">La caja está vacía</p>
      </div>
    );
  }

  const getPromoIndicator = (item: any) => {
    const hasDiscount = item.discountPercent && (!item.discountEndDate || new Date(item.discountEndDate) >= new Date());
    if (hasDiscount) return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200 tracking-wider uppercase ml-2 align-middle">-{item.discountPercent}% OFF</span>;

    if (item.priceWholesale && item.minWholesaleQty) {
      const isApplied = item.quantity >= item.minWholesaleQty;
      return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ml-2 align-middle transition-colors ${isApplied ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{isApplied ? 'Mayoreo Aplicado' : `Mayoreo ${item.minWholesaleQty}+`}</span>;
    }
    return null;
  };

  return (
    <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
      <thead className="sticky top-0 bg-zinc-50/90 backdrop-blur-sm z-10">
        <tr className="text-zinc-500 text-[12px] uppercase tracking-wider font-bold border-b border-zinc-200">
          <th className="px-6 py-4">Producto</th>
          <th className="px-6 py-4 text-center">Cantidad / Peso</th>
          <th className="px-6 py-4 text-right">Precio Unit.</th>
          <th className="px-6 py-4 text-right">Subtotal</th>
          <th className="px-6 py-4 text-center w-16"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {cart.map((item) => {
          
          const currentUnitPrice = item.quantity > 0 ? item.subtotal / item.quantity : item.priceSale;
          
          // math para tallar el total
          const originalSubtotal = item.priceSale * item.quantity;
          const isPromoActive = item.subtotal < originalSubtotal;

          return (
            <tr key={item.id} className="hover:bg-zinc-50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <p className="font-semibold text-zinc-900">{item.name}</p>
                  {getPromoIndicator(item)}
                </div>
              </td>
              
              {/* nuevo input interactivo*/}
              <td className="px-6 py-4 text-center">
                <QuantityInputControl item={item} updateQuantity={updateQuantity} setExactQuantity={setExactQuantity} />
              </td>
              
              <td className="px-6 py-4 text-right">
                {isPromoActive && <span className="block text-[10px] text-zinc-400 line-through mb-0.5 font-mono">${item.priceSale.toFixed(2)}</span>}
                <span className={`font-mono font-medium ${isPromoActive ? 'text-emerald-600 font-bold' : 'text-zinc-600'}`}>${currentUnitPrice.toFixed(2)}</span>
              </td>
              
              <td className="px-6 py-4 text-right">
                {/* subtotal original tachado */}
                {isPromoActive && <span className="block text-[10px] text-zinc-400 line-through mb-0.5 font-mono">${originalSubtotal.toFixed(2)}</span>}
                <span className={`font-mono font-bold text-lg ${isPromoActive ? 'text-emerald-600' : 'text-zinc-900'}`}>
                  ${item.subtotal.toFixed(2)}
                </span>
              </td>
              
              <td className="px-6 py-4 text-center">
                <button onClick={() => removeFromCart(item.id)} className="text-zinc-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}