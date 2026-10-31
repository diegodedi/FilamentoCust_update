import React, { useState } from 'react';
import { X, Store } from 'lucide-react';

interface SellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, link?: string) => void;
}

export const SellerModal: React.FC<SellerModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), link.trim() || undefined);
    setName('');
    setLink('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#14171E] border border-[#2B303E] rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1A1D25] cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 bg-[#FFB800] rounded-xl text-[#0F1115]">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Registrar Novo Vendedor</h3>
            <p className="text-[11px] text-slate-400">Cadastre a loja ou fornecedor dos seus filamentos</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Nome da Loja / Vendedor
            </label>
            <input 
              type="text" 
              required
              placeholder="Ex: 3D Lab, Mercado Livre, Voolt3D"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Link da Loja (Opcional)
            </label>
            <input 
              type="url" 
              placeholder="https://www.loja3d.com.br"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800] transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#222733]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-[#2B303E] text-slate-400 hover:text-white rounded-xl text-xs font-semibold hover:bg-[#1A1D25] cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-[#FFB800] hover:bg-[#e6a600] text-[#0F1115] font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all"
            >
              Salvar Vendedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
