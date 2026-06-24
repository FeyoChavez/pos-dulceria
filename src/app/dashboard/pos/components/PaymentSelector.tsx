'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DollarSign, CreditCard, Send, BookOpen, User, Search, X } from 'lucide-react';

export interface Customer {
  id: string;
  name: string;
  balance: number;
}

interface PaymentSelectorProps {
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT';
  onChangePayment: (method: 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT') => void;
  clientes: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
}

export default function PaymentSelector({
  paymentMethod,
  onChangePayment,
  clientes,
  selectedCustomer,
  onSelectCustomer
}: PaymentSelectorProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = clientes
    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Método de Cobro</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button" onClick={() => onChangePayment('CASH')}
          className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
            paymentMethod === 'CASH' ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Efectivo</span>
        </button>

        <button
          type="button" onClick={() => onChangePayment('CARD')}
          className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
            paymentMethod === 'CARD' ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Tarjeta</span>
        </button>

        <button
          type="button" onClick={() => onChangePayment('TRANSFER')}
          className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
            paymentMethod === 'TRANSFER' ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Transferencia</span>
        </button>

        <button
          type="button" onClick={() => { onChangePayment('CREDIT'); setIsOpen(true); }}
          className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
            paymentMethod === 'CREDIT' ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Fiado / Crédito</span>
        </button>
      </div>

      {paymentMethod === 'CREDIT' && (
        <div className="pt-2 space-y-2 animate-in fade-in duration-150" ref={comboboxRef}>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700">
            Asignar Deudor de la Libreta
          </label>

          {selectedCustomer ? (
            <div className="flex items-center justify-between p-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold shadow-inner">
              <div className="flex items-center gap-2 overflow-hidden">
                <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{selectedCustomer.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded">
                  {selectedCustomer.balance < 0 ? `Debe $${Math.abs(selectedCustomer.balance).toFixed(2)}` : '$0.00'}
                </span>
                <button
                  type="button" onClick={() => onSelectCustomer(null)}
                  className="text-zinc-400 hover:text-white p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Teclea el nombre del cliente..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                  onFocus={() => setIsOpen(true)}
                  className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all font-medium"
                />
              </div>

              {isOpen && query.trim() !== '' && (
                <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden divide-y divide-zinc-100">
                  {filteredCustomers.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => { onSelectCustomer(cust); setIsOpen(false); setQuery(''); }}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-700 hover:bg-zinc-100 transition-colors flex justify-between items-center group"
                    >
                      <span className="font-semibold group-hover:text-zinc-900">{cust.name}</span>
                      
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        cust.balance < 0 ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {cust.balance < 0 ? `-$${Math.abs(cust.balance).toFixed(2)}` : '$0.00'}
                      </span>
                    </button>
                  ))}

                  {filteredCustomers.length === 0 && (
                    <div className="p-3 text-center text-xs text-zinc-400">
                      No se encontró a "{query}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}