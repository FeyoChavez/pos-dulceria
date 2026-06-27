'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Package } from 'lucide-react';

interface ProductPredictiveSearchProps {
  products: any[];
  onSelectProduct: (product: any) => void;
}

export default function ProductPredictiveSearch({ products, onSelectProduct }: ProductPredictiveSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cierra el menú flotante si dan clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = query.trim() === '' ? [] : products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    (p.barcode && p.barcode.includes(query))
  ).slice(0, 6); // Solo mostramos los 6 más parecidos para no saturar

  const handleSelect = (product: any) => {
    onSelectProduct(product);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative z-30" ref={containerRef}>
      <div className="relative">
        <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Escribe el nombre o escanea el código de barras del dulce..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => query.trim() !== '' && setIsOpen(true)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-zinc-200 rounded-2xl shadow-sm text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 transition-all"
        />
      </div>

      {/* MENÚ PREDICTIVO FLOTANTE */}
      {isOpen && filtered.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden divide-y divide-zinc-50 animate-in fade-in zoom-in-95 duration-150">
          {filtered.map((prod) => (
            <button
              key={prod.id} type="button"
              onClick={() => handleSelect(prod)}
              className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 text-left transition-colors group"
            >
              <div className="flex items-center gap-3 pr-2 truncate">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <Package className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-zinc-800 truncate">{prod.name}</p>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Stock actual: {prod.stock} pzs | Precio venta: ${Number(prod.priceSale ?? prod.salePrice ?? prod.priceSnap ?? 0).toFixed(2)}
                 </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 bg-zinc-100 group-hover:bg-zinc-200 text-zinc-700 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0">
                <Plus className="w-3 h-3" /> Agregar
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}