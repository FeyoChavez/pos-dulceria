import React from 'react';
import { Zap, ChevronDown } from 'lucide-react';

interface PromoSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  formData: any;
  setFormData: (data: any) => void;
}

export default function ProductPromoSection({ isOpen, onToggle, formData, setFormData }: PromoSectionProps) {
  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/50 transition-all">
      <button type="button" onClick={onToggle} className="w-full px-4 py-3 flex items-center justify-between bg-zinc-100/80 hover:bg-zinc-200/60 transition-colors border-b border-zinc-200 text-left">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          <span className="text-[11px] font-black text-zinc-700 uppercase tracking-wider">Promociones y Mayoreo</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className={`p-4 space-y-4 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-3">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Configuración de Mayoreo</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Precio Mayoreo ($)</label>
              <input type="number" step="0.01" placeholder="9.50" value={formData.priceWholesale} onChange={e => setFormData({...formData, priceWholesale: e.target.value})} className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-zinc-900" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">A partir de ({formData.isByWeight ? 'Kg' : 'Uds'})</label>
              <input type="number" step={formData.isByWeight ? "any" : "1"} placeholder="6" value={formData.minWholesaleQty} onChange={e => setFormData({...formData, minWholesaleQty: e.target.value})} className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-zinc-900" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-3">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Oferta Temporal</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">% Descuento</label>
              <input type="number" step="0.1" min="0" max="100" placeholder="15" value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})} className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-zinc-900" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Vence el</label>
              <input type="datetime-local" value={formData.discountEndDate} onChange={e => setFormData({...formData, discountEndDate: e.target.value})} className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-semibold outline-none focus:ring-1 focus:ring-zinc-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}