'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowDownRight, Plus, Receipt } from 'lucide-react';

export default function CajaExpensesCard({ expensesList }: { expensesList?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept || !amount || saving) return;

    setSaving(true);
    const toastId = toast.loading("Registrando salida de efectivo...");

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, amount: Number(amount) })
      });

      const resData = await res.json();

      if (res.ok) {
        toast.update(toastId, { render: "Egreso registrado", type: "success", isLoading: false, autoClose: 2000 });
        setConcept(''); setAmount(''); setIsOpen(false);
        window.location.reload(); 
      } else {
        toast.update(toastId, { render: resData.error || "Fondos insuficientes", type: "error", isLoading: false, autoClose: 4000 });
      }
    } catch {
      toast.update(toastId, { render: "Error de red", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-zinc-400" />
            Salidas de Efectivo del Turno
          </h3>
          <p className="text-xs text-zinc-500">Dinero retirado para pagos a proveedores o insumos.</p>
        </div>
        
        <button onClick={() => setIsOpen(true)} className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95 shrink-0">
          <Plus className="w-3.5 h-3.5" />
          Registrar Salida
        </button>
      </div>

      <div className="border border-zinc-100 rounded-xl overflow-hidden divide-y divide-zinc-100 bg-zinc-50/50">
        {(!expensesList || expensesList.length === 0) ? (
          <div className="py-6 text-center text-xs text-zinc-400 font-medium">No se han registrado salidas de dinero.</div>
        ) : (
          expensesList.map((gasto: any) => (
            <div key={gasto.id} className="p-3 bg-white flex justify-between items-center text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold"><ArrowDownRight className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="font-bold text-zinc-800">{gasto.concept}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">{new Date(gasto.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <span className="font-mono font-black text-amber-900 text-sm">-${gasto.amount.toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 text-center">
              <h3 className="text-base font-black text-zinc-900">Salida de Efectivo</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Se restará del cajón físico actual</p>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Concepto</label>
                <input type="text" required placeholder="Ej. Pago garrafón de agua" value={concept} onChange={e => setConcept(e.target.value)} className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Monto ($)</label>
                <input type="number" step="0.5" min="1" required placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-lg font-mono font-black outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="button" disabled={saving} onClick={() => setIsOpen(false)} className="flex-1 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" disabled={saving || !concept || !amount} className="flex-1 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold flex justify-center items-center">
                  {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}