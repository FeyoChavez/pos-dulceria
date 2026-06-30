import React from 'react';
import CajaSummaryCard from './CajaSummaryCard';
import CajaExpensesCard from './CajaExpensesCard';
import CajaClosingCard from './CajaClosingCard';

export default function TurnoAbiertoPanel({ 
  data, 
  isAdmin, 
  onCerrar 
}: { 
  data: any, 
  isAdmin: boolean, 
  onCerrar: (monto: number) => Promise<void> 
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <CajaSummaryCard data={data} isAdmin={isAdmin} />
      
      <CajaExpensesCard expensesList={data.expensesList} />
      <CajaClosingCard onCerrar={onCerrar} />
    </div>
  );
}