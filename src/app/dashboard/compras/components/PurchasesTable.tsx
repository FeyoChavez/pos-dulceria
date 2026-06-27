import React from 'react';
import { Package, Eye, Building2, Calendar, CreditCard } from 'lucide-react';

interface PurchasesTableProps {
  purchases: any[];
  isLoading: boolean;
  onSelect: (purchase: any) => void;
}

export default function PurchasesTable({ purchases, isLoading, onSelect }: PurchasesTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Consultando folios...</p>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-16 text-center space-y-3">
        <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto border border-zinc-100 text-zinc-400"><Package className="w-6 h-6" /></div>
        <p className="text-sm font-black text-zinc-800">No hay entradas registradas en este periodo</p>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto">Intenta ampliando el rango de fechas en el calendario superior.</p>
      </div>
    );
  }

  const getFundingBadge = (p: any) => {
    if (p.status === 'PENDING') return { label: 'Crédito Fiado', style: 'bg-amber-50 text-amber-800 border-amber-200' };
    if (p.cashSessionId) return { label: 'Caja Registradora', style: 'bg-zinc-100 text-zinc-900 border-zinc-300 font-mono' };
    return { label: 'Bancos / Admin', style: 'bg-blue-50 text-blue-800 border-blue-200' };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-50/80 border-b border-zinc-200 text-[10px] font-black uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-6 py-4">Folio / Fecha</th>
              <th className="px-6 py-4">Proveedor</th>
              <th className="px-6 py-4">Artículos</th>
              <th className="px-6 py-4">Origen de Fondos</th>
              <th className="px-6 py-4 text-right">Inversión</th>
              <th className="px-6 py-4 text-center">Desglose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs font-medium">
            {purchases.map((pur) => {
              const badge = getFundingBadge(pur);
              const totalPiezas = pur.items.reduce((sum: number, i: any) => sum + i.quantity, 0);

              return (
                <tr key={pur.id} className="hover:bg-zinc-50/60 transition-colors group">
                  
                  <td className="px-6 py-4">
                    <span className="font-mono font-black text-zinc-900 block">#{pur.id.slice(-6).toUpperCase()}</span>
                    <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(pur.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-bold text-zinc-800">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" /> {pur.supplier.name}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-zinc-600">
                    <span className="font-bold text-zinc-900">{totalPiezas} pzs</span> en {pur.items.length} prods
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.style}`}>
                      {badge.label}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right font-mono font-black text-sm text-zinc-950">
                    ${pur.total.toFixed(2)}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onSelect(pur)}
                      className="p-2 bg-zinc-50 hover:bg-zinc-900 text-zinc-600 hover:text-white rounded-xl border border-zinc-200 hover:border-zinc-900 transition-all active:scale-95"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}