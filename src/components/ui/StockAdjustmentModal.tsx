import React, { useState } from 'react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || !reason || isSubmitting) return;

    const qty = Number(quantity);

    if (type === 'OUT' && qty > product.stock) {
      alert(`¡Ajuste Inválido! No puedes retirar ${qty} unidades de ${product.name} porque solo quedan ${product.stock} disponibles en el inventario.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/kardex/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          type,
          quantity: qty,
          reason
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Stock actualizado y movimiento registrado correctamente.');
        onSuccess();
        onClose();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error de conexión al ajustar el inventario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-100">
        
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Ajustar Stock (Kardex)</h3>
            <p className="text-xs text-zinc-500 font-medium">{product.name} (Disponibles: {product.stock})</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Tipo de Ajuste</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setType('IN'); setReason(''); }}
                className={`py-2 px-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  type === 'IN' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                <span className="text-lg leading-none">+</span> Entrada
              </button>
              <button
                type="button"
                onClick={() => { setType('OUT'); setReason(''); }}
                className={`py-2 px-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  type === 'OUT' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                <span className="text-lg leading-none">-</span> Salida
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Cantidad</label>
              <input
                required
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="0"
              />
            </div>
            <div className="w-2/3">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Motivo del Ajuste</label>
              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="">Selecciona una razón...</option>
                {type === 'IN' ? (
                  <>
                    <option value="Compra a proveedor">Compra a proveedor</option>
                    <option value="Ajuste de inventario inicial">Ajuste de inventario inicial</option>
                    <option value="Devolución externa">Devolución externa</option>
                  </>
                ) : (
                  <>
                    <option value="Merma por caducidad">Merma por caducidad</option>
                    <option value="Producto dañado/roto">Producto dañado/roto</option>
                    <option value="Consumo interno">Consumo interno</option>
                    <option value="Pérdida desconocida">Pérdida desconocida (Faltante)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-xl font-medium text-sm text-white shadow-md transition-all disabled:opacity-50 ${
              type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSubmitting ? 'Registrando...' : 'Confirmar Ajuste'}
          </button>
        </form>

      </div>
    </div>
  );
}