import React from 'react';

interface TicketProps {
  cart: any[];
  total: number;
  date: Date;
}

export default function Ticket({ cart, total, date }: TicketProps) {
  return (
    <div className="w-[80mm] mx-auto text-black bg-white font-mono text-sm leading-tight">
      <div className="text-center mb-4">
        <h2 className="font-bold text-xl uppercase tracking-widest">MIPOS S.A.</h2>
        <p className="text-xs mt-1">Sucursal Centro</p>
        <p className="text-xs">¡Gracias por tu compra!</p>
        <p className="text-xs mt-2 border-b border-black pb-2">
          {date.toLocaleString('es-MX', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
          })}
        </p>
      </div>

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
                <td className="py-1">
                  {item.isByWeight ? item.quantity.toFixed(3) : item.quantity}
                </td>
                <td className="py-1 pr-1 break-words">
                  {item.name}
                </td>
                <td className="py-1 text-right">
                  ${item.subtotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center font-bold text-lg border-t border-black pt-2 mb-6">
        <span>TOTAL:</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <div className="text-center text-xs">
        <p>*** VUELVA PRONTO ***</p>
        <p className="mt-1 opacity-50">Generado por MiPOS SaaS</p>
      </div>
    </div>
  );
}