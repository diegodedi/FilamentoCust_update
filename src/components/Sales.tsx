import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { Plus } from 'lucide-react';
import { SalesMetrics } from './sales/SalesMetrics';
import { SalesTable } from './sales/SalesTable';
import { SalesModal } from './sales/SalesModal';

export const Sales: React.FC = () => {
  const { sales, products, customers, addSale, updateSale, deleteSale } = useDb();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedClientId, setSelectedClientId] = useState(customers[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | null>(null);
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
    if (window.confirm("Tem certeza que deseja excluir esta venda?\n\nAviso: O estoque e o fluxo de caixa não serão revertidos automaticamente.")) {
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
      clientName: currentCustomer?.name || 'Cliente',
      productId: selectedProductId,
      productName: currentProduct?.name || 'Produto',
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
        alert('Venda atualizada com sucesso!');
      } else {
        addSale(saleData);
        setIsModalOpen(false);
        alert('Venda registrada com sucesso!');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] shadow-sm">
        <div>
          <h2 className="font-headline-md text-white mb-1">Registro de Pedidos e Vendas</h2>
          <p className="text-slate-400 font-body-md text-xs sm:text-sm">
            Gerencie pedidos recebidos, ordens de faturamento e lucros por transação.
          </p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="bg-[#FFB800] hover:bg-[#FFA500] text-[#0F1115] px-5 py-2.5 rounded-xl font-label-md flex items-center gap-2 shadow-md shadow-amber-500/20 font-bold transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Registrar Venda
        </button>
      </div>

      {/* Grid de Métricas da Venda */}
      <SalesMetrics
        salesCount={sales.length}
        averageTicket={averageTicket}
        totalSalesProfit={totalSalesProfit}
        totalSalesRevenue={totalSalesRevenue}
      />

      {/* Tabela de Vendas */}
      <SalesTable
        filteredSales={filteredSales}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal registrar venda */}
      <SalesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        selectedProductId={selectedProductId}
        setSelectedProductId={setSelectedProductId}
        quantity={quantity}
        setQuantity={setQuantity}
        customPrice={customPrice}
        setCustomPrice={setCustomPrice}
        defaultPrice={defaultPrice}
        saleDate={saleDate}
        setSaleDate={setSaleDate}
        calculatedTotal={calculatedTotal}
        calculatedCost={calculatedCost}
        calculatedProfit={calculatedProfit}
        customers={customers}
        products={products}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
