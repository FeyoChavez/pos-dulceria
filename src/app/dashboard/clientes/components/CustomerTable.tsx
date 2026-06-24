'use client';

import React from 'react';
import { User, Phone, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  balance: number;
  createdAt: string;
}

interface CustomerTableProps {
  customers: Customer[];
  onAbonoClick: (customer: Customer) => void;
}

export default function CustomerTable({ customers, onAbonoClick }: CustomerTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-zinc-50/70 border-b border-zinc-200 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              <th className="py-4 px-6">Cliente</th>
              <th className="py-4 px-6">Teléfono</th>
              <th className="py-4 px-6 text-center">Estado de Cuenta</th>
              <th className="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-800">
            {customers.map((cust) => {
              const tieneDeuda = cust.balance < 0;

              return (
                <tr key={cust.id} className="hover:bg-zinc-50/40 transition-all">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      tieneDeuda ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {cust.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-zinc-900">{cust.name}</span>
                  </td>
                  
                  <td className="py-4 px-6 text-zinc-500 font-mono text-xs">
                    {cust.phone ? (
                      <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {cust.phone}</span>
                    ) : (
                      <span className="text-zinc-400">Sin teléfono</span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      tieneDeuda 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {tieneDeuda ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {tieneDeuda ? `Debe $${Math.abs(cust.balance).toFixed(2)}` : 'Al corriente'}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    {tieneDeuda && (
                      <button
                        onClick={() => onAbonoClick(cust)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Recibir Abono</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-zinc-400 text-xs font-normal">
                  No hay clientes registrados en la libreta.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}