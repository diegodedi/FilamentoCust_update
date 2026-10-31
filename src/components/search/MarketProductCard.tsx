import React from 'react';
import { MarketProductItem } from '../../data/marketSearchData';
import { ArrowUpRight, ArrowDownRight, ExternalLink, Award } from 'lucide-react';

interface MarketProductCardProps {
  item: MarketProductItem;
  rank: number;
}

export const MarketProductCard: React.FC<MarketProductCardProps> = ({ item, rank }) => {
  return (
    <div className="bg-[#14171E] border border-[#222733] rounded-2xl overflow-hidden hover:border-amber-500/40 hover:shadow-xl transition-all group flex flex-col justify-between">
      {/* Product Image Frame */}
      <div className="h-44 relative overflow-hidden bg-[#11141A] border-b border-[#222733] flex items-center justify-center p-3">
        <img 
          src={item.image} 
          alt={item.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=60';
          }}
        />

        {/* Rank Badge */}
        <div className="absolute top-3 left-3 bg-[#11141A]/90 backdrop-blur-sm text-white border border-[#222733] w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shadow-md">
          #{rank}
        </div>

        {/* Bestseller Badge */}
        {item.isBestseller && (
          <div className="absolute top-3 right-3 bg-[#FFB800] text-[#0F1115] text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
            <Award className="w-3 h-3" />
            Top Vendas
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-tight group-hover:text-[#FFB800] transition-colors">
            {item.name}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {item.popularity}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="pt-2 border-t border-[#222733] flex items-center justify-between">
          <div>
            <span className="block text-[9px] font-mono text-slate-500 font-bold uppercase">Preço Médio</span>
            <span className="text-sm font-mono font-bold text-white">{item.price}</span>
          </div>

          <div className="text-right">
            <span className="block text-[9px] font-mono text-slate-500 font-bold uppercase">Tendência</span>
            <div className={`flex items-center justify-end text-xs font-mono font-bold ${
              (item.trend || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {(item.trend || 0) >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              <span>{Math.abs(item.trend || 0)}%</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1B1E26] hover:bg-[#252A36] text-slate-200 hover:text-white border border-[#2B303E] text-xs font-semibold transition-colors cursor-pointer"
        >
          <span>Ver Anúncio</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#FFB800]" />
        </a>
      </div>
    </div>
  );
};

