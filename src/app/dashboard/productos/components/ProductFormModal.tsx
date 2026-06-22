import React, { useState, useEffect } from 'react';

interface ProductFormModalProps {
  isOpen: boolean;
  product: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductFormModal({ isOpen, product, onClose, onSuccess }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    priceCost: '',
    priceSale: '',
    stock: '',
    isByWeight: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        barcode: product.barcode || '',
        priceCost: product.priceCost.toString(),
        priceSale: product.priceSale.toString(),
        stock: product.stock.toString(),
        isByWeight: product.isByWeight,
      });
    } else {
      setFormData({ name: '', barcode: '', priceCost: '', priceSale: '', stock: '', isByWeight: false });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = product ? `/api/products/${product.id}` : '/api/products';
    const method = product ? 'PUT' : 'POST';

    // Formateo de datos antes de enviarlos al backend
    const payload: any = {
      name: formData.name,
      barcode: formData.barcode === '' ? null : formData.barcode,
      priceCost: Number(formData.priceCost), 
      priceSale: Number(formData.priceSale), 
      isByWeight: formData.isByWeight,
    };

    // SOLO enviamos el stock inicial si el producto es NUEVO
    if (!product) {
      payload.stock = Number(formData.stock);
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json(); 

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert(`Error al guardar: ${data.error || 'Fallo interno en el servidor'}`);
        console.error("Detalle del error:", data);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert('Error de conexión al intentar guardar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-100">
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h3 className="text-lg font-semibold text-zinc-900">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors p-1">
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
              <input 
                required 
                type="number" 
                step="0.001" 
                value={formData.stock} 
                onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                disabled={!!product} 
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-60 disabled:cursor-not-allowed" 
              />
              {product && <p className="text-[10px] text-zinc-500 mt-1 leading-tight">Usa el botón de "Ajustar Stock" en la tabla para modificar inventario.</p>}
            </div>
            <div className="flex flex-col justify-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isByWeight} onChange={(e) => setFormData({...formData, isByWeight: e.target.checked})} className="w-4 h-4 text-zinc-900 rounded border-zinc-300 focus:ring-zinc-900" />
                <span className="text-sm font-medium text-zinc-700">Se vende a granel</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}