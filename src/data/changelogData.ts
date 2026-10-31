import { ChangelogRelease } from '../types/help';

export const CURRENT_APP_VERSION = '1.0.32';

export const CHANGELOG_DATA: ChangelogRelease[] = [
  {
    version: '1.0.32',
    date: '31/10/2026',
    title: 'Refatoração Modular Completa & Central de Ajuda In-App',
    isCurrent: true,
    highlights: [
      'Central de Ajuda e Manual Interativo integrado com guias passo a passo, busca rápida e exemplos reais',
      'Sistema de controle de versões com exibição automática de novidades (What\'s New) pós-atualização',
      'Refatoração modular do módulo de Filamentos (Materials) em componentes atômicos desacoplados',
      'Refatoração modular do Termômetro 3D com novo layout de métricas e controle de ocupação de mesa',
      'Refatoração da Fila de Produção com monitoramento de impressoras e histórico otimizado',
      'Desacoplamento e componentização do módulo de Pesquisa de Mercado (ProductSearch)'
    ],
    changes: [
      { type: 'new', description: 'Central de Ajuda e Manual de Boas Práticas com simuladores de custo real' },
      { type: 'new', description: 'Modal WhatsNew para anunciar melhorias e novidades a cada nova versão' },
      { type: 'improvement', description: 'Modularização atômica de Filamentos: MaterialCard, MaterialModal, MaterialBrandSelector, MaterialPricingWeightSection e MaterialSellerSidebar' },
      { type: 'improvement', description: 'Modularização do Termômetro 3D: ThermometerSidebar, ThermometerModelCard e ThermometerBottomMetrics' },
      { type: 'improvement', description: 'Modularização da Produção: PrinterCard, PrintJobsHistoryTable e AddPrinterModal' },
      { type: 'improvement', description: 'Desacoplamento do catálogo de pesquisa de mercado em marketSearchData.ts e MarketProductCard' },
      { type: 'improvement', description: 'Harmonização visual completa na paleta Luxury Matte Stealth Graphite + Dourado Âmbar (#FFB800)' }
    ]
  },
  {
    version: '1.0.31',
    date: '31/10/2026',
    title: 'Central Mercado Livre & Precificação com Margem Real',
    highlights: [
      'Nova Central Mercado Livre com 4 abas estratégicas (Anúncio, Precificação, Embalagem e Kits/Pós-venda)',
      'Simulador automático da Regra dos R$ 79 do Mercado Livre com cálculo exato de frete grátis obrigatório',
      'Cálculo inteligente do Peso Embalado Real somando peça 3D + caixa + plástico bolha'
    ],
    changes: [
      { type: 'new', description: 'Hub de Mercado Livre com seletor de embalagem e sugestão de kit promocional' },
      { type: 'improvement', description: 'Cálculo de margem líquida B2C e B2B considerando custos fixos e taxas reais' },
      { type: 'fix', description: 'Ajuste no recálculo automático de peso ao alternar caixas de envio' }
    ]
  },
  {
    version: '1.0.30',
    date: '28/10/2026',
    title: 'Produtos Multipart & Peças Compostas',
    highlights: [
      'Suporte a produtos compostos por múltiplas partes impressas em filamentos e cores distintas',
      'Cálculo proporcional de tempo de fatiamento e perda por parte',
      'Seleção automática da menor caixa de envio compatível com as dimensões do produto'
    ],
    changes: [
      { type: 'new', description: 'Modal de Produtos Multipart com editor dinâmico de partes e pesagens individuais' },
      { type: 'improvement', description: 'Detecção de cubagem e volume para sugestão automática de embalagens' },
      { type: 'fix', description: 'Sincronização de custos parciais no banco de dados local' }
    ]
  },
  {
    version: '1.0.28',
    date: '20/10/2026',
    title: 'Sincronização Google Sheets em Tempo Real',
    highlights: [
      'Backup e sincronização bidirecional em tempo real com Google Planilhas via GAS',
      'Exportação de relatórios financeiros e catálogo completo'
    ],
    changes: [
      { type: 'new', description: 'Gerador automático de código Google Apps Script (GAS) em Configurações' },
      { type: 'improvement', description: 'Tratamento de reconexão offline e sincronização em lote' }
    ]
  },
  {
    version: '1.0.25',
    date: '10/10/2026',
    title: 'Fila de Impressão & Printer Bridge',
    highlights: [
      'Monitoramento de impressoras 3D OctoPrint e Klipper (Moonraker) via Printer Bridge local',
      'Termômetro 3D com acompanhamento de bico e mesa em tempo real'
    ],
    changes: [
      { type: 'new', description: 'Módulo de Produção com fila de fatiamento e status das impressoras' },
      { type: 'new', description: 'Termômetro visual de aquecimento e consumo elétrico da mesa aquecida' }
    ]
  },
  {
    version: '1.0.0',
    date: '01/09/2026',
    title: 'Lançamento Inicial — Filamento Cust',
    highlights: [
      'Cálculo preciso de custo de filamento por grama e tempo de impressão',
      'Custo de energia elétrica (kWh) e depreciação da máquina por hora',
      'Gestão de estoque de carretéis e clientes com fidelidade CRM'
    ],
    changes: [
      { type: 'new', description: 'Calculadora de Custos Industriais para peças fatiadas em 3D' },
      { type: 'new', description: 'Controle de carretéis de filamento com rastreio de lote e peso restante' },
      { type: 'new', description: 'Gestão de Vendas, Clientes CRM (Ouro, Prata, Bronze) e Livro Caixa' }
    ]
  }
];

