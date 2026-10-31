import React from 'react';
import { Package, BarChart3, Star } from 'lucide-react';

interface MarketMetricsBannerProps {
  totalVolume: number;
  itemCount: number;
  bestSellerName?: string;
}

export const MarketMetricsBanner: React.FC<MarketMetricsBannerProps> = ({
  totalVolume,
  itemCount,
  bestSellerName
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-[#14171E] border border-[#222733] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
        <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
            Buscas Estimadas / Mês
          </span>
          <p className="text-lg font-mono font-bold text-white">
            {totalVolume.toLocaleString('pt-BR')} buscas
          </p>
        </div>
      </div>

      <div className="bg-[#14171E] border border-[#222733] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
        <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[#FFB800]">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
            Itens Monitorados
          </span>
          <p className="text-lg font-mono font-bold text-white">
            {itemCount} produtos
          </p>
        </div>
      </div>

      <div className="bg-[#14171E] border border-[#222733] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
        <div className="p-2.5 bg-sky-500/15 border border-sky-500/30 rounded-xl text-sky-400">
          <Star className="w-5 h-5" />
        </div>
        <div className="truncate">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
            Produto Destaque
          </span>
          <p className="text-sm font-bold text-white truncate" title={bestSellerName}>
            {bestSellerName || 'Vaso Robert Plant'}
          </p>
        </div>
      </div>
    </div>
  );
};

