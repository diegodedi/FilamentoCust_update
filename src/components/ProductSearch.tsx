import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  ExternalLink,
  Star,
  Award
} from 'lucide-react';

// Tipagem para os itens simulando um retorno real de Web Scraper
interface ProductItem {
  id: number;
  name: string;
  price: string;
  link: string;
  image: string;
  popularity: string;
  isBestseller?: boolean;
  baseVolume: number;
  baseTrend: number;
}

// Estes dados simulam um scraping em tempo real nas páginas públicas dos marketplaces, focado apenas em PRODUTOS IMPRESSOS
const MOCK_DATA: Record<string, ProductItem[]> = {
  'mercado-livre': [
    { 
      id: 1, name: 'Vaso Bob Robert Plant (Kit 4 Unidades) Decoração', 
      price: 'R$ 35,90', 
      link: 'https://lista.mercadolivre.com.br/vaso-bob-impresso-3d', 
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_789456-MLB123456789_012022-F.webp', 
      popularity: '4.8 ★ (1.240 avaliações)', isBestseller: true, baseVolume: 15420, baseTrend: 12 
    },
    { 
      id: 2, name: 'Suporte de Mesa para Headset/Fone Gamer', 
      price: 'R$ 45,00', 
      link: 'https://lista.mercadolivre.com.br/suporte-headset-impressao-3d', 
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_654321-MLB987654321_022022-F.webp', 
      popularity: '4.9 ★ (850 avaliações)', isBestseller: true, baseVolume: 12350, baseTrend: 5 
    },
    { 
      id: 3, name: 'Dragão Articulado 30cm Colecionável', 
      price: 'R$ 80,00', 
      link: 'https://lista.mercadolivre.com.br/dragao-articulado-3d', 
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_123789-MLB456123789_082023-F.webp', 
      popularity: '4.7 ★ (610 avaliações)', baseVolume: 9800, baseTrend: 25 
    },
    { 
      id: 4, name: 'Suporte Expositor para Controle PS5 / PS4 / Xbox', 
      price: 'R$ 38,90', 
      link: 'https://lista.mercadolivre.com.br/suporte-controle-ps5-3d', 
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_995400-MLB49118021021_022022-F.webp', 
      popularity: '4.8 ★ (1.025 avaliações)', baseVolume: 8500, baseTrend: 8 
    },
    { 
      id: 5, name: 'Luminária Lua Cheia 3D Abajur 15cm RGB', 
      price: 'R$ 65,00', 
      link: 'https://lista.mercadolivre.com.br/luminaria-lua-3d', 
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_959325-MLB47913210344_102021-F.webp', 
      popularity: '4.8 ★ (2.140 avaliações)', baseVolume: 7200, baseTrend: 15 
    },
    { 
      id: 6, name: 'Cortador de Biscoito Personalizado (Tema Infantil)', 
      price: 'R$ 15,90', 
      link: 'https://lista.mercadolivre.com.br/cortador-biscoito-3d', 
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_616580-MLB43310036125_082020-F.webp', 
      popularity: '4.9 ★ (3.421 avaliações)', baseVolume: 6800, baseTrend: 2 
    },
    { 
      id: 7, name: 'Suporte Base Parede Para Echo Dot 4 e 5 Geração', 
      price: 'R$ 29,90', 
      link: 'https://lista.mercadolivre.com.br/suporte-echo-dot-3d', 
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_654160-MLB48674550186_122021-F.webp', 
      popularity: '4.7 ★ (854 avaliações)', baseVolume: 6100, baseTrend: 18 
    },
    { 
      id: 8, name: 'Case Gabinete Para Raspberry Pi 3 / 4', 
      price: 'R$ 55,00', 
      link: 'https://lista.mercadolivre.com.br/case-raspberry-3d', 
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_656254-MLB46221768800_052021-F.webp', 
      popularity: '4.8 ★ (420 avaliações)', baseVolume: 5400, baseTrend: -5 
    },
    { 
      id: 9, name: 'Suporte Invisível para Notebook Ergonômico', 
      price: 'R$ 25,00', 
      link: 'https://lista.mercadolivre.com.br/suporte-notebook-3d', 
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_702058-MLB70984920406_082023-F.webp', 
      popularity: '4.9 ★ (1.420 avaliações)', isBestseller: true, baseVolume: 4900, baseTrend: 1 
    },
    { 
      id: 10, name: 'Miniatura Action Figure RPG Personalizada', 
      price: 'R$ 90,00', 
      link: 'https://lista.mercadolivre.com.br/miniatura-rpg-3d', 
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_897120-MLB71758509378_092023-F.webp', 
      popularity: '4.8 ★ (320 avaliações)', baseVolume: 4200, baseTrend: 7 
    }
  ],
  'amazon': [
    { 
      id: 1, name: 'Suporte de Parede Echo Dot (4ª e 5ª Geração)', 
      price: 'R$ 29,90', 
      link: 'https://www.amazon.com.br/s?k=suporte+echo+dot+3d', 
      image: 'https://m.media-amazon.com/images/I/61S7zJ41h6L._AC_SL1000_.jpg', 
      popularity: '4.8 de 5 estrelas (3.450)', isBestseller: true, baseVolume: 18200, baseTrend: 25 
    },
    { 
      id: 2, name: 'Vaso Geométrico Minimalista para Suculentas', 
      price: 'R$ 39,90', 
      link: 'https://www.amazon.com.br/s?k=vaso+geometrico+3d', 
      image: 'https://m.media-amazon.com/images/I/61n+1yW+tCL._AC_SL1500_.jpg', 
      popularity: '4.7 de 5 estrelas (1.200)', baseVolume: 14500, baseTrend: 10 
    },
    { 
      id: 3, name: 'Organizador de Cabos de Mesa Honeycomb', 
      price: 'R$ 19,90', 
      link: 'https://www.amazon.com.br/s?k=organizador+cabos+3d', 
      image: 'https://m.media-amazon.com/images/I/61iVfKx+SJL._AC_SL1500_.jpg', 
      popularity: '4.8 de 5 estrelas (2.890)', isBestseller: true, baseVolume: 11200, baseTrend: 8 
    },
    { 
      id: 4, name: 'Suporte para Headset Universal Gamer', 
      price: 'R$ 49,90', 
      link: 'https://www.amazon.com.br/s?k=suporte+headset+3d', 
      image: 'https://m.media-amazon.com/images/I/71c3Vj+n-SL._AC_SL1500_.jpg', 
      popularity: '4.6 de 5 estrelas (940)', baseVolume: 9500, baseTrend: 15 
    },
    { 
      id: 5, name: 'Aparador de Livros Temático Senhor dos Anéis', 
      price: 'R$ 85,00', 
      link: 'https://www.amazon.com.br/s?k=aparador+livros+3d', 
      image: 'https://m.media-amazon.com/images/I/51r2Xo2O-FL._AC_SL1000_.jpg', 
      popularity: '4.5 de 5 estrelas (520)', baseVolume: 8100, baseTrend: 5 
    },
    { 
      id: 6, name: 'Luminária Planeta Júpiter 3D com Base', 
      price: 'R$ 139,90', 
      link: 'https://www.amazon.com.br/s?k=luminaria+jupiter+3d', 
      image: 'https://m.media-amazon.com/images/I/71Y-3R-k+WL._AC_SL1500_.jpg', 
      popularity: '4.8 de 5 estrelas (1.100)', baseVolume: 7300, baseTrend: -2 
    },
    { 
      id: 7, name: 'Case Raspberry Pi 4 com Cooler Integrado', 
      price: 'R$ 59,90', 
      link: 'https://www.amazon.com.br/s?k=case+raspberry+3d', 
      image: 'https://m.media-amazon.com/images/I/51v1zVz-NPL._AC_SL1000_.jpg', 
      popularity: '4.9 de 5 estrelas (180)', baseVolume: 6800, baseTrend: 40 
    },
    { 
      id: 8, name: 'Suporte Vertical para Notebook', 
      price: 'R$ 79,90', 
      link: 'https://www.amazon.com.br/s?k=suporte+notebook+vertical+3d', 
      image: 'https://m.media-amazon.com/images/I/71Q+a3M+yBL._AC_SL1500_.jpg', 
      popularity: '4.7 de 5 estrelas (450)', baseVolume: 5900, baseTrend: 18 
    },
    { 
      id: 9, name: 'Porta Canetas Hexagonal Texturizado', 
      price: 'R$ 25,00', 
      link: 'https://www.amazon.com.br/s?k=porta+canetas+3d', 
      image: 'https://m.media-amazon.com/images/I/61L-N+b-t8L._AC_SL1000_.jpg', 
      popularity: '4.5 de 5 estrelas (890)', baseVolume: 5100, baseTrend: 12 
    },
    { 
      id: 10, name: 'Suporte de Controle Xbox e Celular', 
      price: 'R$ 35,00', 
      link: 'https://www.amazon.com.br/s?k=suporte+controle+3d', 
      image: 'https://m.media-amazon.com/images/I/61r5T+y+hBL._AC_SL1500_.jpg', 
      popularity: '4.8 de 5 estrelas (1.200)', isBestseller: true, baseVolume: 4600, baseTrend: 2 
    }
  ],
  'aliexpress': [
    { 
      id: 1, name: 'Crystal Dragon (Dragão de Cristal Articulado)', 
      price: 'R$ 45,00', 
      link: 'https://pt.aliexpress.com/w/wholesale-crystal-dragon-3d.html', 
      image: 'https://ae01.alicdn.com/kf/S7a1b5c43d2e1488c9f0b8a7f6e5d4c3bT/220x220.jpg', 
      popularity: '★ 4.9 | 20.000+ vendidos', isBestseller: true, baseVolume: 45000, baseTrend: 40 
    },
    { 
      id: 2, name: 'Slug Toy Fidget Articulado Anti-stress', 
      price: 'R$ 15,00', 
      link: 'https://pt.aliexpress.com/w/wholesale-slug-fidget-3d.html', 
      image: 'https://ae01.alicdn.com/kf/S1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p/220x220.jpg', 
      popularity: '★ 4.8 | 15.000+ vendidos', isBestseller: true, baseVolume: 38000, baseTrend: 35 
    },
    { 
      id: 3, name: 'Luminária Lua 3D Personalizada com Foto', 
      price: 'R$ 85,00', 
      link: 'https://pt.aliexpress.com/w/wholesale-moon-lamp-3d.html', 
      image: 'https://ae01.alicdn.com/kf/S9876543210abcdef1234567890abcdef/220x220.jpg', 
      popularity: '★ 4.9 | 10.000+ vendidos', baseVolume: 32000, baseTrend: 15 
    },
    { 
      id: 4, name: 'Miniaturas de D&D e RPG de Mesa Resina', 
      price: 'R$ 25,00', 
      link: 'https://pt.aliexpress.com/w/wholesale-dnd-miniature-3d.html', 
      image: 'https://ae01.alicdn.com/kf/S55555555555555555555555555555555/220x220.jpg', 
      popularity: '★ 4.8 | 5.000+ vendidos', baseVolume: 28000, baseTrend: 22 
    },
    { 
      id: 5, name: 'Suporte de Placa de Vídeo (GPU Bracket) Customizado', 
      price: 'R$ 30,00', 
      link: 'https://pt.aliexpress.com/w/wholesale-gpu-bracket-3d.html', 
      image: 'https://ae01.alicdn.com/kf/S88888888888888888888888888888888/220x220.jpg', 
      popularity: '★ 4.7 | 8.000+ vendidos', isBestseller: true, baseVolume: 24500, baseTrend: 18 
    },
    { 
      id: 6, name: 'Peças de Upgrade para Quest 2 / Quest 3', 
      price: 'R$ 55,00', 
      link: 'https://pt.aliexpress.com/w/wholesale-quest-accessories-3d.html', 
      image: 'https://ae01.alicdn.com/kf/S44444444444444444444444444444444/220x220.jpg', 
      popularity: '★ 4.9 | 3.000+ vendidos', baseVolume: 21000, baseTrend: 10 
    },
    { 
      id: 7, name: 'Estátua Decorativa Minimalista Thinker', 
      price: 'R$ 45,00', 
      link: 'https://pt.aliexpress.com/w/wholesale-thinker-statue-3d.html', 
      image: 'https://ae01.alicdn.com/kf/S33333333333333333333333333333333/220x220.jpg', 
      popularity: '★ 4.9 | 4.500+ vendidos', baseVolume: 18500, baseTrend: 28 
    },
    { 
      id: 8, name: 'Cortadores de Biscoito Anime / Cultura Pop', 
      price: 'R$ 20,00', 
      link: 'https://pt.aliexpress.com/w/wholesale-cookie-cutter-3d.html', 
      image: 'https://ae01.alicdn.com/kf/S22222222222222222222222222222222/220x220.jpg', 
      popularity: '★ 4.8 | 12.000+ vendidos', baseVolume: 16000, baseTrend: 5 
    },
    { 
      id: 9, name: 'Case Retro Game Console Raspberry Pi', 
      price: 'R$ 40,00', 
      link: 'https://pt.aliexpress.com/w/wholesale-retro-case-3d.html', 
      image: 'https://ae01.alicdn.com/kf/S11111111111111111111111111111111/220x220.jpg', 
      popularity: '★ 4.7 | 6.000+ vendidos', baseVolume: 14200, baseTrend: 8 
    },
    { 
      id: 10, name: 'Vaso Robert Plant Decoração', 
      price: 'R$ 28,00', 
      link: 'https://pt.aliexpress.com/w/wholesale-robert-plant-3d.html', 
      image: 'https://ae01.alicdn.com/kf/S99999999999999999999999999999999/220x220.jpg', 
      popularity: '★ 4.8 | 9.500+ vendidos', baseVolume: 12500, baseTrend: 12 
    }
  ]
};

const PLATFORMS = [
  { id: 'mercado-livre', name: 'Mercado Livre' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'aliexpress', name: 'AliExpress' }
];

const PERIODS = [
  { id: '2026', name: 'Ano Atual (2026)', multiplier: 1 },
  { id: 'last-30', name: 'Últimos 30 dias', multiplier: 0.08 },
  { id: 'last-6m', name: 'Últimos 6 meses', multiplier: 0.5 },
  { id: '2025', name: 'Ano Passado (2025)', multiplier: 0.85 }
];

export function ProductSearch() {
  const [platform, setPlatform] = useState('mercado-livre');
  const [period, setPeriod] = useState('2026');
  const [searchQuery, setSearchQuery] = useState('');

  // Computa os dados exibidos com base na plataforma e período selecionados
  const displayData = useMemo(() => {
    const selectedPeriod = PERIODS.find(p => p.id === period);
    const multiplier = selectedPeriod ? selectedPeriod.multiplier : 1;
    const items = MOCK_DATA[platform] || [];
    
    let filtered = items.map(item => ({
      ...item,
      // Simulando alteração no volume baseado no período selecionado
      volume: Math.round(item.baseVolume * multiplier),
      // Pequena variação aleatória simulada na tendência baseada no período para dar dinamicidade
      trend: item.baseTrend + (multiplier < 1 ? Math.floor(Math.random() * 5) - 2 : 0)
    }));

    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [platform, period, searchQuery]);

  // Calcula total simulado do top 10
  const totalVolume = displayData.reduce((acc, curr) => acc + curr.volume, 0);

  return (
    <div className="space-y-6">
      {/* Aviso de Simulação de Scraper */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm px-4 py-3 rounded-xl flex items-center gap-3">
        <div className="flex-1">
          <strong>Aviso:</strong> A visualização abaixo é alimentada por um simulador de web scraper integrado que emula retornos reais (títulos, preços, imagens e avaliações) das páginas públicas de busca (sem autenticação) do Mercado Livre, Amazon e AliExpress para "impressão 3D".
          Se implementar o Node.js scraper no backend no futuro, o design já está adaptado para os dados reais.
        </div>
      </div>

      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-[#0084FF] w-6 h-6" />
            Pesquisa de Produtos
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Descubra os top 10 itens de impressão 3D mais buscados nos marketplaces.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Seletor de Marketplace */}
          <div className="relative flex-1 lg:flex-none min-w-[200px]">
            <label className="text-[10px] uppercase font-bold text-slate-500 absolute -top-2 left-3 bg-[#121418] px-1 z-10">
              Marketplace
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-[#1C1F24] border border-[#2B2F36] text-white text-sm rounded-lg pl-10 pr-10 py-2.5 focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF] outline-none appearance-none transition-all"
              >
                {PLATFORMS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Seletor de Período */}
          <div className="relative flex-1 lg:flex-none min-w-[160px]">
            <label className="text-[10px] uppercase font-bold text-slate-500 absolute -top-2 left-3 bg-[#121418] px-1 z-10">
              Período
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-[#1C1F24] border border-[#2B2F36] text-white text-sm rounded-lg pl-10 pr-10 py-2.5 focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF] outline-none appearance-none transition-all"
              >
                {PERIODS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold mb-1">Volume Estimado (Top 10)</p>
            <h3 className="text-2xl font-bold text-white">{totalVolume.toLocaleString('pt-BR')} unid.</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-[#0084FF] rounded-lg">
            <Package className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold mb-1">Marketplace Ativo</p>
            <h3 className="text-lg font-bold text-white">
              {PLATFORMS.find(p => p.id === platform)?.name}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold mb-1">Status do Motor de Busca</p>
            <h3 className="text-lg font-bold text-emerald-500">Ao Vivo (Simulação)</h3>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar nos resultados scrapeados..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1C1F24] border border-[#2B2F36] text-white rounded-xl pl-12 pr-4 py-3 focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF] outline-none transition-all placeholder:text-slate-500"
        />
      </div>

      {/* Main Table */}
      <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#2B2F36] flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0084FF]" />
            Resultados Orgânicos da Busca
          </h3>
          <span className="text-xs text-slate-400">Classificação natural do marketplace</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-[#23272F] text-slate-400">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Posição</th>
                <th className="px-6 py-4">Produto & Detalhes</th>
                <th className="px-6 py-4">Avaliação / Popularidade</th>
                <th className="px-6 py-4 text-right">Preço</th>
                <th className="px-6 py-4 text-right rounded-tr-lg">Tendência</th>
              </tr>
            </thead>
            <tbody>
              {displayData.length > 0 ? (
                displayData.map((item, index) => (
                  <tr key={item.id} className="border-b border-[#2B2F36] hover:bg-[#23272F]/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                        index === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                        index === 2 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30' :
                        'bg-[#121418] text-slate-500 border border-[#2B2F36]'
                      }`}>
                        #{index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-white p-1 flex-shrink-0 flex items-center justify-center border border-[#2B2F36]">
                           {/* Como não podemos renderizar imagens externas cross-origin não confiáveis, usamos placeholder estético que simula a foto raspada */}
                           <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center relative overflow-hidden">
                             <img src={item.image} alt={item.name} className="w-full h-full object-contain absolute opacity-80 mix-blend-multiply" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                             <ShoppingCart className="w-6 h-6 text-slate-300" />
                           </div>
                        </div>
                        <div className="flex flex-col justify-start">
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-[#0084FF] transition-colors line-clamp-2 max-w-[300px]">
                            {item.name}
                          </a>
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0084FF] mt-1 flex items-center gap-1 opacity-70 hover:opacity-100">
                            Ver no marketplace <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-1.5 text-yellow-500 font-medium">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{item.popularity}</span>
                        </div>
                        {item.isBestseller && (
                          <div className="flex items-center gap-1 text-xs text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded w-max mt-1">
                            <Award className="w-3 h-3" /> Mais Vendido
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right align-top font-mono font-bold text-white text-lg">
                      {item.price}
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className={`flex flex-col items-end gap-1 font-medium ${
                        item.trend > 0 ? 'text-emerald-500' : 
                        item.trend < 0 ? 'text-red-500' : 'text-slate-400'
                      }`}>
                        <div className="flex items-center gap-1 bg-[#121418] px-2 py-1 rounded-lg">
                          {item.trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : 
                           item.trend < 0 ? <ArrowDownRight className="w-4 h-4" /> : null}
                          {Math.abs(item.trend)}%
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wider mt-1">
                          Vol: {item.volume.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="w-10 h-10 text-slate-600" />
                      <p>Nenhum produto encontrado para "{searchQuery}".</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

