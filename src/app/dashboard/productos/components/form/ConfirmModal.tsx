import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Archivar',
  cancelText = 'Cancelar',
  onConfirm,
  onClose
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-150">
        
        <div className="p-6 text-center space-y-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-red-50 border border-red-100 text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-zinc-900">{title}</h3>
            <p className="text-xs font-semibold text-zinc-500 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-md transition-all active:scale-95"
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}