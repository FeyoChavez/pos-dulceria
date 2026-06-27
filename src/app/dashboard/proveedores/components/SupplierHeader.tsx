import React from 'react';
import { Plus, Search } from 'lucide-react';

interface SupplierHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewClick: () => void;
}

export default function SupplierHeader({ searchTerm, onSearchChange, onNewClick }: SupplierHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Directorio de Proveedores</h1>
          <p className="text-sm text-zinc-500 mt-1">Gestiona las empresas y contactos que surten tu inventario.</p>
        </div>
        <button 
          onClick={onNewClick} 
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </button>
      </div>

      <div className="bg-white p-2 rounded-2xl shadow-sm border border-zinc-200 flex items-center gap-3 px-4 transition-all focus-within:border-zinc-400 focus-within:ring-4 focus-within:ring-zinc-100">
        <Search className="w-5 h-5 text-zinc-400 shrink-0" />
        <input 
          type="text" 
          placeholder="Buscar proveedor por nombre comercial..." 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent border-none focus:outline-none text-sm py-2 text-zinc-900 placeholder:text-zinc-400 font-medium"
        />
      </div>
    </div>
  );
}