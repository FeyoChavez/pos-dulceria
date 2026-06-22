import React from 'react';

interface SearchModalProps {
  isOpen: boolean;
  results: any[];
  onSelect: (product: any) => void;
  onClose: () => void;
}

export default function SearchModal({ isOpen, results, onSelect, onClose }: SearchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-100">
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h3 className="text-lg font-semibold text-zinc-900">Selecciona un producto</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          <ul className="space-y-1">
            {results.map((product) => (
              <li key={product.id}>
                <button onClick={() => onSelect(product)} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-zinc-50 active:bg-zinc-100 text-left group">
                  <div>
                    <p className="font-medium text-zinc-900 group-hover:text-zinc-600">{product.name}</p>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      {product.barcode ? `Cód: ${product.barcode}` : "Sin código"} • {product.isByWeight ? "Venta a granel" : "Por pieza"}
                    </p>
                  </div>
                  <span className="font-semibold text-zinc-900">${product.priceSale.toFixed(2)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}