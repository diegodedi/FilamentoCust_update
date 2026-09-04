import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { Supply } from '../types';
import { Search, Plus, Trash2, Edit, ExternalLink, Package, Building2 } from 'lucide-react';

export const Supplies: React.FC = () => {
  const { supplies, addSupply, updateSupply, deleteSupply } = useDb();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [type, setType] = useState<'Caixa de papelão' | 'Plástico bolha' | 'Fita adesiva' | 'Outros'>('Caixa de papelão');
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [link, setLink] = useState('');
  const [packageQuantity, setPackageQuantity] = useState(1);
  const [packagePrice, setPackagePrice] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleOpenAddModal = () => {
    setEditingId(null);
    setType('Caixa de papelão');
    setName('');
    setProvider('');
    setLink('');
    setPackageQuantity(1);
    setPackagePrice(0);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleEdit = (supply: Supply) => {
    setEditingId(supply.id);
    setType(supply.type as any);
    setName(supply.name);
    setProvider(supply.provider || '');
    setLink(supply.link || '');
    setPackageQuantity(supply.packageQuantity);
    setPackagePrice(supply.packagePrice);
    setPurchaseDate(supply.purchaseDate || '');
    setNotes(supply.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este insumo?')) {
      deleteSupply(id);
    }
  };

  const getPresetImage = (type: string) => {
    switch (type) {
      case 'Caixa de papelão': return "file:///C:/Users/diego/.gemini/antigravity-ide/brain/a00f9dfd-34a3-4e43-932e-56ff9cba565a/cardboard_box_1788481782406.jpg";
      case 'Plástico bolha': return "file:///C:/Users/diego/.gemini/antigravity-ide/brain/a00f9dfd-34a3-4e43-932e-56ff9cba565a/bubble_wrap_1788481800877.jpg";
      case 'Fita adesiva': return "file:///C:/Users/diego/.gemini/antigravity-ide/brain/a00f9dfd-34a3-4e43-932e-56ff9cba565a/adhesive_tape_1788481810511.jpg";
      default: return "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const unitPrice = packageQuantity > 0 ? packagePrice / packageQuantity : 0;
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

    if (editingId) {
      updateSupply(editingId, { ...data, id: editingId });
    } else {
      addSupply(data);
    }

    setIsModalOpen(false);
  };

  const filteredSupplies = supplies.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.provider && s.provider.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group supplies by type
  const groupedSupplies = filteredSupplies.reduce((acc, supply) => {
    if (!acc[supply.type]) acc[supply.type] = [];
    acc[supply.type].push(supply);
    return acc;
  }, {} as Record<string, Supply[]>);

  const supplyTypes = ['Caixa de papelão', 'Plástico bolha', 'Fita adesiva', 'Outros'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-white mb-1">Insumos e Embalagens</h2>
          <p className="text-slate-400 font-body-md">Cadastre e controle embalagens, fita adesiva, plástico bolha e custos de envio.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-[#0084FF] text-white rounded-lg font-label-md text-xs hover:bg-[#0084FF]/90 flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Cadastrar Insumo
        </button>
      </div>

      {/* Busca */}
      <div className="bg-[#1C1F24] border border-[#2B2F36] p-4 rounded-xl shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, tipo ou fornecedor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#2B2F36] rounded-lg text-slate-200 bg-[#121418] outline-none focus:ring-2 focus:ring-[#0084FF]/50 text-xs"
          />
        </div>
      </div>

      {/* Exibição Agrupada */}
      {filteredSupplies.length === 0 ? (
        <div className="col-span-full py-16 text-center bg-[#1C1F24] border border-[#2B2F36] rounded-xl border-dashed">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-body-md">Nenhum insumo encontrado</p>
          <p className="text-slate-500 text-xs mt-1">Clique em "Cadastrar Insumo" para adicionar</p>
        </div>
      ) : (
        <div className="space-y-8">
          {supplyTypes.map(type => {
            const items = groupedSupplies[type];
            if (!items || items.length === 0) return null;

            return (
              <div key={type} className="space-y-4">
                <h3 className="text-lg font-headline-sm text-slate-200 border-b border-[#2B2F36] pb-2 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#0084FF]" /> {type}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {items.map(supply => (
                    <div key={supply.id} className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between">
                      <div className="relative h-48 bg-[#121418] w-full flex items-center justify-center overflow-hidden border-b border-[#2B2F36]">
                        {supply.image ? (
                          <img src={supply.image} alt={supply.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" referrerPolicy="no-referrer" />
                        ) : (
                          <Package className="w-16 h-16 text-[#2B2F36]" />
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-headline-sm text-sm text-white mb-1 leading-tight">{supply.name}</h3>
                        
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{supply.provider || 'Fornecedor não informado'}</span>
                        </div>
                        
                        {supply.link && (
                          <a href={supply.link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#0084FF] hover:underline flex items-center gap-1 mb-4">
                            Acessar site do fornecedor <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <div className="mt-auto space-y-3">
                          <div className="grid grid-cols-2 gap-3 p-3 bg-[#121418] rounded-lg border border-[#2B2F36]">
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Custo do Pacote</span>
                              <span className="font-mono text-slate-300 text-xs">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(supply.packagePrice)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Quantidade</span>
                              <span className="font-mono text-slate-300 text-xs">{supply.packageQuantity} un/m</span>
                            </div>
                          </div>

                          <div className="p-3 bg-[#0084FF]/10 rounded-lg border border-[#0084FF]/20 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-[#0084FF] uppercase tracking-wider">Custo Unitário</span>
                            <span className="font-mono text-[#0084FF] font-bold text-lg">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(supply.unitPrice)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex border-t border-[#2B2F36] divide-x divide-[#2B2F36]">
                        <button onClick={() => handleEdit(supply)} className="flex-1 py-3 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-[#2B2F36]/30 flex items-center justify-center gap-1.5 transition-colors">
                          <Edit className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button onClick={() => handleDelete(supply.id)} className="flex-1 py-3 text-[11px] font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 flex items-center justify-center gap-1.5 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1C1F24] rounded-2xl w-full max-w-lg border border-[#2B2F36] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-6 flex justify-between items-center border-b border-[#2B2F36] bg-[#121418]">
              <h2 className="text-lg font-headline-md font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-[#0084FF]" />
                {editingId ? 'Editar Insumo' : 'Novo Insumo / Embalagem'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
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
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-[#2B2F36] text-white rounded-lg font-bold text-xs hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-[#0084FF] text-white rounded-lg font-bold text-xs hover:bg-[#0084FF]/90 transition-colors shadow-lg shadow-[#0084FF]/20"
                  >
                    {editingId ? 'Salvar Alterações' : 'Cadastrar Insumo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
