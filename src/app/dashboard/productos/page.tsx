'use client';

import React, { useState, useEffect } from 'react';
import ProductTable from './components/ProductTable';
import ProductFormModal from './components/ProductFormModal';
import StockAdjustmentModal from '@/components/ui/StockAdjustmentModal'; // Ajusta la ruta a donde guardaste el modal del paso anterior

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
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const openFormModal = (product?: Product) => {
    setSelectedProduct(product || null);
    setIsFormModalOpen(true);
  };

  const openStockModal = (product: Product) => {
    setSelectedProduct(product);
    setIsStockModalOpen(true);
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
            <p className="text-sm text-zinc-500 mt-1">Gestiona los productos y movimientos de existencias de tu tienda.</p>
          </div>
          <button
            onClick={() => openFormModal()}
            className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-zinc-900/10 hover:bg-zinc-800 active:scale-95 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nuevo Producto
          </button>
        </div>

        {/* Componente Tabla Principal */}
        <ProductTable 
          isLoading={isLoading} 
          products={products} 
          onEdit={openFormModal} 
          onDelete={handleDelete}
          onAdjustStock={openStockModal}
        />
      </div>

      {/* Modales Desacoplados */}
      <ProductFormModal 
        isOpen={isFormModalOpen} 
        product={selectedProduct} 
        onClose={() => setIsFormModalOpen(false)} 
        onSuccess={fetchProducts} 
      />

      <StockAdjustmentModal 
        isOpen={isStockModalOpen} 
        product={selectedProduct} 
        onClose={() => setIsStockModalOpen(false)} 
        onSuccess={fetchProducts} 
      />
      
    </div>
  );
}