import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import ProductPromoSection from './form/ProductPromoSection';
import ProductUnpackSection from './form/ProductUnpackSection';

interface ProductFormModalProps {
  isOpen: boolean;
  product: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductFormModal({ isOpen, product, onClose, onSuccess }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '', barcode: '', priceCost: '', priceSale: '', stock: '', isByWeight: false,
    priceWholesale: '', minWholesaleQty: '', discountPercent: '', discountEndDate: '',
    parentId: '', conversionFactor: '',
  });

  const [openSection, setOpenSection] = useState<'NONE' | 'UNPACK' | 'PROMOS'>('NONE');
  const [isChildProduct, setIsChildProduct] = useState(false);
  const [parentCatalog, setParentCatalog] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/products').then(r => r.json()).then(data => {
        setParentCatalog(data.filter((p: any) => p.id !== product?.id));
      });
    }
  }, [isOpen, product]);

    // calculo de costo de reposicion automatico
  useEffect(() => {
    if (isChildProduct && formData.parentId && formData.conversionFactor) {
      const parent = parentCatalog.find(p => p.id === formData.parentId);
      
      if (parent && parent.priceCost > 0) {
        const factor = Number(formData.conversionFactor);
        if (factor > 0) {
          const exactCost = (parent.priceCost / factor).toFixed(2);
          
          if (formData.priceCost !== exactCost) {
            setFormData(prev => ({ ...prev, priceCost: exactCost }));
          }
        }
      }
    }
  }, [formData.parentId, formData.conversionFactor, isChildProduct, parentCatalog]);

  useEffect(() => {
    if (product) {
      const formattedEndDate = product.discountEndDate ? new Date(product.discountEndDate).toISOString().slice(0, 16) : '';
      setFormData({
        name: product.name, barcode: product.barcode || '', priceCost: product.priceCost.toString(),
        priceSale: product.priceSale.toString(), stock: product.stock.toString(), isByWeight: product.isByWeight,
        priceWholesale: product.priceWholesale?.toString() || '', minWholesaleQty: product.minWholesaleQty?.toString() || '',
        discountPercent: product.discountPercent?.toString() || '', discountEndDate: formattedEndDate,
        parentId: product.parentId || '', conversionFactor: product.conversionFactor?.toString() || '',
      });
      const hasParent = Boolean(product.parentId);
      setIsChildProduct(hasParent);
      setOpenSection(hasParent ? 'UNPACK' : (product.priceWholesale ? 'PROMOS' : 'NONE'));
    } else {
      setFormData({ name: '', barcode: '', priceCost: '', priceSale: '', stock: '', isByWeight: false, priceWholesale: '', minWholesaleQty: '', discountPercent: '', discountEndDate: '', parentId: '', conversionFactor: '' });
      setOpenSection('NONE'); setIsChildProduct(false);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...formData,
      priceCost: Number(formData.priceCost), priceSale: Number(formData.priceSale),
      priceWholesale: formData.priceWholesale ? Number(formData.priceWholesale) : null,
      minWholesaleQty: formData.minWholesaleQty ? Number(formData.minWholesaleQty) : null,
      discountPercent: formData.discountPercent ? Number(formData.discountPercent) : null,
      discountEndDate: formData.discountEndDate ? new Date(formData.discountEndDate).toISOString() : null,
      parentId: isChildProduct && formData.parentId ? formData.parentId : null,
      conversionFactor: isChildProduct && formData.conversionFactor ? Number(formData.conversionFactor) : null,
    };
    if (!product) payload.stock = Number(formData.stock);

    const res = await fetch(product ? `/api/products/${product.id}` : '/api/products', {
      method: product ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) { toast.success('Catálogo actualizado'); onSuccess(); onClose(); } 
    else toast.error((await res.json()).error || 'Error al guardar');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8 overflow-hidden border border-zinc-100 relative">
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/80 sticky top-0 z-10">
          <h3 className="text-base font-black text-zinc-900">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg bg-zinc-100"><X className="w-4 h-4" /></button>
        </div>
        
        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto">
          <form onSubmit={handleSave} className="p-6 space-y-5">
            
            {/* CAMPOS GENERALES DIRECTOS */}
            <div className="space-y-4 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100">
              
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">Nombre del Dulce *</label>
                <input 
                  required type="text" 
                  placeholder="Ej: Pulparindo (Caja)" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-mono text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm" 
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">Tip: Si es una pieza suelta, ponle (Pieza) al final para no confundirlo con la Caja.</span>
              </div>

              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">Código de Barras</label>
                <input 
                  type="text" 
                  placeholder="Ej: 7501011122233 (Opcional)" 
                  value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} 
                  className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-mono text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-zinc-800 mb-1">Costo Reposición *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-mono text-zinc-400">$</span>
                    <input 
                      required type="number" step="0.01" placeholder="2.50" 
                      value={formData.priceCost} onChange={e => setFormData({...formData, priceCost: e.target.value})} 
                      className="w-full pl-7 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-mono text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm" 
                    />
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-0.5 block leading-tight">
                    {isChildProduct ? "Divide el costo de la caja entre las piezas (Ej. $40 / 20 = $2.00)" : "Lo que pagas al proveedor por 1 unidad"}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black text-zinc-800 mb-1">Precio Público *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-mono text-zinc-900">$</span>
                    <input 
                      required type="number" step="0.01" placeholder="4.50" 
                      value={formData.priceSale} onChange={e => setFormData({...formData, priceSale: e.target.value})} 
                      className="w-full pl-7 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-mono text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm" 
                    />
                  </div>
                  <span className="text-[9px] text-zinc-900 font-mono mt-0.5 block">En cuánto lo vendes</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-black text-zinc-800 mb-1">Stock Inicial en Mostrador</label>
                  <input 
                    required type="number" step="any" placeholder="Ej: 24"
                    value={isChildProduct ? '0' : formData.stock} 
                    onChange={e => setFormData({...formData, stock: e.target.value})} 
                    disabled={!!product || isChildProduct} 
                    className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-mono  outline-none disabled:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm" 
                  />
                  {isChildProduct ? (
                    <span className="text-[10px] text-blue-600 font-bold mt-1 block">Al ser pieza suelta, el stock iniciará en 0 y se llenará al romper cajas.</span>
                  ) : (
                    product && <span className="text-[10px] text-zinc-400 mt-1 block">Modifícalo desde Ajustes de Kardex.</span>
                  )}
                </div>

                <div className="flex flex-col justify-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none bg-white px-3 py-2 rounded-xl border border-zinc-200 shadow-sm hover:bg-zinc-50">
                    <input type="checkbox" checked={formData.isByWeight} onChange={e => setFormData({...formData, isByWeight: e.target.checked})} className="w-4 h-4 rounded text-zinc-900 accent-zinc-900" />
                    <span className="text-xs font-bold text-zinc-800">Venta a granel (Kg)</span>
                  </label>
                </div>
              </div>

            </div>

            {/* SECCIONES MODULARES */}
            <ProductUnpackSection isOpen={openSection === 'UNPACK'} onToggle={() => setOpenSection(openSection === 'UNPACK' ? 'NONE' : 'UNPACK')} isChild={isChildProduct} setIsChild={setIsChildProduct} formData={formData} setFormData={setFormData} catalog={parentCatalog} />
            
            <ProductPromoSection isOpen={openSection === 'PROMOS'} onToggle={() => setOpenSection(openSection === 'PROMOS' ? 'NONE' : 'PROMOS')} formData={formData} setFormData={setFormData} />

            <div className="pt-2 flex gap-3 sticky bottom-0 bg-white pb-1">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-50">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 shadow-md">Guardar Producto</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}