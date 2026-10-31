import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  Store 
} from 'lucide-react';
import { 
  MARKET_PLATFORMS, 
  MARKET_PERIODS, 
  MARKET_MOCK_DATA, 
  MarketProductItem 
} from '../data/marketSearchData';
import { MarketProductCard } from './search/MarketProductCard';
import { MarketMetricsBanner } from './search/MarketMetricsBanner';

export const ProductSearch: React.FC = () => {
  const [platform, setPlatform] = useState('mercado-livre');
  const [period, setPeriod] = useState('2026');
  const [searchQuery, setSearchQuery] = useState('');

  const displayData: MarketProductItem[] = useMemo(() => {
    const selectedPeriod = MARKET_PERIODS.find(p => p.id === period);
    const multiplier = selectedPeriod ? selectedPeriod.multiplier : 1;
    const items = MARKET_MOCK_DATA[platform] || [];
    
    let filtered = items.map(item => ({
      ...item,
      volume: Math.round(item.baseVolume * multiplier),
      trend: item.baseTrend + (multiplier < 1 ? Math.floor(Math.random() * 5) - 2 : 0)
    }));

    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [platform, period, searchQuery]);

  const totalVolume = displayData.reduce((acc, curr) => acc + (curr.volume || 0), 0);
  const bestSeller = displayData.find(item => item.isBestseller) || displayData[0];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-[#14171E] p-5 sm:p-6 rounded-2xl border border-[#222733] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#FFB800] rounded-xl text-[#0F1115] shadow-lg shadow-amber-500/20">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Pesquisa de Produtos & Tendências
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Descubra os top itens impressos em 3D mais vendidos nos principais marketplaces.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Marketplace Selector */}
          <div className="relative flex-1 sm:flex-none min-w-[190px]">
            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-[#11141A] border border-[#2B303E] text-white text-xs rounded-xl pl-10 pr-8 py-2.5 focus:border-[#FFB800] outline-none transition-all cursor-pointer font-medium"
            >
              {MARKET_PLATFORMS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Period Selector */}
          <div className="relative flex-1 sm:flex-none min-w-[160px]">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-[#11141A] border border-[#2B303E] text-white text-xs rounded-xl pl-10 pr-8 py-2.5 focus:border-[#FFB800] outline-none transition-all cursor-pointer font-medium"
            >
              {MARKET_PERIODS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <MarketMetricsBanner
        totalVolume={totalVolume}
        itemCount={displayData.length}
        bestSellerName={bestSeller?.name}
      />

      {/* Search Input Bar */}
      <div className="bg-[#14171E] border border-[#222733] p-4 rounded-2xl shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Pesquisar termo (ex: suporte, vaso, dragão, luminária)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#2B303E] rounded-xl text-slate-200 bg-[#11141A] outline-none focus:border-[#FFB800] text-xs transition-colors"
          />
        </div>
      </div>

      {/* Product Cards Grid */}
      {displayData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
          {displayData.map((item, index) => (
            <MarketProductCard
              key={item.id}
              item={item}
              rank={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#14171E] rounded-2xl border border-[#222733]">
          <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">Nenhum produto encontrado</h3>
          <p className="text-xs text-slate-400 mt-1">Tente pesquisar por outros termos de impressão 3D.</p>
        </div>
      )}
    </div>
  );
};
