import React from 'react';
import Sidebar from '@/components/ui/SideBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* El Sidebar estará fijo a la izquierda */}
      <Sidebar />

      {/* El contenido principal (POS, Inventario, etc.) se renderiza aquí a la derecha */}
      <main className="flex-1 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}