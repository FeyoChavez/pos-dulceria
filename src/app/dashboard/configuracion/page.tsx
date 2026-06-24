'use client';

import React, { useState, useEffect } from 'react';
import { Save, Store, Receipt, MapPin, Phone, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

interface TenantProfile {
  name: string;
  legalName: string;
  address: string;
  phone: string;
  ticketMessage: string;
}

export default function ConfiguracionPage() {
  const [form, setForm] = useState<TenantProfile>({
    name: '', legalName: '', address: '', phone: '', ticketMessage: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/tenant')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setForm({
            name: data.name || '',
            legalName: data.legalName || '',
            address: data.address || '',
            phone: data.phone || '',
            ticketMessage: data.ticketMessage || ''
          });
        }
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        toast.success("Perfil de negocio actualizado");
      } else {
        toast.error("Error al guardar la configuración");
      }
    } catch {
      toast.error("Fallo de red");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return ( <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" /></div> );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900">
      <div className="max-w-screen-xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-2xl font-black tracking-tight">Perfil y Formato de Ticket</h1>
          <p className="text-sm text-zinc-500 mt-1">Configura los datos impresos en los comprobantes de tus clientes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMNA IZQ: FORMULARIO */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Información del Ticket</h3>
            
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">Nombre Comercial (Cabecera principal) *</label>
              <div className="relative">
                <Store className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text" required maxLength={32}
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Ej: Dulcería Don Pepe"
                  className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">RFC / Identificador Fiscal (Opcional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text" maxLength={20}
                  value={form.legalName} onChange={e => setForm({...form, legalName: e.target.value})}
                  placeholder="Ej: XEXX010101000"
                  className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs uppercase focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">Dirección del Local</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text" maxLength={64}
                  value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  placeholder="Ej: Calle Morelos #14, Col. Centro"
                  className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">Teléfono de pedidos</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text" maxLength={15}
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="Ej: 782 123 4567"
                  className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">Mensaje de Despedida (Pie de página)</label>
              <textarea
                rows={2} maxLength={90}
                value={form.ticketMessage} onChange={e => setForm({...form, ticketMessage: e.target.value})}
                placeholder="¡Gracias por su preferencia! No hay cambios en empaques abiertos."
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none resize-none"
              />
              <span className="text-[10px] text-zinc-400 block text-right">{form.ticketMessage.length}/90</span>
            </div>

            <button
              type="submit" disabled={isSaving}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando en la nube...' : 'Guardar Formato de Ticket'}</span>
            </button>
          </form>

          {/* COLUMNA DER: SIMULADOR TÉRMICO EN VIVO */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center pt-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" /> Vista Previa Térmica (80mm)
            </span>

            {/* MAQUETA DE PAPEL DE ROLLO */}
            <div className="w-72 bg-white border-y-2 border-dashed border-zinc-400 shadow-2xl p-6 font-mono text-zinc-900 select-none space-y-3 relative">
              
              {/* CABECERA SIMULADA */}
              <div className="text-center space-y-0.5 border-b border-zinc-200 pb-3">
                <h2 className="font-black text-sm uppercase tracking-tight leading-tight">
                  {form.name || 'NOMBRE DEL NEGOCIO'}
                </h2>
                {form.legalName && <p className="text-[10px] text-zinc-500 font-bold uppercase">RFC: {form.legalName}</p>}
                {form.address && <p className="text-[10px] text-zinc-600 leading-tight">{form.address}</p>}
                {form.phone && <p className="text-[10px] text-zinc-600">TEL: {form.phone}</p>}
              </div>

              {/* CUERPO DE COMPRA FICTICIO PARA DAR CONTEXTO */}
              <div className="text-[10px] space-y-1 text-zinc-600 py-1">
                <div className="flex justify-between font-bold text-zinc-900 border-b border-dashed border-zinc-200 pb-1">
                  <span>CANT / DESCRIPCION</span>
                  <span>IMPORTE</span>
                </div>
                <div className="flex justify-between"><span>1x GOMITAS PANDA 100G</span><span>$18.50</span></div>
                <div className="flex justify-between"><span>2x PELON PELO RICO</span><span>$24.00</span></div>
                <div className="flex justify-between font-black text-xs text-zinc-900 pt-2 border-t border-zinc-200">
                  <span>TOTAL:</span><span>$42.50</span>
                </div>
              </div>

              {/* PIE DE PÁGINA SIMULADO */}
              <div className="text-center border-t border-zinc-200 pt-3 text-[10px] text-zinc-500 space-y-1">
                <p className="font-medium italic leading-tight">
                  "{form.ticketMessage || '¡Gracias por su compra!'}"
                </p>
                <p className="text-[8px] text-zinc-400 pt-1">FECHA: 23/06/2026 04:20 PM</p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}