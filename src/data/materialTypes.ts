/**
 * Lista dos tipos de materiais de impressão 3D mais utilizados no mercado.
 */
export const COMMON_3D_MATERIALS = [
  'PLA',
  'PLA+',
  'PLA Silk',
  'PETG',
  'ABS',
  'ASA',
  'TPU / Flex',
  'Resina Standard',
  'Resina ABS-Like',
  'Nylon (PA)',
  'PC (Policarbonato)',
  'HIPS',
  'PVA (Solúvel)',
  'Fibra de Carbono (CF)',
  'PETG-CF',
  'PLA-CF',
  'Outro'
] as const;

export type Common3DMaterial = typeof COMMON_3D_MATERIALS[number];

export const DEFAULT_MATERIAL_TYPE = 'PLA';
