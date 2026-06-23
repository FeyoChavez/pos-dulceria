'use client';

import React from 'react';
import { Shield, User, Ban, CheckCircle2 } from 'lucide-react';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CASHIER';
  isActive: boolean; 
  createdAt: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  onToggleStatus: (id: string, currentStatus: boolean, name: string) => void; 
}

export default function EmployeeTable({ employees, onToggleStatus }: EmployeeTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-zinc-50/70 border-b border-zinc-200 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              <th className="py-4 px-6">Usuario / Nombre</th>
              <th className="py-4 px-6">Correo Electrónico</th>
              <th className="py-4 px-6">Jerarquía / Rol</th>
              <th className="py-4 px-6 text-center">Estado</th>
              <th className="py-4 px-6 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-800">
            {employees.map((emp) => (
              <tr 
                key={emp.id} 
                className={`transition-all ${!emp.isActive ? 'bg-zinc-50/60 opacity-60' : 'hover:bg-zinc-50/40'}`}
              >
                <td className="py-4 px-6 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    emp.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`font-semibold ${!emp.isActive ? 'line-through text-zinc-500' : 'text-zinc-900'}`}>
                    {emp.name}
                  </span>
                </td>
                <td className="py-4 px-6 text-zinc-500 font-mono text-xs">{emp.email}</td>
                <td className="py-4 px-6">
                  {emp.role === 'ADMIN' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                      <Shield className="w-3 h-3" />
                      Administrador
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                      <User className="w-3 h-3" />
                      Cajero / POS
                    </span>
                  )}
                </td>
                
                {/* COLUMNA DE ESTADO VISUAL */}
                <td className="py-4 px-6 text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    emp.isActive 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {emp.isActive ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                    {emp.isActive ? 'Activo' : 'Revocado'}
                  </span>
                </td>

                {/* BOTÓN DE SOFT-DELETE */}
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => onToggleStatus(emp.id, emp.isActive, emp.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      emp.isActive
                        ? 'border-red-200 text-red-600 hover:bg-red-50 active:scale-95'
                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 active:scale-95 shadow-sm'
                    }`}
                  >
                    {emp.isActive ? 'Inhabilitar' : 'Reactivar'}
                  </button>
                </td>

              </tr>
            ))}

            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-zinc-400 text-xs font-normal">
                  No hay empleados registrados para este negocio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}