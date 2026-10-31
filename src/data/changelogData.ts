import { ChangelogRelease } from '../types/help';

export const CURRENT_APP_VERSION = '1.0.32';

export const CHANGELOG_DATA: ChangelogRelease[] = [
  {
    version: '1.0.32',
    date: '31/10/2026',
    title: 'Central de Ajuda Integrada & Guia Prático da Oficina 3D',
    isCurrent: true,
    highlights: [
      'Nova Central de Ajuda integrada com tutoriais, regras de negócio e simuladores de cálculo real',
      'Aviso automático de novidades (O Que Há de Novo) ao abrir o aplicativo após cada atualização',
      'Novo botão de acesso rápido à Ajuda na barra superior e no menu lateral com indicador visual',
      'Painel de Filamentos aprimorado com indicador de baixo estoque e cálculo por unidade de 1000g',
      'Visualização do Termômetro 3D otimizada para monitorar capacidade de máquinas e meta mensal'
    ],
    changes: [
      { type: 'new', description: 'Central de Ajuda e Manual Interativo com busca instantânea e guias de impressão 3D, precificação e e-commerce' },
      { type: 'new', description: 'Janela de novidades com resumo dos recursos implementados a cada nova versão' },
      { type: 'improvement', description: 'Visualização mais rápida e limpa do catálogo de filamentos com histórico de compras por vendedor' },
      { type: 'improvement', description: 'Simulador de metas no Termômetro 3D com controle de horas e ocupação de mesa' },
      { type: 'improvement', description: 'Monitoramento da fila de impressoras 3D com histórico de consumo de plástico por trabalho' },
      { type: 'improvement', description: 'Interface mais fluida e responsiva para telas de computador e monitores ultrawide' },
      { type: 'improvement', description: 'Design escuro com paleta âmbar dourada refinada em todas as telas' }
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
      { type: 'improvement', description: 'Interface mais rápida e navegação fluida em telas de qualquer resolução' },
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
