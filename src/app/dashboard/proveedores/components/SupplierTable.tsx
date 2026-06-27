import React from 'react';
import { Building2, Phone, Mail, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Supplier } from '../page'; 

interface SupplierTableProps {
  suppliers: Supplier[];
  isLoading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string, name: string) => void;
}

export default function SupplierTable({ suppliers, isLoading, onEdit, onDelete }: SupplierTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-zinc-500">Cargando directorio...</p>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 py-16 text-center">
        <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-100"><Building2 className="w-6 h-6 text-zinc-400" /></div>
        <p className="text-sm font-bold text-zinc-700">No se encontraron proveedores</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-50/90 border-b border-zinc-200">
            <tr className="text-zinc-500 text-[10px] uppercase tracking-wider font-black">
              <th className="px-6 py-4 w-[30%]">Proveedor</th>
              <th className="px-6 py-4 w-[30%]">Contacto</th>
              <th className="px-6 py-4 w-[25%]">Dirección</th>
              <th className="px-6 py-4 w-[15%] text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {suppliers.map(supplier => (
              <tr key={supplier.id} className="hover:bg-zinc-50/60 transition-colors group">
                <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 border flex items-center justify-center text-zinc-500"><Building2 className="w-4 h-4" /></div>
                  {supplier.name}
                </td>
                <td className="px-6 py-4 space-y-1 text-xs text-zinc-600 font-medium">
                  {supplier.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-zinc-400" />{supplier.phone}</div>}
                  {supplier.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-zinc-400" />{supplier.email}</div>}
                </td>
                <td className="px-6 py-4 text-xs text-zinc-500 truncate max-w-[200px]">{supplier.address || '—'}</td>
                
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onEdit(supplier)} title="Editar" className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(supplier.id, supplier.name)} title="Eliminar" className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}