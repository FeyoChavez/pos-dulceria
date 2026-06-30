import React, { useState } from 'react';
import { PackageOpen, ChevronDown, Search, X } from 'lucide-react';

interface UnpackSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isChild: boolean;
  setIsChild: (val: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  catalog: any[];
}

export default function ProductUnpackSection({ isOpen, onToggle, isChild, setIsChild, formData, setFormData, catalog }: UnpackSectionProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedParent = catalog.find(p => p.id === formData.parentId);

  const filtered = catalog.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    (p.barcode && p.barcode.includes(query))
  );

  return (
    <div className="border border-blue-200 rounded-xl overflow-hidden bg-blue-50/20 transition-all">
      <button type="button" onClick={onToggle} className="w-full px-4 py-3 flex items-center justify-between bg-blue-50/80 hover:bg-blue-100/50 transition-colors border-b border-blue-100 text-left">
        <div className="flex items-center gap-2">
          <PackageOpen className="w-4 h-4 text-blue-600" />
          <span className="text-[11px] font-black text-blue-950 uppercase tracking-wider">Desempaque / Piezas Sueltas</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className={`p-4 space-y-4 ${isOpen ? 'block' : 'hidden'}`}>
        <label className="flex items-center gap-2 cursor-pointer select-none bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
          <input type="checkbox" checked={isChild} onChange={(e) => setIsChild(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-blue-300 focus:ring-blue-500" />
          <span className="text-xs font-bold text-blue-950">¿Este dulce sale de abrir una caja mayor?</span>
        </label>

        {isChild && (
          <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-sm space-y-3.5 animate-in fade-in duration-150">
            {/* buscador */}
            <div className="relative">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">Caja Madre en Almacén *</label>
              
              {selectedParent ? (
                <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 font-mono">
                  <span className="truncate">📦 {selectedParent.name} (Disp: {selectedParent.stock})</span>
                  <button type="button" onClick={() => setFormData({...formData, parentId: ''})} className="p-1 hover:bg-blue-100 rounded text-blue-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Escribe para buscar caja por nombre o código..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Retraso vital para permitir el clic
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 text-zinc-800"
                  />
                  {showDropdown && (
                    <ul className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-2xl max-h-44 overflow-y-auto divide-y divide-zinc-100 text-xs">
                      {filtered.length === 0 ? (
                        <li className="p-3 text-zinc-400 text-center font-medium">No se encontraron productos</li>
                      ) : (
                        filtered.map(p => (
                          <li 
                            key={p.id}
                            onMouseDown={() => { setFormData({...formData, parentId: p.id}); setShowDropdown(false); setQuery(''); }}
                            className="p-2.5 hover:bg-blue-50 cursor-pointer font-bold text-zinc-700 flex justify-between"
                          >
                            <span>{p.name}</span>
                            <span className="font-mono text-[10px] text-zinc-400">Stock: {p.stock}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">Contenido por empaque cerrado *</label>
              <input
                required={isChild} type="number" min="2" step="1" placeholder="Ej: 30 (Piezas o Kilos que salen)"
                value={formData.conversionFactor} onChange={(e) => setFormData({...formData, conversionFactor: e.target.value})}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono font-black text-blue-900 outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}