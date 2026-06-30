import React from 'react';
import { DollarSign, CreditCard, Send, Clock } from 'lucide-react';
import { formatMoney } from '@/lib/utils/format';

interface PaymentBreakdownProps {
  desglose: {
    CASH: number;
    CARD: number;
    TRANSFER: number;
    CREDIT: number;
  };
}

export default function PaymentBreakdown({ desglose }: PaymentBreakdownProps) {
  // Calculamos el total de ingresos reales (Excluimos el crédito porque es aire)
  const totalReal = desglose.CASH + desglose.CARD + desglose.TRANSFER;

  // Función para sacar el porcentaje de la barra de progreso
  const getPercent = (amount: number) => {
    if (totalReal === 0) return 0;
    return Math.round((amount / totalReal) * 100);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm w-full lg:max-w-md">
      <div className="mb-5">
        <h3 className="text-base font-bold text-zinc-900">Ingresos por Método</h3>
        <p className="text-xs text-zinc-500 font-medium mt-0.5">Dinero real que entró a las cuentas</p>
      </div>

      <div className="space-y-4">
        
        {/* EFECTIVO */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-zinc-700">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Efectivo
            </span>
            <span className="text-zinc-900">{formatMoney(desglose.CASH)}</span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${getPercent(desglose.CASH)}%` }} />
          </div>
        </div>

        {/* TARJETA */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-zinc-700">
              <CreditCard className="w-3.5 h-3.5 text-blue-500" /> Tarjeta (Terminal)
            </span>
            <span className="text-zinc-900">{formatMoney(desglose.CARD)}</span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${getPercent(desglose.CARD)}%` }} />
          </div>
        </div>

        {/* TRANSFERENCIA */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-zinc-700">
              <Send className="w-3.5 h-3.5 text-purple-500" /> Transferencia (SPEI)
            </span>
            <span className="text-zinc-900">{formatMoney(desglose.TRANSFER)}</span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
            <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${getPercent(desglose.TRANSFER)}%` }} />
          </div>
        </div>

      </div>

      {/* AVISO DE FIADOS  */}
      <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between items-center bg-amber-50/50 -mx-6 px-6 -mb-6 pb-5 rounded-b-2xl">
        <div className="flex items-center gap-2 text-amber-700">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold">Mercancía dada a crédito</span>
        </div>
        <span className="text-xs font-black text-amber-700">{formatMoney(desglose.CREDIT)}</span>
      </div>

    </div>
  );
}