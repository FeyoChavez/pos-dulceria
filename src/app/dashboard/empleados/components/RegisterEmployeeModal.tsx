'use client';

import React, { useState } from 'react';
import { User, Mail, Eye, EyeOff } from 'lucide-react';

interface RegisterEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

export default function RegisterEmployeeModal({ isOpen, onClose, onSuccess }: RegisterEmployeeModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'CASHIER'>('CASHIER');
  
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      // Parseo seguro de JSON para evitar crashes si el backend devuelve un HTML de error 500
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setName(''); setEmail(''); setPassword(''); setRole('CASHIER');
        onSuccess(); // Dispara el fetchEmployees() del padre
        onClose();
      } else {
        setFormError(data.error || 'Ocurrió un error al registrar al empleado.');
      }
    } catch (error) {
      setFormError('Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <h3 className="font-bold text-base text-zinc-900">Alta de Personal</h3>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-xs font-bold px-2 py-1 rounded-md hover:bg-zinc-100 transition-all"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold leading-relaxed">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                required
                placeholder="ej. Mateo Chávez Hidalgo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                placeholder="mateo@dulceria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Contraseña de Ingreso</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-800 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Nivel de Permisos</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-800 font-medium"
            >
              <option value="CASHIER">Cajero (Bloqueo de Dashboard operativo)</option>
              <option value="ADMIN">Administrador (Acceso total)</option>
            </select>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-xs hover:bg-zinc-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 px-4 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all shadow-md shadow-zinc-900/10 disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Confirmar Registro'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}