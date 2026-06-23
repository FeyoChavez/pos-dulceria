'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import EmployeeTable, { Employee } from './components/EmployeeTable';
import RegisterEmployeeModal from './components/RegisterEmployeeModal';

export default function EmpleadosPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filterTab, setFilterTab] = useState<'ACTIVE' | 'INACTIVE' | 'ALL'>('ACTIVE');

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error cargando empleados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean, empName: string) => {
    const nuevoEstado = !currentStatus;
    const accion = nuevoEstado ? 'REACTIVAR' : 'REVOCAR EL ACCESO de';
    
    if (!confirm(`¿Estás seguro de que deseas ${accion} "${empName}"?`)) return;

    try {
      const res = await fetch('/api/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: nuevoEstado }),
      });

      if (res.ok) {
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, isActive: nuevoEstado } : emp));
      } else {
        alert('Error al modificar el acceso del empleado.');
      }
    } catch (error) {
      alert('Error de red al intentar actualizar el estado.');
    }
  };

  const activosCount = employees.filter(e => e.isActive).length;
  const inactivosCount = employees.filter(e => !e.isActive).length;

  // Aplicamos el filtro a la lista antes de mandársela a la tabla
  const empleadosFiltrados = employees.filter(emp => {
    if (filterTab === 'ACTIVE') return emp.isActive === true;
    if (filterTab === 'INACTIVE') return emp.isActive === false;
    return true; 
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-xs font-medium">Sincronizando recursos humanos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900">
      <div className="max-w-screen-xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">Plantilla de Personal</h1>
            <p className="text-sm text-zinc-500 mt-1">Gestiona los accesos de tus cajeros y administradores al punto de venta.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-zinc-800 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Nuevo Empleado</span>
          </button>
        </div>

        <div className="flex items-center gap-1 p-1 bg-zinc-200/60 rounded-xl w-fit text-xs font-bold text-zinc-600">
          <button
            onClick={() => setFilterTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filterTab === 'ACTIVE' ? 'bg-white text-zinc-900 shadow-sm' : 'hover:text-zinc-900'
            }`}
          >
            <span>Activos</span>
            <span className="px-1.5 py-0.2 bg-zinc-100 rounded-full text-[10px] text-zinc-500 font-mono">
              {activosCount}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('INACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filterTab === 'INACTIVE' ? 'bg-white text-zinc-900 shadow-sm' : 'hover:text-zinc-900'
            }`}
          >
            <span>Inhabilitados</span>
            <span className="px-1.5 py-0.2 bg-zinc-100 rounded-full text-[10px] text-zinc-500 font-mono">
              {inactivosCount}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filterTab === 'ALL' ? 'bg-white text-zinc-900 shadow-sm' : 'hover:text-zinc-900'
            }`}
          >
            <span>Todos</span>
            <span className="px-1.5 py-0.2 bg-zinc-100 rounded-full text-[10px] text-zinc-500 font-mono">
              {employees.length}
            </span>
          </button>
        </div>

        <EmployeeTable 
          employees={empleadosFiltrados} 
          onToggleStatus={handleToggleStatus} 
        />

        <RegisterEmployeeModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchEmployees} 
        />

      </div>
    </div>
  );
}