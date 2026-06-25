import React, { useState, useEffect, useRef } from 'react';
import { Scale } from 'lucide-react';

interface WeightInputModalProps {
  isOpen: boolean;
  productName: string;
  onClose: () => void;
  onSubmit: (weight: number) => void;
}

export default function WeightInputModal({ isOpen, productName, onClose, onSubmit }: WeightInputModalProps) {
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'gr' | 'kg'>('gr'); 
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setWeight('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedValue = parseFloat(weight);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      // Si eligió gramos, lo convertimos a kilos para la base de datos
      const finalWeightInKg = unit === 'gr' ? parsedValue / 1000 : parsedValue;
      onSubmit(finalWeightInKg);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-zinc-200/50 text-zinc-700 rounded-full flex items-center justify-center mb-3">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-zinc-900 leading-tight">Captura de Báscula</h3>
          <p className="text-xs text-zinc-500 mt-1 font-medium px-4">{productName}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          
          <div className="flex bg-zinc-100 p-1 rounded-xl mb-6 w-full max-w-[220px] mx-auto">
            <button 
              type="button" onClick={() => setUnit('gr')} 
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${unit === 'gr' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Gramos
            </button>
            <button 
              type="button" onClick={() => setUnit('kg')} 
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${unit === 'kg' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Kilos
            </button>
          </div>

          <div className="mb-6">
            <div className="relative max-w-[220px] mx-auto">
              <input
                ref={inputRef}
                type="number"
                step="any"
                min="0.001"
                placeholder={unit === 'gr' ? "Ej: 250" : "Ej: 1.500"}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-2xl font-black font-mono text-center focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-900 placeholder:text-zinc-300"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                {unit}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={!weight || parseFloat(weight) <= 0} className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">Confirmar</button>
          </div>
        </form>

      </div>
    </div>
  );
}