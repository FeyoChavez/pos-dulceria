import React, { useState, useMemo } from 'react';

export interface Product {
  id: string;
  name: string;
  barcode: string | null;
  priceCost: number;
  priceSale: number;
  stock: number;
  isByWeight: boolean;
  // Promociones
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
}

const ITEMS_PER_PAGE = 10;

export default function ProductTable({ isLoading, products, onEdit, onDelete, onAdjustStock }: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Motor de búsqueda en tiempo real
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchName = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBarcode = product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchBarcode;
    });
  }, [products, searchTerm]);

  //  Paginación automática
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Resetear a la página 1 si el usuario escribe en el buscador
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Evaluador de promociones activas para la UI
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
      
      {/* BARRA DE BÚSQUEDA (Header de la tabla) */}
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
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
        <span className="text-xs font-medium text-zinc-500 hidden sm:block">
          {filteredProducts.length} artículo(s)
        </span>
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
              <tr><td colSpan={5} className="text-center py-12 text-zinc-500">No se encontraron productos que coincidan con la búsqueda.</td></tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50 transition-colors group">
                  
                  {/* COLUMNA: PRODUCTO */}
                  <td className="px-6 py-3.5">
                    <p className="font-semibold text-zinc-900 truncate max-w-[250px]">{product.name}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
                      {product.barcode ? <span className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-zinc-500 mr-1">{product.barcode}</span> : 'Sin código'} 
                      • {product.isByWeight ? 'Granel' : 'Pieza'}
                    </p>
                  </td>

                  {/* COLUMNA: COSTO */}
                  <td className="px-6 py-3.5 text-zinc-500 font-mono text-xs">
                    ${product.priceCost.toFixed(2)}
                  </td>

                  {/* COLUMNA: VENTA (Con indicador de promo) */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center">
                      <span className="font-bold text-zinc-900 font-mono text-sm">${product.priceSale.toFixed(2)}</span>
                      {getActivePromoBadge(product)}
                    </div>
                  </td>

                  {/* COLUMNA: STOCK */}
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded border text-xs font-mono font-bold ${
                      product.stock <= 0 ? 'bg-red-50 text-red-600 border-red-200' :
                      product.stock <= 5 ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                      'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                    }`}>
                      {product.isByWeight ? `${product.stock.toFixed(3)} kg` : `${product.stock} uds`}
                    </span>
                  </td>

                  {/* COLUMNA: ACCIONES */}
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onAdjustStock(product)} title="Ajustar Stock" className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                      </button>
                      <button onClick={() => onEdit(product)} title="Editar Producto" className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => onDelete(product.id)} title="Eliminar Producto" className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CONTROLES DE PAGINACIÓN (Footer) */}
      {!isLoading && totalPages > 1 && (
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <span className="text-xs text-zinc-500 font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-zinc-200 bg-white text-zinc-600 rounded-lg text-xs font-bold hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-zinc-200 bg-white text-zinc-600 rounded-lg text-xs font-bold hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

    </div>
  );
}