import React from 'react';

interface Product {
  id: string;
  name: string;
  barcode: string | null;
  priceCost: number;
  priceSale: number;
  stock: number;
  isByWeight: boolean;
}

interface ProductTableProps {
  isLoading: boolean;
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAdjustStock: (product: Product) => void;
}

export default function ProductTable({ isLoading, products, onEdit, onDelete, onAdjustStock }: ProductTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-zinc-50/90 border-b border-zinc-200">
            <tr className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Costo</th>
              <th className="px-6 py-4">Venta</th>
              <th className="px-6 py-4 text-center">Stock</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-10 text-zinc-500">Cargando inventario...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-zinc-500">No hay productos registrados.</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-medium text-zinc-900">{product.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {product.barcode ? `Cód: ${product.barcode}` : 'Sin código'} • {product.isByWeight ? 'Granel' : 'Pieza'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">${product.priceCost.toFixed(2)}</td>
                  <td className="px-6 py-4 font-medium text-zinc-900">${product.priceSale.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium border ${
                      product.stock <= 5 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {product.isByWeight ? `${product.stock.toFixed(3)} kg` : `${product.stock} pza`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* AJUSTAR STOCK */}
                      <button onClick={() => onAdjustStock(product)} title="Ajustar Stock" className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                      </button>
                      <button onClick={() => onEdit(product)} title="Editar Producto" className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => onDelete(product.id)} title="Eliminar Producto" className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}