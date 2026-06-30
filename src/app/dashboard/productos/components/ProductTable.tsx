import { formatMoney } from '@/lib/utils/format';
import React, { useState, useMemo } from 'react';

export interface Product {
  id: string;
  name: string;
  barcode: string | null;
  priceCost: number;
  priceSale: number;
  stock: number;
  isByWeight: boolean;
  isActive?: boolean; 
  priceWholesale?: number | null;
  minWholesaleQty?: number | null;
  discountPercent?: number | null;
  discountEndDate?: string | null;
}

interface ProductTableProps {
  isLoading: boolean;
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAdjustStock: (product: Product) => void;
  onRestore: (id: string) => void; 
}

const ITEMS_PER_PAGE = 10;

export default function ProductTable({ isLoading, products, onEdit, onDelete, onAdjustStock, onRestore }: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false); 

  // Motor de búsqueda y filtro de activos/inactivos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchName = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBarcode = product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Si el switch está apagado, mostramos activos. Si está prendido, mostramos archivados 
      const matchStatus = showArchived ? product.isActive === false : (product.isActive !== false);
      
      return (matchName || matchBarcode) && matchStatus;
    });
  }, [products, searchTerm, showArchived]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getActivePromoBadge = (product: Product) => {
    const ahora = new Date();
    const hasDiscount = product.discountPercent && (!product.discountEndDate || new Date(product.discountEndDate) >= ahora);
    const hasWholesale = product.priceWholesale && product.minWholesaleQty;

    if (hasDiscount) return <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200 tracking-wider">OFERTA</span>;
    if (hasWholesale) return <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200 tracking-wider">MAYOREO</span>;
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
      
      {/* Buscador y Switch */}
      <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row items-center justify-between bg-zinc-50/50 gap-4">
        
        <div className="relative w-full max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-zinc-500 hidden sm:block">
            {filteredProducts.length} artículo(s)
          </span>
          
          {/* SWITCH DE ARCHIVADOS */}
          <label className="flex items-center cursor-pointer select-none">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={showArchived} 
                onChange={() => { setShowArchived(!showArchived); setCurrentPage(1); }} 
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${showArchived ? 'bg-zinc-800' : 'bg-zinc-200 border border-zinc-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${showArchived ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className={`ml-2 text-xs font-bold ${showArchived ? 'text-zinc-800' : 'text-zinc-400'}`}>
              Papelera
            </span>
          </label>
        </div>
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-zinc-50/90 border-b border-zinc-200">
            <tr className="text-zinc-500 text-[11px] uppercase tracking-wider font-bold">
              <th className="px-6 py-4 w-2/5">Producto</th>
              <th className="px-6 py-4">Costo</th>
              <th className="px-6 py-4">Venta</th>
              <th className="px-6 py-4 text-center">Stock</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-12 text-zinc-500">Sincronizando inventario...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-zinc-500">
                {showArchived ? "No tienes productos en la papelera." : "No se encontraron productos que coincidan."}
              </td></tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product.id} className={`hover:bg-zinc-50 transition-colors group ${showArchived ? 'opacity-60' : ''}`}>
                  
                  <td className="px-6 py-3.5">
                    <p className={`font-semibold truncate max-w-[250px] ${showArchived ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>{product.name}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
                      {product.barcode ? <span className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-zinc-500 mr-1">{product.barcode}</span> : 'Sin código'} 
                      • {product.isByWeight ? 'Granel' : 'Pieza'}
                    </p>
                  </td>

                  <td className="px-6 py-3.5 text-zinc-500 font-mono text-xs">
                    {formatMoney(product.priceCost)}
                  </td>

                  <td className="px-6 py-3.5">
                    <div className="flex items-center">
                      <span className={`font-bold font-mono text-sm ${showArchived ? 'text-zinc-500' : 'text-zinc-900'}`}>{formatMoney(product.priceSale)}</span>
                      {!showArchived && getActivePromoBadge(product)}
                    </div>
                  </td>

                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded border text-xs font-mono font-bold ${
                      product.stock <= 0 ? 'bg-red-50 text-red-600 border-red-200' :
                      product.stock <= 5 ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                      'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                    } ${showArchived ? 'grayscale opacity-50' : ''}`}>
                      {product.isByWeight ? `${product.stock.toFixed(3)} kg` : `${product.stock} uds`}
                    </span>
                  </td>

                  <td className="px-6 py-3.5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {/* ACCIONES CONDICIONALES BASADAS EN EL ESTADO */}
                      {showArchived ? (
                        <button onClick={() => onRestore(product.id)} title="Restaurar Producto" className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                      ) : (
                        <>
                          <button onClick={() => onAdjustStock(product)} title="Ajustar Stock" className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                          </button>
                          <button onClick={() => onEdit(product)} title="Editar Producto" className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => onDelete(product.id)} title="Archivar Producto" className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      )}

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CONTROLES DE PAGINACIÓN */}
      {!isLoading && totalPages > 1 && (
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <span className="text-xs text-zinc-500 font-medium">Página {currentPage} de {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-zinc-200 bg-white text-zinc-600 rounded-lg text-xs font-bold hover:bg-zinc-50 disabled:opacity-50">Anterior</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-zinc-200 bg-white text-zinc-600 rounded-lg text-xs font-bold hover:bg-zinc-50 disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}