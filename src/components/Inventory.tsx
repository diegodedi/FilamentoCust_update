import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { InventoryItem } from '../types';
import { InventoryMetrics } from './inventory/InventoryMetrics';
import { InventoryTable } from './inventory/InventoryTable';
import { InventoryExtras } from './inventory/InventoryExtras';

export const Inventory: React.FC = () => {
  const { inventory, registerMovement } = useDb();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [movementQty, setMovementQty] = useState(1);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

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

    const itemToScan = inventory[Math.floor(Math.random() * inventory.length)];
    if (itemToScan) {
      registerMovement(itemToScan.id, 'IN', 1);
      setScanSuccess(`Código "${barcodeInput}" lido! Entrada registrada: +1 ${itemToScan.name}`);
      setBarcodeInput('');
      setTimeout(() => setScanSuccess(null), 4000);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'Todos' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] shadow-sm">
        <h2 className="font-headline-md text-white mb-1">Controle de Estoque & Suprimentos</h2>
        <p className="text-slate-400 font-body-md text-xs sm:text-sm">
          Monitore o saldo físico de peças acabadas, níveis de reposição e movimentações de saída.
        </p>
      </div>

      {/* Grid de Métricas Rápidas */}
      <InventoryMetrics inventory={inventory} />

      {/* Filtros e Tabela */}
      <InventoryTable
        filteredInventory={filteredInventory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        statuses={statuses}
        onOpenMovement={handleOpenMovement}
      />

      {/* Previsão de Ruptura, Coletor & Modal */}
      <InventoryExtras
        barcodeInput={barcodeInput}
        setBarcodeInput={setBarcodeInput}
        handleBarcodeScan={handleBarcodeScan}
        scanSuccess={scanSuccess}
        isMovementModalOpen={isMovementModalOpen}
        setIsMovementModalOpen={setIsMovementModalOpen}
        selectedItemForMovement={selectedItemForMovement}
        movementType={movementType}
        movementQty={movementQty}
        setMovementQty={setMovementQty}
        handleMovementSubmit={handleMovementSubmit}
      />
    </div>
  );
};
