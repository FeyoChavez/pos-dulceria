import React from 'react';
import { Building2, Calendar, Package, X } from 'lucide-react';
import { formatMoney } from '@/lib/utils/format';

interface PurchaseDetailModalProps {
  purchase: any | null;
  onClose: () => void;
}

export default function PurchaseDetailModal({ purchase, onClose }: PurchaseDetailModalProps) {
  if (!purchase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* CABECERA DEL COMPROBANTE */}
        <div className="p-6 bg-zinc-900 text-white flex justify-between items-start shrink-0">
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Nota de Entrada a Almacén</span>
            <h3 className="text-xl font-black font-mono mt-0.5">FOLIO #{purchase.id.slice(-8).toUpperCase()}</h3>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-2 font-medium">
              <Building2 className="w-3.5 h-3.5 text-zinc-300" /> {purchase.supplier.name} • {new Date(purchase.createdAt).toLocaleString('es-MX')}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>

        {/* CUERPO: LISTA DE DULCES */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 divide-y divide-zinc-100">
          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 pb-1">Mercancía Recibida</p>
          
          {purchase.items.map((item: any, idx: number) => (
            <div key={idx} className="pt-3 flex justify-between items-center text-xs">
              <div className="flex items-center gap-3 pr-4 truncate">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                  x{item.quantity}
                </div>
                <div className="truncate">
                  <p className="font-bold text-zinc-900 truncate text-sm">{item.product.name}</p>
                  <p className="text-[11px] text-zinc-400 font-mono">Costo unitario pactado: {formatMoney(item.costPrice)}</p>
                </div>
              </div>
              <span className="font-mono font-black text-zinc-900 text-sm shrink-0">
                {formatMoney(item.quantity * item.costPrice)}
              </span>
            </div>
          ))}
        </div>

        {/* PIE FINANCIERO */}
        <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center shrink-0">
          <div>
            <span className="text-[11px] font-bold text-zinc-500 block">Estatus de la Factura</span>
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              purchase.status === 'PENDING' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
            }`}>
              {purchase.status === 'PENDING' ? 'Pendiente de Pago' : 'Liquidada al Proveedor'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Total de la Nota</span>
            <p className="text-2xl font-black font-mono text-zinc-950 mt-0.5">{formatMoney(purchase.total)}</p>
          </div>
        </div>

      </div>
    </div>
  );
}