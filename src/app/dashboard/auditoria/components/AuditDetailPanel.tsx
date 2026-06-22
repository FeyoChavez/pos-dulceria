import React from 'react';

interface AuditDetailPanelProps {
  session: any | null;
}

export default function AuditDetailPanel({ session }: AuditDetailPanelProps) {
  if (!session) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 h-fit min-h-[450px] flex flex-col items-center justify-center text-center text-zinc-400 lg:mt-[116px]">
        <svg className="w-12 h-12 mb-3 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        <p className="text-sm font-medium text-zinc-500">Selecciona un corte de caja</p>
        <p className="text-xs mt-1 max-w-[200px]">Haz clic en cualquier renglón de la tabla para ver su auditoría profunda.</p>
      </div>
    );
  }

  // Calculo del Neto real considerando devoluciones
  const totalNeto = session.totalSales - (session.totalRefunded || 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 h-fit min-h-[450px] flex flex-col justify-between lg:mt-[116px]">
      <div className="space-y-6 flex-1">
        <div>
          <h3 className="text-lg font-bold text-zinc-900">Desglose del Turno</h3>
          <p className="text-xs text-zinc-400 mt-0.5">ID: {session.id.substring(0, 8)}...</p>
        </div>

        <div className={`p-4 rounded-xl border text-sm font-medium ${
          session.difference === 0 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : session.difference < 0 
              ? 'bg-red-50 text-red-800 border-red-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {session.difference === 0 
            ? '✓ Caja auditada y cuadrada perfectamente.' 
            : session.difference < 0 
              ? `⚠ Alerta: Faltante de efectivo en caja por $${Math.abs(session.difference).toFixed(2)}.` 
              : `⚠ Alerta: Sobrante no justificado en caja por $${session.difference.toFixed(2)}.`}
        </div>

        <div className="space-y-3 text-sm text-zinc-600 border-b border-zinc-100 pb-4">
          <div className="flex justify-between"><span>Fondo Inicial:</span><span className="font-semibold text-zinc-900">${session.openingBalance.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Ventas Efectivo:</span><span className="font-semibold text-zinc-900">${session.cashSales.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Ventas Tarjeta:</span><span className="font-semibold text-zinc-900">${session.cardSales.toFixed(2)}</span></div>
          
          {session.totalRefunded > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Efectivo Devuelto (Salidas):</span>
              <span className="font-semibold">-${session.totalRefunded.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between border-t border-dashed pt-2 font-medium text-zinc-900">
            <span>Total Neto Turno:</span><span>${totalNeto.toFixed(2)} ({session.salesCount} tkts)</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Dulces / Artículos Vendidos</h4>
          <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
            {session.salesDetail.flatMap((s: any) => s.items).map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-xs bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                <span className="font-medium text-zinc-800 max-w-[180px] truncate">{item.product.name}</span>
                <span className="text-zinc-500 font-mono">x{item.quantity} (${item.priceSnap.toFixed(2)})</span>
              </div>
            ))}
            {session.salesDetail.length === 0 && (
              <p className="text-xs text-zinc-400 text-center py-4">No se vendió nada en este turno.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}