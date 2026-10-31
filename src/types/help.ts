export type HelpCategoryId = 
  | 'geral'
  | 'produtos'
  | 'mercadolivre'
  | 'materiais-insumos'
  | 'custos-precificacao'
  | 'producao'
  | 'vendas-crm'
  | 'financeiro-sync';

export interface HelpCategory {
  id: HelpCategoryId;
  title: string;
  shortDescription: string;
  iconName: string;
}

export interface HelpPracticalExample {
  title: string;
  scenario: string;
  calculationSteps?: string[];
  result: string;
  tip?: string;
}

export interface HelpTopic {
  id: string;
  categoryId: HelpCategoryId;
  title: string;
  summary: string;
  keywords: string[];
  steps?: string[];
  content: string[];
  practicalExample?: HelpPracticalExample;
  alerts?: string[];
  relatedTopicIds?: string[];
}

export type ChangeType = 'new' | 'improvement' | 'fix';

export interface ChangelogItem {
  type: ChangeType;
  description: string;
}

export interface ChangelogRelease {
  version: string;
  date: string;
  title: string;
  isCurrent?: boolean;
  highlights: string[];
  changes: ChangelogItem[];
}

