import { HelpCategory, HelpTopic } from '../types/help';

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'geral',
    title: 'Visão Geral & Primeiros Passos',
    shortDescription: 'Como o Filamento Cust organiza sua oficina 3D do fatiamento à entrega.',
    iconName: 'LayoutDashboard'
  },
  {
    id: 'produtos',
    title: 'Produtos & Peças Múltiplas',
    shortDescription: 'Cadastro de peças simples, multipart e dimensões para embalagem.',
    iconName: 'Package'
  },
  {
    id: 'mercadolivre',
    title: 'Central Mercado Livre & E-Commerce',
    shortDescription: 'Regra dos R$ 79, taxas de venda, kits promocionais e peso real da caixa.',
    iconName: 'ShoppingBag'
  },
  {
    id: 'custos-precificacao',
    title: 'Custos Industriais & Precificação',
    shortDescription: 'Fórmula de custo real, energia, depreciação e margens B2C e B2B.',
    iconName: 'Percent'
  },
  {
    id: 'materiais-insumos',
    title: 'Filamentos & Insumos de Embalagem',
    shortDescription: 'Carretéis, perdas de suporte, caixas de papelão e itens adicionais.',
    iconName: 'Layers'
  },
  {
    id: 'producao',
    title: 'Produção & Impressoras 3D',
    shortDescription: 'Integração Klipper / OctoPrint, fila de trabalho e termômetro.',
    iconName: 'Printer'
  },
  {
    id: 'vendas-crm',
    title: 'Vendas, Clientes & CRM',
    shortDescription: 'Gestão de pedidos, canais de venda e fidelidade (Bronze, Prata, Ouro).',
    iconName: 'Users'
  },
  {
    id: 'financeiro-sync',
    title: 'Financeiro & Google Sheets',
    shortDescription: 'Fluxo de caixa, livro razão e sincronização automática em nuvem.',
    iconName: 'CircleDollarSign'
  }
];

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'fluxo-trabalho-oficina',
    categoryId: 'geral',
    title: 'Fluxo de Trabalho Recomendado na Oficina 3D',
    summary: 'A sequência recomendada para cadastrar insumos e precificar produtos sem esquecer nenhum custo oculto.',
    keywords: ['fluxo', 'inicio', 'passo a passo', 'cadastro', 'configurar'],
    steps: [
      '1. Configure sua taxa de energia (R$/kWh) e depreciação da impressora em Configurações.',
      '2. Cadastre seus filamentos ativos com o preço pago por quilo em Filamentos.',
      '3. Cadastre suas caixas e materiais de envio na aba Insumos.',
      '4. Crie seus Produtos informando o peso fatiado e o tempo de impressão.',
      '5. Abra a Central Mercado Livre ou utilize os preços sugeridos B2C/B2B para vender com lucro real.'
    ],
    content: [
      'O Filamento Cust foi desenhado para eliminar o erro comum de cobrar apenas pelo plástico gasto.',
      'Uma impressão consome filamento, mas também deprecia bicos/correias, consome energia elétrica contínua e exige embalagem para transporte.'
    ],
    practicalExample: {
      title: 'Exemplo de Custo Completo de um Suporte Headset',
      scenario: 'Peça de 80g de PLA impressa em 4 horas, utilizando uma caixa de envio P.',
      calculationSteps: [
        'Filamento PLA (R$ 100/kg): 80g = R$ 8,00',
        'Energia (350W em 4h a R$ 0,95/kWh): R$ 1,33',
        'Depreciação de Máquina (R$ 1,50/h): 4h = R$ 6,00',
        'Embalagem (Caixa P + Fita + Bolha): R$ 3,80',
        'Custo de Produção Total: R$ 19,13'
      ],
      result: 'Preço B2C com margem de 100% de lucro: R$ 38,26 (nunca cobre apenas R$ 16!).',
      tip: 'Se você cobrar apenas 2x o filamento (R$ 16), estará pagando para trabalhar.'
    }
  },
  {
    id: 'produtos-multipart-vs-simples',
    categoryId: 'produtos',
    title: 'Produtos Simples vs Multipart (Peças Compostas)',
    summary: 'Quando usar produtos de parte única e quando dividir em partes com cores ou materiais diferentes.',
    keywords: ['multipart', 'partes', 'bicolor', 'cores', 'composto'],
    steps: [
      'Ao criar ou editar um produto, marque a opção "Produto Composto (Multipart)".',
      'Adicione cada componente individual (ex: Base, Tampa, Engrenagem).',
      'Defina o peso em gramas, tempo de impressão e o filamento específico de cada parte.',
      'O sistema soma automaticamente os pesos, tempos e custos individuais.'
    ],
    content: [
      'Produtos simples são aqueles fatiados e impressos de uma só vez em um único material.',
      'Produtos Multipart permitem calcular peças com filamentos diferentes (ex: corpo em PLA Preto e botões em TPU Laranja), mantendo a precisão exata do custo de cada grama.'
    ],
    practicalExample: {
      title: 'Exemplo: Luminária Articulada',
      scenario: 'Composta por Cúpula (40g PETG Branco) e Braço (90g PLA Cinza).',
      calculationSteps: [
        'Parte 1 (Cúpula): 40g de PETG a R$ 120/kg = R$ 4,80 (2h impressão)',
        'Parte 2 (Braço): 90g de PLA a R$ 90/kg = R$ 8,10 (4.5h impressão)'
      ],
      result: 'Peso Total = 130g | Tempo Total = 6.5h | Custo Plástico = R$ 12,90.',
      tip: 'Você também pode vincular parafusos e porcas como Insumos vinculados à montagem!'
    }
  },
  {
    id: 'regra-79-mercado-livre',
    categoryId: 'mercadolivre',
    title: 'A Regra dos R$ 79 do Mercado Livre (Frete Grátis)',
    summary: 'Entenda por que vender por R$ 79,90 pode dar menos lucro do que vender por R$ 78,50 no Mercado Livre.',
    keywords: ['mercado livre', 'regra 79', 'frete gratis', 'taxa fixa', 'comissao'],
    steps: [
      'Abra a Central Mercado Livre no card do produto.',
      'Analise o Simulador de Preço na aba "Precificação & Margem".',
      'Abaixo de R$ 79: você paga comissão percentual + taxa fixa por unidade vendida.',
      'A partir de R$ 79: a taxa fixa desaparece, mas o frete grátis passa a ser descontado do SEU bolso.'
    ],
    content: [
      'No Mercado Livre, anúncios com preço igual ou superior a R$ 79,00 têm frete grátis obrigatório para o comprador.',
      'Esse frete é cobrado do vendedor conforme o peso real ou cubado da encomenda. Por isso, a Central ML alerta visualmente a faixa ideal de preço.'
    ],
    practicalExample: {
      title: 'Comparativo Real de Venda: R$ 78,00 vs R$ 82,00',
      scenario: 'Peça de 350g com embalagem. Custo de produção: R$ 25,00. Anúncio Premium (19%).',
      calculationSteps: [
        'Cenário A (R$ 78,00): Taxa ML (19%) = R$ 14,82 + Taxa Fixa R$ 6,00. Sobra: R$ 57,18. Lucro Líquido: R$ 32,18.',
        'Cenário B (R$ 82,00): Taxa ML (19%) = R$ 15,58 + Frete Obrigatório R$ 24,50. Sobra: R$ 41,92. Lucro Líquido: R$ 16,92!'
      ],
      result: 'No Cenário B você vendeu mais caro, mas lucrou R$ 15,26 A MENOS por causa do frete!',
      tip: 'Dica de ouro: Se for passar de R$ 79, aumente para no mínimo R$ 99 ou R$ 109 para cobrir o frete e manter o lucro.'
    }
  },
  {
    id: 'peso-embalado-inteligente',
    categoryId: 'mercadolivre',
    title: 'Peso Embalado Real e Dimensões de Envio',
    summary: 'Como o peso da caixa e o plástico bolha alteram a faixa de frete dos Correios e transportadoras.',
    keywords: ['peso', 'caixa', 'embalagem', 'frete', 'cubagem'],
    steps: [
      'Na Central Mercado Livre, acesse a aba "Embalagem & Caixa".',
      'O Filamento Cust lista suas caixas cadastradas no estoque de Insumos.',
      'O sistema compara o tamanho da peça com as dimensões internas da caixa.',
      'O peso da caixa é somado automaticamente ao peso do produto para o cálculo do frete.'
    ],
    content: [
      'Transportadoras e o Mercado Envios cobram por faixas de peso (ex: até 300g, 300g a 500g, 500g a 1kg).',
      'Uma peça de 280g colocada em uma caixa de papelão de 80g passa para 360g, subindo para a próxima faixa de frete.'
    ],
    practicalExample: {
      title: 'Evitando a virada de faixa de frete',
      scenario: 'Action Figure de 270g fatiada.',
      calculationSteps: [
        'Com caixa pesada (120g): 390g (Faixa de frete até 500g).',
        'Com caixa otimizada (40g): 310g.',
        'Ao otimizar preenchimento (infill) para 240g + caixa 40g = 280g (Faixa mais barata até 300g!).'
      ],
      result: 'Economia média de R$ 4 a R$ 8 por envio apenas ajustando a caixa.',
      tip: 'Sempre cadastre o peso real de suas caixas e fitas na aba Insumos.'
    }
  },
  {
    id: 'formula-custo-industrial',
    categoryId: 'custos-precificacao',
    title: 'A Fórmula do Custo Real na Impressão 3D',
    summary: 'Entenda os quatro componentes essenciais da precificação industrial.',
    keywords: ['formula', 'custo hora', 'depreciacao', 'energia', 'kwh', 'markup'],
    steps: [
      'Custo Filamento = (Peso em Gramas * Preço do Quilo) / 1000.',
      'Custo Elétrico = (Potência da Máquina em Watts / 1000) * Horas * Tarifa kWh.',
      'Custo Depreciação = Horas de Impressão * Valor Depreciação por Hora.',
      'Custo Total = Filamento + Energia + Depreciação + Insumos de Embalagem.'
    ],
    content: [
      'O Filamento Cust calcula em tempo real o custo de base por peça.',
      'A partir do Custo Total, o sistema aplica os markups de B2C (venda direta final), B2B (pedidos em lote com quantidade mínima) e Marketplace (comissão + taxa).'
    ],
    practicalExample: {
      title: 'Tabela de Margem Sugerida',
      scenario: 'Estratégia saudável para oficinas e gráficas 3D.',
      calculationSteps: [
        'Venda Direta / Balcão (B2C): Margem de 80% a 150% sobre o custo total.',
        'Atacado / B2B (mínimo 10 peças): Margem de 40% a 60% com ganho no volume.',
        'E-commerce / Marketplaces: Custo Total + Comissões + Taxas de Frete + 50% de lucro líquido.'
      ],
      result: 'Garante capital de giro para reposição de peças da impressora e expansão da fazenda 3D.'
    }
  },
  {
    id: 'crm-clientes-fidelidade',
    categoryId: 'vendas-crm',
    title: 'Fidelidade CRM: Bronze, Prata e Ouro',
    summary: 'Como categorizar seus clientes para aplicar descontos estratégicos e aumentar a recompra.',
    keywords: ['crm', 'fidelidade', 'ouro', 'prata', 'bronze', 'desconto'],
    steps: [
      'Cadastre seus clientes com WhatsApp e endereço para entrega.',
      'O sistema categoriza automaticamente conforme o volume de compras:',
      '• Bronze: Novos clientes ou compradores pontuais.',
      '• Prata: Clientes recorrentes com pedidos mensais.',
      '• Ouro: Clientes VIP e parceiros B2B com alto faturamento.'
    ],
    content: [
      'Clientes Ouro justificam a aplicação de preços de tabela B2B mesmo em lotes menores.',
      'Você pode exportar a lista de clientes para disparar promoções e avisos de lançamentos pelo WhatsApp.'
    ]
  },
  {
    id: 'backup-google-sheets',
    categoryId: 'financeiro-sync',
    title: 'Backup e Sincronização com Google Planilhas',
    summary: 'Como manter todos os seus dados seguros na nuvem em tempo real sem custo de servidor.',
    keywords: ['google sheets', 'gas', 'planilha', 'backup', 'nuvem', 'sincronizacao'],
    steps: [
      '1. Acesse o menu Configurações > Sincronização Google Sheets.',
      '2. Clique em "Copiar Código GAS" para obter o script de integração.',
      '3. Crie uma nova planilha no Google Sheets e vá em Extensões > Apps Script.',
      '4. Cole o código e clique em Implantar > Nova Implantação (Aplicativo da Web).',
      '5. Cole a URL gerada no Filamento Cust e ative a Sincronização Automática.'
    ],
    content: [
      'Seus dados ficam gravados localmente no seu computador com performance instantânea e sincronizados em nuvem com a sua própria planilha pessoal do Google Drive.'
    ]
  }
];

