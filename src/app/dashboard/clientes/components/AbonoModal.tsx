'use client';

import React, { useState } from 'react';
import { DollarSign, CreditCard, Send } from 'lucide-react';
import { Customer } from './CustomerTable';
import {toast} from 'react-toastify'

interface AbonoModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
  onAbonoInstantaneo: (id: string, monto: number) => void;
}

export default function AbonoModal({ isOpen, customer, onClose, onSuccess, onAbonoInstantaneo }: AbonoModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [formError, setFormError] = useState('');

  if (!isOpen || !customer) return null;

  const maxDeuda = Math.abs(customer.balance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const monto = parseFloat(amount);
    
    if (isNaN(monto) || monto <= 0) {
      setFormError('Ingresa un monto válido mayor a 0');
      return;
    }

    const montoCentavos = Math.round(monto * 100);
    const deudaCentavos = Math.round(maxDeuda * 100);

    if (montoCentavos > deudaCentavos) {
      setFormError(`El abono no puede superar la deuda actual de $${maxDeuda.toFixed(2)}.`);
      return;
    }

    const payload = {
      customerId: customer.id,
      montoAbono: monto,
      paymentMethod
    };

    onAbonoInstantaneo(customer.id, monto);
    
    setAmount('');
    setPaymentMethod('CASH');
    setFormError('');
    onClose();

    fetch('/api/customers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(res => {
      if (res.ok) {
        toast.success(`¡Abono de $${monto.toFixed(2)} registrado a ${customer.name}!`);
        onSuccess(); 
      } else {
        toast.error("Desincronización: El abono fue rechazado por la nube.");
        onSuccess(); 
      }
    })
    .catch(() => {
      console.error("Fallo de red en envío optimista.");
      onSuccess(); 
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <h3 className="font-bold text-base text-zinc-900">Recibir Abono</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-xs font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/80 text-xs space-y-1">
            <p className="text-zinc-500 font-medium">Cliente: <span className="text-zinc-900 font-bold">{customer.name}</span></p>
            <p className="text-zinc-500 font-medium">Deuda Total: <span className="text-red-600 font-black">${maxDeuda.toFixed(2)}</span></p>
          </div>

          {formError && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold">{formError}</div>}

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Monto a abonar ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="number" step="any" required placeholder="0.00" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Forma de pago</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button" onClick={() => setPaymentMethod('CASH')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'CASH' ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <DollarSign className="w-3 h-3" /> Efectivo
              </button>
              <button
                type="button" onClick={() => setPaymentMethod('CARD')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'CARD' ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <CreditCard className="w-3 h-3" /> Tarjeta
              </button>
              <button
                type="button" onClick={() => setPaymentMethod('TRANSFER')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'TRANSFER' ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <Send className="w-3 h-3" /> Transfer
              </button>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-xs hover:bg-zinc-200">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-zinc-800 shadow-md">
              Confirmar Abono
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}