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
    priceWholesale: '',
    minWholesaleQty: '',
    discountPercent: '',
    discountEndDate: '',
  });

  const [showPromoSection, setShowPromoSection] = useState(false);

  useEffect(() => {
    if (product) {
      const formattedEndDate = product.discountEndDate 
        ? new Date(product.discountEndDate).toISOString().slice(0, 16) 
        : '';

      setFormData({
        name: product.name,
        barcode: product.barcode || '',
        priceCost: product.priceCost.toString(),
        priceSale: product.priceSale.toString(),
        stock: product.stock.toString(),
        isByWeight: product.isByWeight,
        priceWholesale: product.priceWholesale ? product.priceWholesale.toString() : '',
        minWholesaleQty: product.minWholesaleQty ? product.minWholesaleQty.toString() : '',
        discountPercent: product.discountPercent ? product.discountPercent.toString() : '',
        discountEndDate: formattedEndDate,
      });
      setShowPromoSection(!!product.priceWholesale || !!product.discountPercent);
    } else {
      setFormData({ 
        name: '', barcode: '', priceCost: '', priceSale: '', stock: '', isByWeight: false,
        priceWholesale: '', minWholesaleQty: '', discountPercent: '', discountEndDate: '' 
      });
      setShowPromoSection(false);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = product ? `/api/products/${product.id}` : '/api/products';
    const method = product ? 'PUT' : 'POST';

    const payload: any = {
      name: formData.name,
      barcode: formData.barcode === '' ? null : formData.barcode,
      priceCost: Number(formData.priceCost), 
      priceSale: Number(formData.priceSale), 
      isByWeight: formData.isByWeight,
      priceWholesale: formData.priceWholesale ? Number(formData.priceWholesale) : null,
      minWholesaleQty: formData.minWholesaleQty ? Number(formData.minWholesaleQty) : null,
      discountPercent: formData.discountPercent ? Number(formData.discountPercent) : null,
      discountEndDate: formData.discountEndDate ? new Date(formData.discountEndDate).toISOString() : null,
    };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8 overflow-hidden border border-zinc-100 relative">
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-zinc-900">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
          <form onSubmit={handleSave} className="p-6 space-y-5">
            
            <div className="space-y-4">
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
                    required type="number" step="0.001" 
                    value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                    disabled={!!product} 
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-60 disabled:cursor-not-allowed" 
                  />
                  {product && <p className="text-[10px] text-zinc-500 mt-1 leading-tight">Usa "Ajustar Stock" en la tabla para modificar.</p>}
                </div>
                <div className="flex flex-col justify-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isByWeight} onChange={(e) => setFormData({...formData, isByWeight: e.target.checked})} className="w-4 h-4 text-zinc-900 rounded border-zinc-300 focus:ring-zinc-900" />
                    <span className="text-sm font-medium text-zinc-700">Se vende a granel</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/50 transition-all">
              <button
                type="button"
                onClick={() => setShowPromoSection(!showPromoSection)}
                className="w-full px-4 py-3 flex items-center justify-between bg-zinc-100/80 hover:bg-zinc-200/60 transition-colors border-b border-zinc-200 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">⚡</span>
                  <span className="text-[11px] font-black text-zinc-700 uppercase tracking-wider">Promociones y Mayoreo</span>
                </div>
                <span className={`text-[10px] text-zinc-400 font-black transition-transform duration-300 ${showPromoSection ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              <div className={`p-4 space-y-4 transition-all duration-300 origin-top ${showPromoSection ? 'block' : 'hidden'}`}>
                
                <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Configuración de Mayoreo</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Precio Mayoreo ($)</label>
                      <input
                        type="number" step="0.01" placeholder="Ej: 9.50"
                        value={formData.priceWholesale} onChange={e => setFormData({...formData, priceWholesale: e.target.value})}
                        className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>
                    <div>
                      {/* 🔥 AQUI ESTA LA MAGIA DE UX PARA LA ETIQUETA Y EL TIPO DE INPUT */}
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                        A partir de ({formData.isByWeight ? 'Kg' : 'Uds'})
                      </label>
                      <input
                        type="number" 
                        step={formData.isByWeight ? "any" : "1"} // 🔥 Si es granel permite decimales, si no, solo enteros
                        placeholder={formData.isByWeight ? "Ej: 1.5" : "Ej: 6"}
                        value={formData.minWholesaleQty} onChange={e => setFormData({...formData, minWholesaleQty: e.target.value})}
                        className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Oferta Temporal</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">% Descuento</label>
                      <div className="relative">
                        <input
                          type="number" step="0.1" min="0" max="100" placeholder="Ej: 15"
                          value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})}
                          className="w-full pl-3 pr-6 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                        <span className="absolute right-2 top-1.5 text-[10px] font-bold text-zinc-400">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Vence el</label>
                      <input
                        type="datetime-local"
                        value={formData.discountEndDate} onChange={e => setFormData({...formData, discountEndDate: e.target.value})}
                        className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="pt-2 flex gap-3 sticky bottom-0 bg-white pb-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors shadow-md active:scale-95">Guardar Producto</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}