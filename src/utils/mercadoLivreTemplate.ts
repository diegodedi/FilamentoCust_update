import { Product } from '../types';

export interface ListingOptions {
  dimensions?: string;
  colors?: string;
  customNotes?: string;
  includeFaq?: boolean;
  includeCare?: boolean;
}

export interface MercadoLivreListing {
  title: string;
  description: string;
}

/**
 * Retorna cuidados específicos de conservação com base no filamento
 */
function getMaterialCareInstructions(materialType: string): string {
  const upper = (materialType || 'PLA').toUpperCase();
  if (upper.includes('PETG')) {
    return '• Resistente a impactos e temperaturas moderadas (até ~70°C).\n• Pode ser higienizado com água e sabão neutro.';
  }
  if (upper.includes('ABS') || upper.includes('ASA')) {
    return '• Alta resistência mecânica e a intempéries.\n• Evite contato direto com solventes e acetona.';
  }
  if (upper.includes('TPU')) {
    return '• Material flexível e emborrachado, altíssima durabilidade contra quedas e torções.\n• Lavável com água e sabão neutro.';
  }
  if (upper.includes('RESINA')) {
    return '• Peça com acabamento ultra detalhado.\n• Evite quedas bruscas em superfícies duras e contato com solventes fortes.';
  }
  // Padrão PLA / Geral
  return '• Evite exposição direta e prolongada ao sol intenso ou fontes de calor acima de 55°C (como interior de carros fechados).\n• Para limpeza, use pano macio seco ou levemente umedecido.';
}

/**
 * Gera título otimizado para o algoritmo do Mercado Livre (limite ideal: 60 caracteres)
 */
export function generateMercadoLivreTitle(product: Product): string {
  const material = product.materialType || 'PLA';
  const name = product.name.trim();
  const category = product.category ? product.category.trim() : '';

  // Combinações tentando aproveitar até 60 caracteres
  const fullTitle = `${name} ${category} Impressão 3d ${material}`.replace(/\s+/g, ' ').trim();
  if (fullTitle.length <= 60) return fullTitle;

  const titleNoCategory = `${name} Impressão 3d ${material}`.replace(/\s+/g, ' ').trim();
  if (titleNoCategory.length <= 60) return titleNoCategory;

  const titleSimple = `${name} Impressão 3d`.replace(/\s+/g, ' ').trim();
  if (titleSimple.length <= 60) return titleSimple;

  return name.slice(0, 60);
}

/**
 * Gera a descrição profissional, persuasiva e amigável formatada para o Mercado Livre
 */
export function generateMercadoLivreListing(
  product: Product,
  options: ListingOptions = {}
): MercadoLivreListing {
  const {
    dimensions = '',
    colors = 'Consulte as cores disponíveis no campo de perguntas',
    customNotes = '',
    includeFaq = true,
    includeCare = true
  } = options;

  const title = generateMercadoLivreTitle(product);
  const material = product.materialType || 'PLA';
  const resolvedDimensions = options.dimensions?.trim() || product.dimensions?.trim() || '';

  const lines: string[] = [
    `✨ ${product.name.toUpperCase()} — FABRICAÇÃO EM IMPRESSÃO 3D PREMIUM ✨`,
    '',
    `Procurando uma peça com design moderno, acabamento impecável e alta durabilidade? O ${product.name} é fabricado com tecnologia de ponta em manufatura aditiva 3D, combinando precisão, beleza e resistência para atender às suas necessidades.`,
    '',
    '📦 O QUE ESTÁ INCLUSO NO PACOTE:',
    `• 1x ${product.name}`,
    '',
    '📋 ESPECIFICAÇÕES TÉCNICAS:',
    `• Material: ${material} de Alta Performance`,
    `• Categoria: ${product.category || 'Decoração / Utilidades'}`,
    `• Peso aproximado: ${product.weight}g`,
    resolvedDimensions ? `• Dimensões: ${resolvedDimensions}` : '• Dimensões: Projetado em escala ergonômica ideal',
    `• Cores: ${colors}`,
    '',
    '🌟 CARACTERÍSTICAS & DIFERENCIAIS DA IMPRESSÃO 3D:',
    '• Fabricado através de manufatura aditiva camada por camada.',
    '• Como toda peça impressa em 3D, apresenta linhas características do processo, que são a assinatura autêntica da tecnologia e tornam cada produto exclusivo.',
    '• Estrutura reforçada com excelente densidade interna para máxima firmeza.'
  ];

  if (includeCare) {
    lines.push(
      '',
      '🛡️ CUIDADOS E CONSERVAÇÃO:',
      getMaterialCareInstructions(material)
    );
  }

  if (customNotes.trim()) {
    lines.push(
      '',
      '📝 OBSERVAÇÕES IMPORTANTES:',
      `• ${customNotes.trim()}`
    );
  }

  if (includeFaq) {
    lines.push(
      '',
      '❓ DÚVIDAS FREQUENTES (FAQ):',
      'P: O produto é resistente?',
      'R: Sim! Produzido com preenchimento estrutural reforçado e material de primeira linha.',
      '',
      'P: Vocês fazem em outras cores ou tamanhos?',
      'R: Sim! Somos fabricantes. Deixe sua pergunta abaixo com a cor ou medida desejada.',
      '',
      'P: O envio é seguro?',
      'R: Sim, todas as peças são embaladas individualmente com proteção reforçada para chegar intactas até você.'
    );
  }

  lines.push(
    '',
    '🚀 PRONTA ENTREGA E ENVIO RÁPIDO!',
    'Adicione ao carrinho e garanta o seu hoje mesmo.',
    'Qualquer dúvida, estamos 100% à disposição no campo de perguntas abaixo!'
  );

  return {
    title,
    description: lines.join('\n')
  };
}
