import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';
import { MultipartProductModal } from './MultipartProductModal';
import { SingleProductModal } from './products/SingleProductModal';
import { ProductCard } from './ProductCard';
import { MercadoLivreModal } from './MercadoLivreModal';

/**
 * Catálogo Principal de Produtos (Peças Únicas e Multipartes).
 * Refatorado seguindo GOLDCODE v3.0 (modularização em SingleProductModal e MultipartProductModal).
 */
export const Products: React.FC = () => {
  const { products, deleteProduct } = useDb();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMultipartModalOpen, setIsMultipartModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [mercadoLivreProduct, setMercadoLivreProduct] = useState<Product | null>(null);
  const [isMercadoLivreOpen, setIsMercadoLivreOpen] = useState(false);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenAddMultipartModal = () => {
    setEditingProduct(null);
    setIsMultipartModalOpen(true);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    if (p.isMultipart) {
      setIsMultipartModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleOpenMercadoLivre = (product: Product) => {
    setMercadoLivreProduct(product);
    setIsMercadoLivreOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] shadow-sm">
        <div>
          <h2 className="font-headline-md text-white">Catálogo de Produtos</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Gerencie seu portfólio de impressões 3D</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleOpenAddModal}
            className="bg-[#FFB800] hover:bg-[#FFA500] text-[#0F1115] font-extrabold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Novo Produto
          </button>
          <button
            onClick={handleOpenAddMultipartModal}
            className="bg-[#222632] hover:bg-[#2B303E] text-white border border-[#383F50] font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Produto Multpartes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onEdit={handleEdit}
            onDelete={deleteProduct}
            onOpenMercadoLivre={handleOpenMercadoLivre}
          />
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-[#1C1F24] border border-[#2B2F36] border-dashed rounded-xl">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium text-slate-300">Nenhum produto cadastrado.</p>
            <p className="text-xs mt-1">Clique em "Novo Produto" para começar a montar seu catálogo.</p>
          </div>
        )}
      </div>

      <SingleProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        onOpenMercadoLivre={handleOpenMercadoLivre}
      />

      <MultipartProductModal
        isOpen={isMultipartModalOpen}
        onClose={() => {
          setIsMultipartModalOpen(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        onOpenMercadoLivre={handleOpenMercadoLivre}
      />

      <MercadoLivreModal
        isOpen={isMercadoLivreOpen}
        onClose={() => {
          setIsMercadoLivreOpen(false);
          setMercadoLivreProduct(null);
        }}
        product={mercadoLivreProduct}
      />
    </div>
  );
};
