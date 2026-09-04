import sys
with open('src/components/Sales.tsx', 'r') as f:
    lines = f.readlines()

new_code = """  const handleOpenModal = () => {
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
    if (window.confirm("Tem certeza que deseja excluir esta venda?\\n\\nAviso: O estoque e o fluxo de caixa não serão revertidos automaticamente. Você precisará ajustar manualmente.")) {
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
"""

# Replace lines 29 to 63 (index 28 to 63 in 0-indexed python, so lines[28:63])
lines = lines[:28] + [new_code] + lines[63:]

with open('src/components/Sales.tsx', 'w') as f:
    f.writelines(lines)
