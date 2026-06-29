import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { AlertCircle, Lock, Plus, Minus, X } from 'lucide-react';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  product: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockAdjustmentModal({ isOpen, product, onClose, onSuccess }: StockAdjustmentModalProps) {
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const qty = Number(quantity);
  
  // validación
  const isFormValid = qty > 0 && reason !== '' && (type === 'IN' || qty <= product.stock);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    if (type === 'OUT' && qty > product.stock) {
      toast.error(`Stock insuficiente. Solo quedan ${product.stock} unidades.`);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Procesando incidencia...');

    const fullReason = notes.trim() ? `${reason} (${notes.trim()})` : reason;

    try {
      const res = await fetch('/api/kardex/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          type,
          quantity: qty,
          reason: fullReason
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.update(toastId, { render: 'Inventario ajustado correctamente', type: 'success', isLoading: false, autoClose: 2000 });
        setQuantity(''); setReason(''); setNotes('');
        onSuccess();
        onClose();
      } else {
        toast.update(toastId, { render: data.error || 'Error al ajustar', type: 'error', isLoading: false, autoClose: 3500 });
      }
    } catch {
      toast.update(toastId, { render: 'Error de red al registrar movimiento', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-150">
        
        {/* CABECERA */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/80">
          <div>
            <h3 className="text-base font-black text-zinc-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Ajuste e Incidencia de Almacén
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              {product.name} <span className="font-mono text-zinc-900 font-bold">(Stock actual: {product.stock})</span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg bg-zinc-100/50 hover:bg-zinc-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* SELECTOR IN / OUT */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Tipo de Movimiento</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { setType('IN'); setReason(''); }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  type === 'IN' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' 
                    : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Entrada (Suma)
              </button>
              
              <button
                type="button"
                onClick={() => { setType('OUT'); setReason(''); }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  type === 'OUT' 
                    ? 'bg-red-50 border-red-500 text-red-800 shadow-sm' 
                    : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100'
                }`}
              >
                <Minus className="w-3.5 h-3.5" /> Salida (Merma)
              </button>
            </div>
          </div>

          {/* PIEZAS Y MOTIVO */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-zinc-700 mb-1">Piezas *</label>
              <input
                required type="number" min="0.01" step="any" placeholder="0"
                value={quantity} onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-base font-mono font-black text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-zinc-700 mb-1">Motivo / Causa *</label>
              <select
                required value={reason} onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none"
              >
                <option value="">-- Elige motivo --</option>
                {type === 'IN' ? (
                  <>
                    <option value="Ajuste de inventario inicial">Conteo físico inicial</option>
                    <option value="Bonificación de proveedor">Regalo / Bonificación de proveedor</option>
                    <option value="Devolución externa al anaquel">Reingreso al anaquel</option>
                  </>
                ) : (
                  <>
                    <option value="Merma por caducidad">Merma por caducidad</option>
                    <option value="Producto dañado/roto">Producto dañado o roto</option>
                    <option value="Consumo interno de dirección">Consumo interno (Disparo)</option>
                    <option value="Faltante en conteo físico">Pérdida / Faltante misterioso</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* NOTAS ADICIONALES */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Detalles opcionales (Lote, responsable...)</label>
            <input
              type="text" placeholder="Ej. Se cayó al acomodar el exhibidor"
              value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none text-zinc-800"
            />
          </div>

          {/* BOTÓN GATILLO CON BLOQUEO */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                !isFormValid || isSubmitting
                  ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed shadow-none'
                  : type === 'IN'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-98 cursor-pointer'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 active:scale-98 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : !isFormValid ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-zinc-400" /> Faltan datos para procesar
                </>
              ) : (
                `Confirmar ${type === 'IN' ? 'Entrada' : 'Merma de Almacén'}`
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}