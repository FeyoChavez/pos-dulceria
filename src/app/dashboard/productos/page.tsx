'use client';

import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  barcode: string | null;
  priceCost: number;
  priceSale: number;
  stock: number;
  isByWeight: boolean;
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para el Modal del Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Estado del Formulario
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    priceCost: '',
    priceSale: '',
    stock: '',
    isByWeight: false,
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        barcode: product.barcode || '',
        priceCost: product.priceCost.toString(),
        priceSale: product.priceSale.toString(),
        stock: product.stock.toString(),
        isByWeight: product.isByWeight,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', barcode: '', priceCost: '', priceSale: '', stock: '', isByWeight: false });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchProducts();
        closeModal();
      } else {
        alert('Error al guardar el producto');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-screen-xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Inventario</h1>
            <p className="text-sm text-zinc-500 mt-1">Gestiona los productos y existencias de tu tienda.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-zinc-900/10 hover:bg-zinc-800 active:scale-95 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nuevo Producto
          </button>
        </div>

        {/* Tabla */}
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
                          <button onClick={() => openModal(product)} className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
      </div>

      {/* Modal Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-100">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-lg font-semibold text-zinc-900">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Código de Barras (Opcional)</label>
                <input type="text" value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Costo ($)</label>
                  <input required type="number" step="0.01" value={formData.priceCost} onChange={(e) => setFormData({...formData, priceCost: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Venta ($)</label>
                  <input required type="number" step="0.01" value={formData.priceSale} onChange={(e) => setFormData({...formData, priceSale: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Stock Inicial</label>
                  <input required type="number" step="0.001" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                </div>
                <div className="flex flex-col justify-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isByWeight} onChange={(e) => setFormData({...formData, isByWeight: e.target.checked})} className="w-4 h-4 text-zinc-900 rounded border-zinc-300 focus:ring-zinc-900" />
                    <span className="text-sm font-medium text-zinc-700">Se vende a granel</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}