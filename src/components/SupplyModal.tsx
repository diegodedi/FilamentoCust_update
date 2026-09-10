import React, { useState, useEffect } from 'react';
import { Package, Trash2 } from 'lucide-react';
import { Supply } from '../types';

interface SupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Supply>) => void;
  initialSupply: Supply | null;
}

export const SupplyModal: React.FC<SupplyModalProps> = ({ isOpen, onClose, onSave, initialSupply }) => {
  const [type, setType] = useState<'Caixa de papelão' | 'Plástico bolha' | 'Fita adesiva' | 'Outros'>('Caixa de papelão');
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [link, setLink] = useState('');
  const [packageQuantity, setPackageQuantity] = useState(1);
  const [packagePrice, setPackagePrice] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialSupply) {
      setType(initialSupply.type as any);
      setName(initialSupply.name);
      setProvider(initialSupply.provider || '');
      setLink(initialSupply.link || '');
      setPackageQuantity(initialSupply.packageQuantity);
      setPackagePrice(initialSupply.packagePrice);
      setPurchaseDate(initialSupply.purchaseDate || new Date().toISOString().split('T')[0]);
      setNotes(initialSupply.notes || '');
    } else {
      setType('Caixa de papelão');
      setName('');
      setProvider('');
      setLink('');
      setPackageQuantity(1);
      setPackagePrice(0);
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [initialSupply, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const unitPrice = packageQuantity > 0 ? packagePrice / packageQuantity : 0;

    const getPresetImage = (type: string) => {
      switch (type) {
        case 'Caixa de papelão': return "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80";
        case 'Plástico bolha': return "https://images.unsplash.com/photo-1620619767323-8631cc95ce16?w=400&q=80";
        case 'Fita adesiva': return "https://images.unsplash.com/photo-1586942589955-46f9038290f6?w=400&q=80";
        default: return "";
      }
    };

    const image = getPresetImage(type);

    const data = {
      type,
      name,
      provider,
      link,
      packageQuantity,
      packagePrice,
      unitPrice,
      purchaseDate,
      image,
      notes
    };

    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1F24] rounded-2xl w-full max-w-lg border border-[#2B2F36] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-6 flex justify-between items-center border-b border-[#2B2F36] bg-[#121418]">
          <h2 className="text-lg font-headline-md font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-[#0084FF]" />
            {initialSupply ? 'Editar Insumo' : 'Novo Insumo / Embalagem'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <Trash2 className="w-5 h-5 opacity-0 hidden" />
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Tipo de Insumo *</label>
              <select 
                value={type} 
                onChange={(e: any) => setType(e.target.value)}
                className="w-full bg-[#121418] border border-[#2B2F36] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#0084FF] text-sm"
              >
                <option value="Caixa de papelão">Caixa de papelão</option>
                <option value="Plástico bolha">Rolo de Plástico bolha</option>
                <option value="Fita adesiva">Fita adesiva</option>
                <option value="Outros">Outros Insumos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Nome / Descrição do Produto *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#121418] border border-[#2B2F36] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#0084FF] text-sm"
                placeholder="Ex: Caixa Klabin 15x15x15"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Nome do Fornecedor *</label>
              <input 
                type="text" 
                value={provider} 
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-[#121418] border border-[#2B2F36] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#0084FF] text-sm"
                placeholder="Ex: Klabin, Embalagens Brasil..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Site do Fornecedor / Link de Compra</label>
              <input 
                type="url" 
                value={link} 
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-[#121418] border border-[#2B2F36] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#0084FF] text-sm"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Custo do Pacote (R$) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={packagePrice} 
                  onChange={(e) => setPackagePrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#121418] border border-[#2B2F36] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#0084FF] text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  {type === 'Plástico bolha' ? 'Metros no Rolo *' : 'Qtde no Pacote (un/m) *'}
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={packageQuantity} 
                  onChange={(e) => setPackageQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#121418] border border-[#2B2F36] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#0084FF] text-sm font-mono"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-[#0084FF]/10 rounded-lg border border-[#0084FF]/30 flex justify-between items-center">
              <span className="text-xs font-bold text-[#0084FF] uppercase tracking-wider">Custo Unitário Calculado</span>
              <span className="font-mono text-[#0084FF] font-bold text-xl">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(packageQuantity > 0 ? packagePrice / packageQuantity : 0)}
              </span>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Data da Compra</label>
              <input 
                type="date" 
                value={purchaseDate} 
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-[#121418] border border-[#2B2F36] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#0084FF] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Anotações (Opcional)</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#121418] border border-[#2B2F36] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#0084FF] text-sm h-24 resize-none"
                placeholder="Observações sobre a compra..."
              />
            </div>
            
            <div className="pt-4 border-t border-[#2B2F36] flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2.5 bg-[#2B2F36] text-white rounded-lg font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-[#0084FF] text-white rounded-lg font-bold text-xs hover:bg-[#0084FF]/90 transition-colors shadow-lg shadow-[#0084FF]/20"
              >
                {initialSupply ? 'Salvar Alterações' : 'Cadastrar Insumo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
