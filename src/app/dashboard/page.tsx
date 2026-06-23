'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardData {
  kpis: {
    revenue: number;
    netProfit: number;
    salesCount: number;
    lowStockCount: number;
  };
  chartData: Array<{ dia: string; ventas: number; ganancia: number }>;
  topProducts: Array<{ name: string; qty: number }>;
}

export default function DashboardPrincipalPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
        <p className="text-zinc-500 text-sm font-medium animate-pulse">Compilando analíticas generales...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <div className="max-w-screen-xl mx-auto space-y-8">
        
        {/* Cabecera Principal */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Resumen de Operaciones</h1>
          <p className="text-sm text-zinc-500 mt-1">Monitorea los ingresos, márgenes de utilidad y el rendimiento logístico semanal.</p>
        </div>

        {/* Bloque de KPIs Corporativos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ingresos Brutos (7d)</span>
            <span className="text-3xl font-black text-zinc-900 mt-2">${data.kpis.revenue.toFixed(2)}</span>
            <span className="text-[10px] text-zinc-400 mt-1">Suma total facturada</span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Utilidad Neta (Ganancia)</span>
            <span className="text-3xl font-black text-indigo-600 mt-2">${data.kpis.netProfit.toFixed(2)}</span>
            <span className="text-[10px] text-indigo-400 mt-1">Descontando costo de catálogo</span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tickets Emitidos</span>
            <span className="text-3xl font-black text-zinc-900 mt-2">{data.kpis.salesCount} tkts</span>
            <span className="text-[10px] text-zinc-400 mt-1">Transacciones completadas</span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Alertas de Almacén</span>
            <span className={`text-3xl font-black mt-2 ${data.kpis.lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {data.kpis.lowStockCount}
            </span>
            <span className="text-[10px] text-zinc-400 mt-1">Productos con stock crítico (≤ 5)</span>
          </div>

        </div>

        {/* Sección Central de Gráfica y Productos Populares */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Gráfica Recharts Semanal */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Flujo Financiero Semanal</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Comparativa analítica entre dinero facturado y utilidad real por día.</p>
            </div>
            
            <div className="w-full h-[320px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="dia" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '13px' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`]}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar name="Venta Bruta" dataKey="ventas" fill="#18181b" radius={[4, 4, 0, 0]} maxBarSize={35} />
                  <Bar name="Ganancia Neta" dataKey="ganancia" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking Top 5 Productos más vendidos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Dulces más Populares</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Top 5 de artículos con mayor rotación en vitrina.</p>
              </div>

              <div className="space-y-3">
                {data.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-zinc-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                        {index + 1}
                      </span>
                      <p className="text-xs font-semibold text-zinc-800 truncate max-w-[160px]">{product.name}</p>
                    </div>
                    <span className="text-xs font-black text-zinc-500 font-mono">
                      {product.qty} uds
                    </span>
                  </div>
                ))}
                
                {data.topProducts.length === 0 && (
                  <div className="text-center py-12 text-zinc-400 text-xs">
                    No hay datos de ventas registrados en este periodo.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
              <span>Métricas automatizadas</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}