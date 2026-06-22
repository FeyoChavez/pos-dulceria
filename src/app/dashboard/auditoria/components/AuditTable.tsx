import React from 'react';

interface AuditTableProps {
  isLoading: boolean;
  reports: any[];
  selectedSessionId?: string;
  onSelectSession: (report: any) => void;
}

export default function AuditTable({ isLoading, reports, selectedSessionId, onSelectSession }: AuditTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="bg-zinc-50/95 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">Fecha Cierre</th>
              <th className="px-6 py-4">Cajero</th>
              <th className="px-6 py-4 text-right">Esperado</th>
              <th className="px-6 py-4 text-right">Reportado</th>
              <th className="px-6 py-4 text-right">Diferencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-10 text-zinc-500 text-sm">Compilando datos de auditoría...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-zinc-500 text-sm">No se encontraron cortes de caja cerrados en este rango de fechas.</td></tr>
            ) : (
              reports.map((report) => (
                <tr 
                  key={report.id} 
                  onClick={() => onSelectSession(report)}
                  className={`cursor-pointer transition-colors ${selectedSessionId === report.id ? 'bg-zinc-100/80 font-medium' : 'hover:bg-zinc-50/80'}`}
                >
                  <td className="px-6 py-4 text-sm text-zinc-900">
                    {new Date(report.closedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{report.cashier}</td>
                  <td className="px-6 py-4 text-sm text-right text-zinc-600">${report.expectedBalance.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-zinc-900">${report.closingBalance.toFixed(2)}</td>
                  <td className={`px-6 py-4 text-sm text-right font-bold ${
                    report.difference === 0 ? 'text-emerald-600' : report.difference < 0 ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    {report.difference === 0 ? 'Exacto' : `${report.difference > 0 ? '+' : ''}$${report.difference.toFixed(2)}`}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}