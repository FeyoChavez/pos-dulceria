import React from 'react';

interface TicketProps {
  cart: any[];
  total: number;
  date: Date;
  tenant?: { name: string; legalName?: string; address?: string; phone?: string; ticketMessage?: string };
}

export default function Ticket({ cart, total, date, tenant }: TicketProps) {
  return (
    <div className="w-[80mm] mx-auto text-black bg-white font-mono text-sm leading-tight select-none">
      
      {/* CABECERA DINÁMICA */}
      <div className="text-center mb-4 space-y-0.5">
        <h2 className="font-black text-xl uppercase tracking-wider leading-none">
          {tenant?.name || 'MIPOS S.A.'}
        </h2>
        
        {tenant?.legalName && (
          <p className="text-[11px] font-bold uppercase pt-0.5">RFC: {tenant.legalName}</p>
        )}
        
        <p className="text-xs pt-1 leading-tight">
          {tenant?.address || 'Sucursal Centro'}
        </p>
        
        {tenant?.phone && (
          <p className="text-xs font-bold tracking-wide">TEL: {tenant.phone}</p>
        )}

        <p className="text-xs pt-2 border-b border-black pb-2">
          {date.toLocaleString('es-MX', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
          })}
        </p>
      </div>

      {/* DETALLE DE PRODUCTOS */}
      <div className="mb-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-black uppercase text-left">
              <th className="py-1 w-12">Cant</th>
              <th className="py-1">Descripción</th>
              <th className="py-1 text-right">Imp</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {cart.map((item, i) => (
              <tr key={i} className="border-b border-dashed border-gray-300">
                <td className="py-1 font-bold">
                  {item.isByWeight ? item.quantity.toFixed(3) : item.quantity}
                </td>
                <td className="py-1 pr-1 break-words font-sans font-semibold">
                  {item.name}
                </td>
                <td className="py-1 text-right font-mono font-medium">
                  ${item.subtotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTAL */}
      <div className="flex justify-between items-center font-black text-lg border-t-2 border-black pt-2 mb-4">
        <span>TOTAL:</span>
        <span>${total.toFixed(2)}</span>
      </div>

      {/* PIE DE PÁGINA DINÁMICO */}
      <div className="text-center space-y-1.5 border-t border-dashed border-gray-300 pt-3">
        <p className="text-xs font-bold uppercase leading-snug">
          {tenant?.ticketMessage || '¡GRACIAS POR TU COMPRA! VUELVA PRONTO'}
        </p>
        <p className="text-[10px] opacity-40 font-sans tracking-tighter">Generado por MiPOS SaaS</p>
      </div>

    </div>
  );
}