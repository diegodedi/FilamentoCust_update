import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { Material } from '../types';
import { Search, Plus, FileDown, Layers } from 'lucide-react';
import { MaterialCard } from './materials/MaterialCard';
import { MaterialSellerSidebar } from './materials/MaterialSellerSidebar';
import { MaterialModal } from './materials/MaterialModal';
import { SellerModal } from './materials/SellerModal';

export const Materials: React.FC = () => {
  const { materials, addMaterial, deleteMaterial, updateMaterial, sellers, addSeller } = useDb();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [chartColorFilter, setChartColorFilter] = useState('Todos');

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (mat: Material) => {
    setEditingMaterial(mat);
    setIsModalOpen(true);
  };

  const handleSaveMaterial = (data: Omit<Material, 'id'>, id?: string) => {
    if (id) {
      updateMaterial(id, { ...data, id });
    } else {
      addMaterial(data);
    }
  };

  const handleAddUnit = (mat: Material) => {
    updateMaterial(mat.id, {
      ...mat,
      currentWeight: mat.currentWeight + 1000
    });
  };

  const handleAddSeller = (name: string, link?: string) => {
    addSeller({ name, link });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#14171E] p-5 sm:p-6 rounded-2xl border border-[#222733] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#FFB800] rounded-xl text-[#0F1115] shadow-lg shadow-amber-500/20">
            <Layers className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Controle de Insumos & Filamentos
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Gerencie os carretéis, cores disponíveis e custos de aquisição por grama.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          <button 
            onClick={() => alert('Relatório de consumo e estoque de carretéis exportado com sucesso!')}
            className="px-4 py-2.5 bg-[#1B1E26] border border-[#2B303E] text-slate-300 hover:text-white rounded-xl text-xs font-semibold hover:bg-[#252A36] flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <FileDown className="w-4 h-4" /> Exportar CSV
          </button>
          <button 
            onClick={() => setIsSellerModalOpen(true)}
            className="px-4 py-2.5 bg-[#1B1E26] border border-[#2B303E] text-amber-300 hover:text-white rounded-xl text-xs font-semibold hover:bg-[#252A36] flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Registrar Vendedor
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#FFB800] hover:bg-[#e6a600] text-[#0F1115] font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Registrar Rolo
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-[#14171E] border border-[#222733] p-4 rounded-2xl shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, cor ou marca do filamento..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#2B303E] rounded-xl text-slate-200 bg-[#11141A] outline-none focus:border-[#FFB800] text-xs transition-colors"
          />
        </div>
      </div>

      {/* Main Grid and Analytics Sidebar */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
            {filteredMaterials.map((mat) => (
              <MaterialCard
                key={mat.id}
                material={mat}
                sellers={sellers}
                onEdit={handleEdit}
                onDelete={deleteMaterial}
                onAddUnit={handleAddUnit}
              />
            ))}

            {/* Bento Add Placeholder Card */}
            <button 
              onClick={handleOpenAddModal}
              className="bg-[#14171E] border-2 border-dashed border-[#2B303E] hover:border-[#FFB800] rounded-2xl flex flex-col items-center justify-center p-8 transition-all group min-h-[300px] cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl border border-[#2B303E] flex items-center justify-center text-slate-400 group-hover:border-[#FFB800] group-hover:text-[#FFB800] transition-colors mb-4 bg-[#11141A] shadow-sm">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <p className="font-bold text-slate-200 text-sm group-hover:text-[#FFB800] transition-colors">
                Comprar Nova Bobina
              </p>
              <p className="text-xs text-slate-400 text-center mt-2 max-w-[170px] leading-relaxed">
                Adicione novos filamentos para expandir as opções e cores do catálogo 3D.
              </p>
            </button>
          </div>
        </div>

        {/* Analytics Sidebar */}
        <MaterialSellerSidebar
          materials={materials}
          sellers={sellers}
          chartColorFilter={chartColorFilter}
          setChartColorFilter={setChartColorFilter}
        />
      </div>

      {/* Modals */}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingMaterial={editingMaterial}
        sellers={sellers}
        onSave={handleSaveMaterial}
      />

      <SellerModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        onSave={handleAddSeller}
      />
    </div>
  );
};
