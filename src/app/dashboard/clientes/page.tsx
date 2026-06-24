'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import CustomerTable, { Customer } from './components/CustomerTable';
import RegisterCustomerModal from './components/RegisterCustomerModal';
import AbonoModal from './components/AbonoModal';

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAbonoOpen, setIsAbonoOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // spinner
  const fetchInicial = async () => {
    setIsLoadingInitial(true);
    try {
      const res = await fetch('/api/customers');
      if (res.ok) setCustomers(await res.json());
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  const refetchSilencioso = async () => {
    const res = await fetch('/api/customers');
    if (res.ok) {
      const data = await res.json();
      setCustomers(data); 
    }
  };

  useEffect(() => {
    fetchInicial();
  }, []);

  const handleOpenAbono = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsAbonoOpen(true);
  };

  const handleAbonoOptimista = (id: string, montoAbonado: number) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const nuevoBalance = c.balance + montoAbonado;
        return { ...c, balance: Math.abs(nuevoBalance) < 0.01 ? 0 : nuevoBalance };
      }
      return c;
    }));
  };

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-xs font-medium">Sincronizando cuentas por cobrar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900">
      <div className="max-w-screen-xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">Libreta de Fiados</h1>
            <p className="text-sm text-zinc-500 mt-1">Monitorea los saldos pendientes y registra abonos en efectivo.</p>
          </div>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-zinc-800 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Agregar Cliente</span>
          </button>
        </div>

        <CustomerTable 
          customers={customers} 
          onAbonoClick={handleOpenAbono} 
        />

        <RegisterCustomerModal 
          isOpen={isRegisterOpen} 
          onClose={() => setIsRegisterOpen(false)} 
          onSuccess={refetchSilencioso} 
        />

        <AbonoModal 
          isOpen={isAbonoOpen} 
          customer={selectedCustomer} 
          onClose={() => { setIsAbonoOpen(false); setSelectedCustomer(null); }} 
          onSuccess={refetchSilencioso} 
          onAbonoInstantaneo={handleAbonoOptimista}
        />

      </div>
    </div>
  );
}