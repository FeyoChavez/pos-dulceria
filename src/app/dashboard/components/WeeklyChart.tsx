import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WeeklyChartProps {
  chartData: Array<{ dia: string; ventas: number; ganancia: number }>;
}

export default function WeeklyChart({ chartData }: WeeklyChartProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 space-y-4">
      <div>
        <h3 className="text-base font-bold text-zinc-900">Flujo Financiero Semanal</h3>
        <p className="text-xs text-zinc-400 mt-0.5">Comparativa analítica entre dinero facturado y utilidad real por día.</p>
      </div>
      
      <div className="w-full h-[320px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis dataKey="dia" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '13px' }}
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`]}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Bar name="Venta Bruta" dataKey="ventas" fill="#18181b" radius={[4, 4, 0, 0]} maxBarSize={45} />
            <Bar name="Ganancia Neta" dataKey="ganancia" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}