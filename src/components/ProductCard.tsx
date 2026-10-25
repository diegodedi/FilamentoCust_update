import React from 'react';
import { Product } from '../types';
import { Trash2, Edit, Image as ImageIcon, Copy } from 'lucide-react';

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
    <div className="bg-[#1C1F24] rounded-xl border border-[#2B2F36] shadow-sm overflow-hidden flex flex-col group relative transition-all hover:shadow-md hover:border-[#0084FF]/30">
      {/* Image Header */}
      <div className="aspect-[4/3] bg-[#2B2F36] relative overflow-hidden">
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <ImageIcon className="w-12 h-12 opacity-20" />
          </div>
        )}

        {/* Badges: Categoria e Tipo de Material */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center max-w-[70%]">
          <span className="px-2.5 py-1 bg-[#1C1F24]/90 backdrop-blur-sm text-slate-200 rounded-full text-[10px] font-bold shadow-sm border border-[#2B2F36]/50 truncate">
            {p.category}
          </span>
          <span className="px-2.5 py-1 bg-[#0084FF]/25 backdrop-blur-sm text-[#38BDF8] rounded-full text-[10px] font-bold shadow-sm border border-[#0084FF]/40 truncate">
            {materialType}
          </span>
        </div>

        {/* Floating Actions on Hover */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onOpenMercadoLivre && (
            <button
              onClick={() => onOpenMercadoLivre(p)}
              className="p-2 bg-[#FFE600] hover:bg-amber-300 text-slate-950 font-black rounded-full shadow-md transition-all text-[10px]"
              title="Gerar Anúncio Mercado Livre"
            >
              ML
            </button>
          )}
          <button
            onClick={() => onEdit(p)}
            className="p-2 bg-[#1C1F24]/90 hover:bg-[#1C1F24] text-slate-300 rounded-full shadow-sm transition-colors"
            title="Editar"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(p.id)}
            className="p-2 bg-[#1C1F24]/90 hover:bg-red-500/20 text-red-400 rounded-full shadow-sm transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-white text-lg leading-tight mb-4 line-clamp-2" title={p.name}>
          {p.name}
        </h3>

        {/* Métricas: Tempo, Peso e Tipo de Material */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-[#121418] p-2 rounded-lg border border-[#2B2F36]">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Tempo</span>
            <span className="font-mono text-xs text-slate-200 font-medium">
              {Math.floor(p.printTime)}h {Math.round((p.printTime % 1) * 60) > 0 ? `${Math.round((p.printTime % 1) * 60)}m` : ''}
            </span>
          </div>
          <div className="bg-[#121418] p-2 rounded-lg border border-[#2B2F36]">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Peso</span>
            <span className="font-mono text-xs text-slate-200 font-medium">{p.weight}g</span>
          </div>
          <div className="bg-[#121418] p-2 rounded-lg border border-[#2B2F36]">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Material</span>
            <span className="font-mono text-xs text-[#38BDF8] font-bold truncate block" title={materialType}>
              {materialType}
            </span>
          </div>
        </div>

        {p.dimensions && (
          <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5 px-2.5 py-1 bg-[#121418] rounded-md border border-[#2B2F36]/60">
            <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider shrink-0">Medidas:</span>
            <span className="text-slate-200 font-mono text-xs truncate" title={p.dimensions}>{p.dimensions}</span>
          </div>
        )}

        {/* Precificação */}
        <div className="mt-auto pt-4 border-t border-[#2B2F36] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Custo Total:</span>
            <span className="font-mono font-medium text-slate-200">R$ {p.costPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Preço B2B (Mín: {p.b2bMinQty || 10} un):</span>
            <span className="font-mono font-bold text-[#0084FF]">R$ {(p.b2bPrice || (p.costPrice * 4)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-200 font-medium">Preço Sugerido (B2C):</span>
            <span className="font-mono font-bold text-[#22C55E]">R$ {(p.b2cPrice || p.sellPrice).toFixed(2)}</span>
          </div>
          {p.marketplacePlatform && p.marketplacePlatform !== 'Nenhum' && (
            <div className="flex justify-between items-center text-xs mt-1 pt-1 border-t border-[#2B2F36]">
              <span className="text-slate-400">Plataforma ({p.marketplacePlatform.split(' ')[0]}):</span>
              <span className="font-mono font-bold text-[#F59E0B]">R$ {(p.marketplacePrice || 0).toFixed(2)}</span>
            </div>
          )}

          {onOpenMercadoLivre && (
            <button
              type="button"
              onClick={() => onOpenMercadoLivre(p)}
              className="mt-3 w-full py-2 px-3 bg-[#FFE600]/10 hover:bg-[#FFE600]/20 text-[#FFE600] border border-[#FFE600]/30 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm group/btn"
              title="Gerar anúncio e copiar descrição para o Mercado Livre"
            >
              <span className="w-4 h-4 rounded bg-[#FFE600] text-slate-950 flex items-center justify-center font-black text-[9px] group-hover/btn:scale-110 transition-transform">
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
