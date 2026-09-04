import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { InventoryItem } from '../types';
import { Search, Plus, Minus, Edit, AlertCircle, Sparkles, QrCode } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { inventory, registerMovement, updateInventoryItem } = useDb();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [movementQty, setMovementQty] = useState(1);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

  // Status lists
  const statuses = ['Todos', 'NORMAL', 'BAIXO', 'CRITICO'];

  const handleOpenMovement = (item: InventoryItem, type: 'IN' | 'OUT') => {
    setSelectedItemForMovement(item);
    setMovementType(type);
    setMovementQty(1);
    setIsMovementModalOpen(true);
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForMovement) return;

    const success = registerMovement(selectedItemForMovement.id, movementType, movementQty);
    if (!success) {
      alert(`Quantidade em estoque insuficiente para realizar a saída de ${movementQty} unidades.`);
      return;
    }

    setIsMovementModalOpen(false);
  };

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    // Simulate scanning - match a random item or first item
    const itemToScan = inventory[Math.floor(Math.random() * inventory.length)];
    if (itemToScan) {
      registerMovement(itemToScan.id, 'IN', 1);
      setScanSuccess(`Código "${barcodeInput}" lido! Entrada registrada: +1 ${itemToScan.name}`);
      setBarcodeInput('');
      setTimeout(() => setScanSuccess(null), 4000);
    }
  };

  // Filter items
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'Todos' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-white mb-1">Controle de Estoque</h2>
          <p className="text-slate-400 font-body-md">Monitore o saldo físico de peças acabadas e insumos operacionais.</p>
        </div>
      </div>

      {/* Grid de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1C1F24] p-5 rounded-xl border border-[#2B2F36] shadow-sm">
          <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-2">Total em Estoque</p>
          <div className="flex items-end justify-between">
            <span className="text-[28px] font-bold text-white">
              {inventory.reduce((acc, c) => acc + c.stock, 0)} un
            </span>
            <span className="text-slate-400 font-label-md text-xs">peças prontas</span>
          </div>
        </div>

        <div className="bg-[#1C1F24] p-5 rounded-xl border border-[#2B2F36] shadow-sm">
          <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-2">Custo do Patrimônio</p>
          <div className="flex items-end justify-between">
            <span className="text-[28px] font-bold text-white">
              R$ {inventory.reduce((acc, c) => acc + (c.stock * c.costPrice), 0).toFixed(0)}
            </span>
            <span className="text-[#0084FF] font-label-md text-xs font-bold">Investido</span>
          </div>
        </div>

        <div className="bg-[#1C1F24] p-5 rounded-xl border border-[#2B2F36] shadow-sm border-l-4 border-l-red-500">
          <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-2">Críticos (Zerar)</p>
          <div className="flex items-end justify-between">
            <span className="text-[28px] font-bold text-red-600">
              {inventory.filter(i => i.status === 'CRITICO').length} Itens
            </span>
            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] rounded font-bold">Urgente</span>
          </div>
        </div>

        <div className="bg-[#1C1F24] p-5 rounded-xl border border-[#2B2F36] shadow-sm border-l-4 border-l-amber-500">
          <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-2">Sob Alerta Baixo</p>
          <div className="flex items-end justify-between">
            <span className="text-[28px] font-bold text-amber-600">
              {inventory.filter(i => i.status === 'BAIXO').length} Itens
            </span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded font-bold">Reposição</span>
          </div>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Filtrar por nome do produto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#2B2F36] rounded-lg text-slate-200 bg-[#121418] outline-none focus:ring-2 focus:ring-[#0084FF]/50"
          />
        </div>
        
        <div className="flex gap-2">
          {statuses.map((stat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedStatus(stat)}
              className={`px-4 py-2 rounded-lg text-xs font-medium border cursor-pointer ${
                selectedStatus === stat 
                  ? 'bg-slate-900 border-slate-900 text-white font-bold' 
                  : 'bg-[#1C1F24] border-[#2B2F36] text-slate-400 hover:bg-[#121418]'
              }`}
            >
              {stat === 'Todos' ? 'Status: Todos' : stat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela do Estoque */}
      <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#121418] text-slate-400 font-label-md text-[11px] uppercase tracking-wider border-b border-[#2B2F36]">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nome do Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Estoque</th>
                <th className="px-6 py-4">Qtd Mínima</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Custo Unit</th>
                <th className="px-6 py-4 text-right">Valor em Estoque</th>
                <th className="px-6 py-4 text-center">Registro de Movimentações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#121418] transition-colors text-slate-200 font-body-md">
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400 font-bold">{item.id}</td>
                    <td className="px-6 py-4 font-bold text-white">{item.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{item.category}</td>
                    <td className="px-6 py-4 font-mono text-sm font-bold">{item.stock} un</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{item.minStock} un</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                        item.status === 'NORMAL' 
                          ? 'bg-[#22C55E]/15 text-[#22C55E]' 
                          : item.status === 'BAIXO' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs">R$ {item.costPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-mono text-xs font-bold text-white">
                      R$ {(item.stock * item.costPrice).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenMovement(item, 'IN')}
                          className="flex items-center gap-1 px-2.5 py-1 bg-[#0084FF]/10 text-[#0084FF] hover:bg-[#0084FF]/20 rounded text-xs font-bold cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Entrada
                        </button>
                        <button 
                          onClick={() => handleOpenMovement(item, 'OUT')}
                          className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-bold cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" /> Saída
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhum item do inventário localizado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asymmetric Inventory Alerts and Barcode Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Depletion Forecast Box */}
        <div className="lg:col-span-2 bg-[#1C1F24] border border-[#2B2F36] p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-sm text-white">Previsão Dinâmica de Ruptura</h3>
            <AlertCircle className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="space-y-3">
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 text-red-600 flex flex-col items-center justify-center rounded font-mono font-bold leading-tight">
                  <span className="text-sm">02</span>
                  <span className="text-[8px] uppercase">Dias</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-800">ErgoTrack Shell (Critico)</p>
                  <p className="text-[11px] text-slate-400">Consumo acelerado estimado com base em pedidos industriais pendentes.</p>
                </div>
              </div>
              <button onClick={() => alert('Ordem de produção de reabastecimento gerada!')} className="text-xs font-bold text-[#0084FF] hover:underline underline-offset-4">
                Iniciar Produção
              </button>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 flex flex-col items-center justify-center rounded font-mono font-bold leading-tight">
                  <span className="text-sm">05</span>
                  <span className="text-[8px] uppercase">Dias</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-800">Fan Shroud Pro (Estoque Baixo)</p>
                  <p className="text-[11px] text-slate-400">Estoque atual (3 un) atingirá nível de emergência em 5 dias.</p>
                </div>
              </div>
              <button onClick={() => alert('Ordem de produção de reabastecimento gerada!')} className="text-xs font-bold text-[#0084FF] hover:underline underline-offset-4">
                Programar Lote
              </button>
            </div>
          </div>
        </div>

        {/* Quick Barcode Simulator */}
        <div className="bg-[#121418] text-white p-6 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Sparkles className="w-4.5 h-4.5 text-[#0084FF]" />
              <span className="font-label-md text-[10px] uppercase tracking-wider">Entrada Assistida</span>
            </div>
            <h3 className="font-headline-sm mb-2 text-white">Simulador de Coletor</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Escaneie ou digite um código SKU para simular o recebimento físico e acrescentar +1 unidade ao estoque automaticamente.
            </p>

            <form onSubmit={handleBarcodeScan} className="space-y-3">
              <div className="relative">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Aguardando SKU / Código..." 
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full bg-slate-800/55 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-[#0084FF] placeholder:text-slate-400 text-white"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#0084FF] hover:bg-[#0084FF]/90 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                Simular Leitor de Código
              </button>
            </form>

            {scanSuccess && (
              <div className="mt-3 p-3 bg-slate-800/80 border border-[#22C55E]/30 rounded-lg text-[11px] text-[#22C55E] font-medium leading-relaxed flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full"></span>
                <span>{scanSuccess}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Movimentação de Estoque */}
      {isMovementModalOpen && selectedItemForMovement && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1F24] rounded-xl border border-[#2B2F36] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-[#2B2F36] bg-[#121418] flex justify-between items-center">
              <h3 className="font-headline-sm text-white">
                Registrar {movementType === 'IN' ? 'Entrada' : 'Saída'}
              </h3>
              <button onClick={() => setIsMovementModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-300 rounded-full">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleMovementSubmit} className="p-6 space-y-4">
              <div className="text-center pb-2">
                <p className="text-xs text-slate-400 uppercase font-label-md">Produto Selecionado</p>
                <p className="font-bold text-white text-base">{selectedItemForMovement.name}</p>
                <p className="text-xs text-slate-400 font-mono">Disponível: {selectedItemForMovement.stock} un</p>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase">Quantidade de Itens</label>
                <input 
                  type="number" 
                  min={1}
                  required
                  value={movementQty}
                  onChange={(e) => setMovementQty(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm text-center font-mono font-bold outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 border border-[#2B2F36] text-slate-400 rounded-lg text-xs font-label-md hover:bg-[#121418] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`px-4 py-2 text-white rounded-lg text-xs font-label-md cursor-pointer ${
                    movementType === 'IN' ? 'bg-[#0084FF] hover:bg-[#0084FF]/90' : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  Confirmar {movementType === 'IN' ? 'Entrada' : 'Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
