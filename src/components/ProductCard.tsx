import React from 'react';
import { Product } from '../types';
import { Trash2, Edit, Image as ImageIcon } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onOpenMercadoLivre?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product: p,
  onEdit,
  onDelete,
  onOpenMercadoLivre
}) => {
  const materialType = p.materialType || 'PLA';

  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-[#2B303E] shadow-sm overflow-hidden flex flex-col group relative transition-all duration-300 hover:border-[#FFB800]/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      {/* Image Header */}
      <div className="aspect-[4/3] bg-[#11141A] relative overflow-hidden">
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <ImageIcon className="w-12 h-12 opacity-30" />
          </div>
        )}

        {/* Badges: Categoria e Tipo de Material */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center max-w-[75%]">
          <span className="px-2.5 py-1 bg-[#11141A]/90 backdrop-blur-md text-slate-200 rounded-full text-[10px] font-bold shadow-sm border border-[#2B303E] truncate">
            {p.category}
          </span>
          <span className="px-2.5 py-1 bg-[#FFB800]/20 backdrop-blur-md text-[#FFB800] rounded-full text-[10px] font-bold shadow-sm border border-[#FFB800]/40 truncate">
            {materialType}
          </span>
        </div>

        {/* Floating Actions on Hover */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onOpenMercadoLivre && (
            <button
              onClick={() => onOpenMercadoLivre(p)}
              className="p-2 bg-[#FFB800] hover:bg-[#FFA500] text-[#0F1115] font-black rounded-full shadow-md transition-transform hover:scale-105 text-[10px] cursor-pointer"
              title="Gerar Anúncio Mercado Livre"
            >
              ML
            </button>
          )}
          <button
            onClick={() => onEdit(p)}
            className="p-2 bg-[#1A1D25]/90 hover:bg-[#252A37] text-slate-300 hover:text-white rounded-full shadow-sm border border-[#2B303E] transition-colors cursor-pointer"
            title="Editar"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(p.id)}
            className="p-2 bg-[#1A1D25]/90 hover:bg-[#FF5E3A]/20 text-[#FF5E3A] rounded-full shadow-sm border border-[#2B303E] transition-colors cursor-pointer"
            title="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-white text-base leading-tight mb-3 line-clamp-2 group-hover:text-[#FFB800] transition-colors" title={p.name}>
            {p.name}
          </h3>

          {/* Métricas: Tempo, Peso e Material */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-[#11141A] p-2 rounded-xl border border-[#2B303E]">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Tempo</span>
              <span className="font-mono text-xs text-slate-200 font-medium">
                {Math.floor(p.printTime)}h {Math.round((p.printTime % 1) * 60) > 0 ? `${Math.round((p.printTime % 1) * 60)}m` : ''}
              </span>
            </div>
            <div className="bg-[#11141A] p-2 rounded-xl border border-[#2B303E]">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Peso</span>
              <span className="font-mono text-xs text-slate-200 font-medium">{p.weight}g</span>
            </div>
            <div className="bg-[#11141A] p-2 rounded-xl border border-[#2B303E]">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Tipo</span>
              <span className="font-mono text-xs text-[#FFB800] font-bold truncate block" title={materialType}>
                {materialType}
              </span>
            </div>
          </div>

          {p.dimensions && (
            <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-[#11141A] rounded-xl border border-[#2B303E]">
              <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider shrink-0">Medidas:</span>
              <span className="text-slate-200 font-mono text-xs truncate" title={p.dimensions}>{p.dimensions}</span>
            </div>
          )}
        </div>

        {/* Precificação & Rodapé */}
        <div className="mt-3 pt-3 border-t border-[#2B303E] space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Custo Total:</span>
            <span className="font-mono font-medium text-slate-300">R$ {p.costPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Preço B2B (Mín: {p.b2bMinQty || 10} un):</span>
            <span className="font-mono font-bold text-[#FFB800]">R$ {(p.b2bPrice || (p.costPrice * 4)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-200 font-medium">Preço Sugerido (B2C):</span>
            <span className="font-mono font-bold text-[#10B981]">R$ {(p.b2cPrice || p.sellPrice).toFixed(2)}</span>
          </div>
          {p.marketplacePlatform && p.marketplacePlatform !== 'Nenhum' && (
            <div className="flex justify-between items-center text-xs pt-1 border-t border-[#2B303E]">
              <span className="text-slate-400">Plataforma ({p.marketplacePlatform.split(' ')[0]}):</span>
              <span className="font-mono font-bold text-[#FF5E3A]">R$ {(p.marketplacePrice || 0).toFixed(2)}</span>
            </div>
          )}

          {onOpenMercadoLivre && (
            <button
              type="button"
              onClick={() => onOpenMercadoLivre(p)}
              className="mt-3 w-full py-2.5 px-3 bg-[#FFB800]/15 hover:bg-[#FFB800] text-[#FFB800] hover:text-[#0F1115] border border-[#FFB800]/30 hover:border-transparent rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm cursor-pointer"
              title="Gerar anúncio e copiar descrição para o Mercado Livre"
            >
              <span className="w-4 h-4 rounded bg-[#FFB800] text-[#0F1115] flex items-center justify-center font-black text-[9px]">
                ML
              </span>
              <span>Copiar Anúncio ML</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
