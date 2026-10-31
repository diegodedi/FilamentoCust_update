export interface MarketProductItem {
  id: number;
  name: string;
  price: string;
  link: string;
  image: string;
  popularity: string;
  isBestseller?: boolean;
  baseVolume: number;
  baseTrend: number;
  volume?: number;
  trend?: number;
}

export interface MarketPlatform {
  id: string;
  name: string;
}

export interface MarketPeriod {
  id: string;
  name: string;
  multiplier: number;
}

export const MARKET_PLATFORMS: MarketPlatform[] = [
  { id: 'mercado-livre', name: 'Mercado Livre' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'aliexpress', name: 'AliExpress' }
];

export const MARKET_PERIODS: MarketPeriod[] = [
  { id: '2026', name: 'Ano Atual (2026)', multiplier: 1 },
  { id: 'last-30', name: 'Últimos 30 dias', multiplier: 0.08 },
  { id: 'last-6m', name: 'Últimos 6 meses', multiplier: 0.5 },
  { id: '2025', name: 'Ano Passado (2025)', multiplier: 0.85 }
];

export const MARKET_MOCK_DATA: Record<string, MarketProductItem[]> = {
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
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_841250-MLB51234567890_082022-F.webp', 
      popularity: '4.6 ★ (310 avaliações)', baseVolume: 4200, baseTrend: 14 
    }
  ],
  'amazon': [
    { 
      id: 1, name: 'Kit Organizador de Cabos e Fios Para Mesa Gamer', 
      price: 'R$ 29,90', 
      link: 'https://www.amazon.com.br/s?k=organizador-cabos-3d', 
      image: 'https://m.media-amazon.com/images/I/61abc123DEF._AC_SX679_.jpg', 
      popularity: '4.7 ★ (2.450 avaliações)', isBestseller: true, baseVolume: 22100, baseTrend: 16 
    },
    { 
      id: 2, name: 'Suporte Articulado para Celular e Tablet', 
      price: 'R$ 49,90', 
      link: 'https://www.amazon.com.br/s?k=suporte-celular-3d', 
      image: 'https://m.media-amazon.com/images/I/71xyz789ABC._AC_SX679_.jpg', 
      popularity: '4.8 ★ (1.890 avaliações)', isBestseller: true, baseVolume: 18400, baseTrend: 4 
    },
    { 
      id: 3, name: 'Luminária Saturno com Base de Madeira 3D', 
      price: 'R$ 79,90', 
      link: 'https://www.amazon.com.br/s?k=luminaria-saturno-3d', 
      image: 'https://m.media-amazon.com/images/I/61jkl456MNO._AC_SX679_.jpg', 
      popularity: '4.6 ★ (980 avaliações)', baseVolume: 14200, baseTrend: 20 
    },
    { 
      id: 4, name: 'Apoio Ergonômico de Pulso para Teclado Mecânico', 
      price: 'R$ 59,00', 
      link: 'https://www.amazon.com.br/s?k=apoio-pulso-3d', 
      image: 'https://m.media-amazon.com/images/I/51pqr123STU._AC_SX679_.jpg', 
      popularity: '4.9 ★ (640 avaliações)', baseVolume: 11500, baseTrend: 9 
    },
    { 
      id: 5, name: 'Torre de Dados (Dice Tower) Para RPG Medieval', 
      price: 'R$ 69,90', 
      link: 'https://www.amazon.com.br/s?k=dice-tower-3d', 
      image: 'https://m.media-amazon.com/images/I/71vwx456YZA._AC_SX679_.jpg', 
      popularity: '4.8 ★ (512 avaliações)', isBestseller: true, baseVolume: 9900, baseTrend: 30 
    },
    { 
      id: 6, name: 'Suporte de Parede Para Skateboard / Longboard', 
      price: 'R$ 34,90', 
      link: 'https://www.amazon.com.br/s?k=suporte-skate-3d', 
      image: 'https://m.media-amazon.com/images/I/61bcd789EFG._AC_SX679_.jpg', 
      popularity: '4.7 ★ (430 avaliações)', baseVolume: 8200, baseTrend: -2 
    },
    { 
      id: 7, name: 'Vaso Sanitário Porta Esponja Divertido Pia', 
      price: 'R$ 22,00', 
      link: 'https://www.amazon.com.br/s?k=porta-esponja-divertido-3d', 
      image: 'https://m.media-amazon.com/images/I/51hij012KLM._AC_SX679_.jpg', 
      popularity: '4.5 ★ (1.120 avaliações)', baseVolume: 7400, baseTrend: 7 
    },
    { 
      id: 8, name: 'Suporte para Carregador MagSafe Apple', 
      price: 'R$ 39,90', 
      link: 'https://www.amazon.com.br/s?k=suporte-magsafe-3d', 
      image: 'https://m.media-amazon.com/images/I/61nop345QRS._AC_SX679_.jpg', 
      popularity: '4.6 ★ (780 avaliações)', baseVolume: 6700, baseTrend: 11 
    },
    { 
      id: 9, name: 'Dispenser de Pilhas AA e AAA Tipo Gravidade', 
      price: 'R$ 32,00', 
      link: 'https://www.amazon.com.br/s?k=dispenser-pilhas-3d', 
      image: 'https://m.media-amazon.com/images/I/71tuv678WXY._AC_SX679_.jpg', 
      popularity: '4.8 ★ (890 avaliações)', baseVolume: 5900, baseTrend: 3 
    },
    { 
      id: 10, name: 'Engrenagem / Manivela Fidget Toy Antiestresse', 
      price: 'R$ 19,90', 
      link: 'https://www.amazon.com.br/s?k=fidget-toy-3d', 
      image: 'https://m.media-amazon.com/images/I/51zab901CDE._AC_SX679_.jpg', 
      popularity: '4.7 ★ (3.100 avaliações)', baseVolume: 5100, baseTrend: 15 
    }
  ],
  'aliexpress': [
    { 
      id: 1, name: 'Kit 100 Mini Peças Articuladas e Fidgets Sortidos', 
      price: 'R$ 110,00', 
      link: 'https://pt.aliexpress.com/w/wholesale-fidget-pack-3d.html', 
      image: 'https://ae01.alicdn.com/kf/S12345678901234567890123456789012/220x220.jpg', 
      popularity: '★ 4.9 | 15.000+ vendidos', isBestseller: true, baseVolume: 45000, baseTrend: 35 
    },
    { 
      id: 2, name: 'Lâmpadas Noturnas de LED 3D Animais Fantásticos', 
      price: 'R$ 38,00', 
      link: 'https://pt.aliexpress.com/w/wholesale-night-light-3d.html', 
      image: 'https://ae01.alicdn.com/kf/S98765432109876543210987654321098/220x220.jpg', 
      popularity: '★ 4.8 | 22.000+ vendidos', isBestseller: true, baseVolume: 38200, baseTrend: 8 
    },
    { 
      id: 3, name: 'Dragão Cristal Articulado Flexível Colorido', 
      price: 'R$ 48,00', 
      link: 'https://pt.aliexpress.com/w/wholesale-crystal-dragon-3d.html', 
      image: 'https://ae01.alicdn.com/kf/S11223344556677889900112233445566/220x220.jpg', 
      popularity: '★ 4.9 | 10.000+ vendidos', isBestseller: true, baseVolume: 32000, baseTrend: 40 
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

