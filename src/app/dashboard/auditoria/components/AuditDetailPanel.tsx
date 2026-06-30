import { formatMoney } from '@/lib/utils/format';
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

  const totalNeto = (session.totalSales || 0) - (session.totalRefunded || 0);
  const allItems = session.salesDetail?.flatMap((s: any) => s.items) || [];
  const egresos = session.expensesDetail || [];

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
              ? `⚠ Alerta: Faltante de efectivo por $${Math.abs(session.difference).toFixed(2)}.` 
              : `⚠ Alerta: Sobrante no justificado por ${formatMoney(session.difference)}`}
        </div>

        {/* DESGLOSE CONTABLE */}
        <div className="space-y-2.5 text-sm text-zinc-600 border-b border-zinc-100 pb-4">
          <div className="flex justify-between"><span>Fondo Inicial:</span><span className="font-semibold text-zinc-900">{formatMoney(session.openingBalance) || 0}</span></div>
          <div className="flex justify-between"><span>Ventas Efectivo:</span><span className="font-semibold text-zinc-900">{formatMoney(session.cashSales) || 0}</span></div>
          <div className="flex justify-between"><span>Ventas Tarjeta:</span><span className="font-semibold text-zinc-900">{formatMoney(session.cardSales) || 0}</span></div>
          
          {session.totalRefunded > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Devoluciones (Salida):</span>
              <span className="font-mono font-bold">-{formatMoney(session.totalRefunded)}</span>
            </div>
          )}

          {session.totalExpenses > 0 && (
            <div className="flex justify-between text-amber-700 font-medium">
              <span>Gastos (Caja Chica):</span>
              <span className="font-mono font-bold">-{formatMoney(session.totalExpenses)}</span>
            </div>
          )}

          <div className="flex justify-between border-t border-dashed pt-2 font-bold text-zinc-900">
            <span>Ventas Netas Turno:</span><span>{formatMoney(totalNeto)} ({session.salesCount} tkts)</span>
          </div>

          <div className="flex justify-between text-xs text-zinc-400 pt-0.5">
            <span>Efectivo físico meta:</span>
            <span className="font-mono font-bold text-zinc-600">{formatMoney(session.expectedBalance) || 0}</span>
          </div>
        </div>

        {/* DULCES */}
        <div>
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
            Dulces Vendidos ({allItems.length})
          </h4>
          <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
            {allItems.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                <span className="font-medium text-zinc-800 max-w-[170px] truncate" title={item.product.name}>{item.product.name}</span>
                <span className="text-zinc-500 font-mono">x{item.quantity} ({formatMoney(item.priceSnap)})</span>
              </div>
            ))}
            {allItems.length === 0 && (
              <p className="text-xs text-zinc-400 text-center py-3">No se vendió mercancía.</p>
            )}
          </div>
        </div>

        {/* SALIDAS  */}
        {egresos.length > 0 && (
          <div className="pt-3 border-t border-zinc-100 animate-in fade-in duration-300">
            <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Salidas de Efectivo</span>
              <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-black">{egresos.length}</span>
            </h4>
            <div className="max-h-[130px] overflow-y-auto space-y-1.5 pr-1">
              {egresos.map((exp: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-amber-50/50 p-2 rounded-lg border border-amber-200/60">
                  <div className="truncate pr-2">
                    <p className="font-bold text-zinc-800 truncate max-w-[160px]" title={exp.concept}>{exp.concept}</p>
                    <p className="text-[9px] text-zinc-400 font-mono mt-0.5">
                      {new Date(exp.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="font-mono font-black text-amber-900 shrink-0">
                    -{formatMoney(exp.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}