import React from 'react';
import { Building2, Wallet } from 'lucide-react';

interface PurchaseHeaderFormProps {
  suppliers: any[];
  supplierId: string;
  onSupplierChange: (id: string) => void;
  fundingSource: string;
  onSourceChange: (src: string) => void;
  paymentMethod: string;
  onMethodChange: (method: string) => void;
}

export default function PurchaseHeaderForm({
  suppliers, supplierId, onSupplierChange,
  fundingSource, onSourceChange,
  paymentMethod, onMethodChange
}: PurchaseHeaderFormProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-200 grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* SELECTOR DE PROVEEDOR */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" /> Proveedor que surte *
        </label>
        <select 
          value={supplierId} onChange={(e) => onSupplierChange(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
        >
          <option value="">-- Selecciona marca --</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* SELECTOR DE ORIGEN DE FONDOS */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5" /> ¿De dónde sale el dinero? *
        </label>
        <select 
          value={fundingSource} onChange={(e) => onSourceChange(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
        >
          <option value="CASH_REGISTER">Caja Registradora (Turno activo)</option>
          <option value="ADMINISTRATION">Caja General / Banco (No altera turno)</option>
          <option value="SUPPLIER_CREDIT">Crédito fiado (Deuda a pagar después)</option>
        </select>
      </div>

      {/* MÉTODO DE PAGO */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
          Forma de Pago
        </label>
        <select 
          disabled={fundingSource === 'SUPPLIER_CREDIT'}
          value={paymentMethod} onChange={(e) => onMethodChange(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-40 transition-all"
        >
          <option value="CASH">Efectivo</option>
          <option value="TRANSFER">Transferencia SPEI</option>
          <option value="CARD">Tarjeta de Débito/Crédito</option>
        </select>
      </div>

    </div>
  );
}