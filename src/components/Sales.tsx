import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { Sale } from '../types';
import { Search, Plus, Calendar, User, ShoppingBag, BadgeAlert, Sparkles, X, Edit, Trash2 } from 'lucide-react';

export const Sales: React.FC = () => {
  const { sales, products, customers, addSale, updateSale, deleteSale } = useDb();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedClientId, setSelectedClientId] = useState(customers[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | null>(null); // override sellPrice if desired
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];
  const currentCustomer = customers.find(c => c.id === selectedClientId) || customers[0];

  const defaultPrice = currentProduct ? currentProduct.sellPrice : 0;
  const activeUnitPrice = customPrice !== null ? customPrice : defaultPrice;
  const calculatedTotal = activeUnitPrice * quantity;
  const calculatedCost = currentProduct ? currentProduct.costPrice * quantity : 0;
  const calculatedProfit = calculatedTotal - calculatedCost;

  const handleOpenModal = () => {
    setEditingId(null);
    setSelectedProductId(products[0]?.id || '');
    setSelectedClientId(customers[0]?.id || '');
    setQuantity(1);
    setCustomPrice(null);
    setSaleDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setSelectedProductId(s.productId);
    setSelectedClientId(s.clientId);
    setQuantity(s.quantity);
    setCustomPrice(s.totalValue / s.quantity);
    setSaleDate(s.date);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta venda?\n\nAviso: O estoque e o fluxo de caixa não serão revertidos automaticamente. Você precisará ajustar manualmente.")) {
      deleteSale(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId || !selectedClientId) {
      alert('Selecione um produto e um cliente válidos.');
      return;
    }

    const saleData = {
      date: saleDate,
      clientId: selectedClientId,
      clientName: currentCustomer.name,
      productId: selectedProductId,
      productName: currentProduct.name,
      quantity,
      totalValue: parseFloat(calculatedTotal.toFixed(2)),
      totalCost: parseFloat(calculatedCost.toFixed(2)),
      profit: parseFloat(calculatedProfit.toFixed(2))
    };

    try {
      if (editingId) {
        updateSale(editingId, { ...saleData, id: editingId });
        setIsModalOpen(false);
        setEditingId(null);
        alert('Venda atualizada com sucesso! Nota: As alterações não refletem automaticamente no estoque/financeiro.');
      } else {
        addSale(saleData);
        setIsModalOpen(false);
        alert('Venda registrada com sucesso! O estoque foi deduzido e o financeiro atualizado.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };
  // Filter sales
  const filteredSales = sales.filter(s => 
    s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSalesRevenue = sales.reduce((acc, curr) => acc + curr.totalValue, 0);
  const totalSalesProfit = sales.reduce((acc, curr) => acc + curr.profit, 0);
  const averageTicket = sales.length > 0 ? totalSalesRevenue / sales.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-white mb-1">Registro de Pedidos e Vendas</h2>
          <p className="text-slate-400 font-body-md">Gerencie os pedidos recebidos, ordens de faturamento e lucros por transação.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="bg-[#0084FF] text-white px-5 py-2.5 rounded-lg font-label-md hover:bg-[#0084FF]/90 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Registrar Venda
        </button>
      </div>

      {/* Grid de Metricas da Vendas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1C1F24] p-5 rounded-xl border border-[#2B2F36] shadow-sm">
          <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-2">Pedidos Faturados</p>
          <div className="flex items-end justify-between">
            <span className="text-[28px] font-bold text-white">
              {sales.length} Pedidos
            </span>
            <span className="text-slate-400 font-label-md text-xs">acumulado total</span>
          </div>
        </div>

        <div className="bg-[#1C1F24] p-5 rounded-xl border border-[#2B2F36] shadow-sm">
          <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-2">Ticket Médio</p>
          <div className="flex items-end justify-between">
            <span className="text-[28px] font-bold text-[#0084FF]">
              R$ {averageTicket.toFixed(2)}
            </span>
            <span className="text-slate-400 font-label-md text-xs">por transação</span>
          </div>
        </div>

        <div className="bg-[#1C1F24] p-5 rounded-xl border border-[#2B2F36] shadow-sm">
          <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-2">Lucro Total Acumulado</p>
          <div className="flex items-end justify-between">
            <span className="text-[28px] font-bold text-white">
              R$ {totalSalesProfit.toFixed(2)}
            </span>
            <span className="text-[#22C55E] font-label-md text-xs font-bold">~{totalSalesRevenue ? Math.round((totalSalesProfit / totalSalesRevenue) * 100) : 0}% margem</span>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-4 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Pesquisar por ID, produto ou nome do cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#2B2F36] rounded-lg text-slate-200 bg-[#121418] outline-none focus:ring-2 focus:ring-[#0084FF]/50 text-xs"
          />
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#121418] text-slate-400 font-label-md text-[11px] uppercase tracking-wider border-b border-[#2B2F36]">
                <th className="px-6 py-4">ID Pedido</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4 text-center">Quantidade</th>
                <th className="px-6 py-4 text-right">Valor Total</th>
                <th className="px-6 py-4 text-right">Custo Total</th>
                <th className="px-6 py-4 text-right">Lucro Real</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length > 0 ? (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-[#121418] transition-colors text-slate-200 font-body-md">
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400 font-bold">{s.id}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      {s.date.split('-').reverse().join('/')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#2B2F36] rounded text-slate-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-white">{s.clientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#2B2F36] rounded text-slate-400">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">{s.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-slate-200">{s.quantity} un</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-white">R$ {s.totalValue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">R$ {s.totalCost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-[#22C55E]">R$ {s.profit.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(s)}
                          className="text-slate-400 hover:text-[#0084FF] p-1 rounded transition-colors"
                          title="Editar Venda"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                          title="Excluir Venda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhum pedido faturado correspondente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal registrar venda */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1F24] rounded-xl border border-[#2B2F36] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-[#2B2F36] bg-[#121418] flex justify-between items-center">
              <h3 className="font-headline-sm text-white">Registrar Faturamento / Venda</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-300 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase">Cliente do Pedido</label>
                <select 
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#2B2F36] rounded-lg text-sm bg-[#1C1F24] outline-none"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company || 'Pessoa Física'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Produto Solicitado</label>
                  <select 
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#2B2F36] rounded-lg text-sm bg-[#1C1F24] outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Quantidade (un)</label>
                  <input 
                    type="number" 
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Preço Unitário (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder={`Padrão: R$ ${defaultPrice}`}
                    value={customPrice !== null ? customPrice : ''}
                    onChange={(e) => setCustomPrice(e.target.value !== '' ? parseFloat(e.target.value) : null)}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none font-mono"
                  />
                  <p className="text-[9px] text-slate-400">Deixe em branco para usar o preço padrão do catálogo.</p>
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Data do Faturamento</label>
                  <input 
                    type="date" 
                    required
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Financial projections within checkout */}
              <div className="p-4 bg-[#121418] rounded-lg border border-dashed border-[#2B2F36] text-xs space-y-2">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Valor Bruto do Pedido:</span>
                  <span className="font-mono font-bold text-white">R$ {calculatedTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Custo Total de Produção:</span>
                  <span className="font-mono font-medium text-slate-300">R$ {calculatedCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-1.5 border-t border-[#2B2F36]/60">
                  <span className="text-slate-400">Retorno de Lucro Projetado:</span>
                  <span className={`font-mono font-bold ${calculatedProfit > 0 ? 'text-[#22C55E]' : 'text-red-600'}`}>
                    R$ {calculatedProfit.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#2B2F36] text-slate-400 rounded-lg text-xs font-label-md hover:bg-[#121418] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#0084FF] hover:bg-[#0084FF]/90 text-white rounded-lg text-xs font-label-md cursor-pointer"
                >
                  Faturar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
