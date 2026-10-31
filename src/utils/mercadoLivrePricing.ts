export type MlListingType = 'CLASSICO' | 'PREMIUM';
export type MlReputation = 'VERDE' | 'AMARELA' | 'SEM_REPUTACAO';

export const ML_FREE_SHIPPING_THRESHOLD = 79.0;
export const ML_SAFE_UNDER_THRESHOLD_PRICE = 78.9;
export const ML_FIXED_FEE_UNDER_79 = 6.5;
export const ML_DEFAULT_CLASSICO_RATE = 12.0;
export const ML_DEFAULT_PREMIUM_RATE = 17.0;

export interface MlPricingInput {
  salePrice: number;
  baseProductionCost: number;
  wastePercentage: number;
  packagingCost: number;
  packageWeightGrams: number;
  listingType: MlListingType;
  customCommissionPercent?: number;
  taxPercent: number;
  reputation: MlReputation;
}

export interface MlPricingBreakdown {
  salePrice: number;
  commissionPercent: number;
  commissionValue: number;
  fixedFee: number;
  shippingCost: number;
  taxValue: number;
  productionWithWasteCost: number;
  packagingCost: number;
  totalDeductions: number;
  netPayout: number;
  netProfit: number;
  netMarginPercent: number;
  isFreeShippingMandatory: boolean;
  isInTrapZone: boolean;
  profitAt78_90: number;
  breakEvenAbove79Price: number;
}

export interface KitSimulationRow {
  multiplier: number;
  label: string;
  totalWeightGrams: number;
  productionCost: number;
  packagingCost: number;
  suggestedPrice: number;
  shippingOrFixedFee: number;
  netProfit: number;
  netMarginPercent: number;
  isFreeShipping: boolean;
}

export interface LeadTimeInput {
  unitPrintTimeHours: number;
  unitsPerOrder: number;
  activePrinters: number;
  hoursPerDay: number;
}

export interface LeadTimeResult {
  totalHoursNeeded: number;
  dailyPrinterCapacityHours: number;
  unitsPerDayCapacity: number;
  recommendedMlDays: number;
  recommendationLabel: string;
}

/**
 * Estima o custo de frete obrigatório do Mercado Envios (produtos >= R$ 79)
 * baseado no peso embalado e no desconto de reputação do vendedor.
 */
export function estimateMercadoEnviosShipping(
  weightGrams: number,
  reputation: MlReputation
): number {
  let fullTablePrice = 42.9;
  if (weightGrams <= 300) fullTablePrice = 39.9;
  else if (weightGrams <= 500) fullTablePrice = 42.9;
  else if (weightGrams <= 1000) fullTablePrice = 46.9;
  else if (weightGrams <= 2000) fullTablePrice = 52.9;
  else fullTablePrice = 64.9;

  const discountFactor = reputation === 'VERDE' ? 0.5 : reputation === 'SEM_REPUTACAO' ? 0.6 : 0.75;
  return parseFloat((fullTablePrice * discountFactor).toFixed(2));
}

/**
 * Retorna a taxa percentual de comissão conforme modalidade Clássico ou Premium.
 */
export function getMlCommissionPercent(type: MlListingType, custom?: number): number {
  if (custom !== undefined && custom > 0) return custom;
  return type === 'CLASSICO' ? ML_DEFAULT_CLASSICO_RATE : ML_DEFAULT_PREMIUM_RATE;
}

/**
 * Calcula o demonstrativo financeiro completo de uma venda no Mercado Livre,
 * incluindo detecção da zona de armadilha dos R$ 79,00 (frete grátis obrigatório).
 */
export function calculateMercadoLivreBreakdown(input: MlPricingInput): MlPricingBreakdown {
  const commissionPercent = getMlCommissionPercent(input.listingType, input.customCommissionPercent);
  const isFreeShipping = input.salePrice >= ML_FREE_SHIPPING_THRESHOLD;
  const fixedFee = isFreeShipping ? 0 : ML_FIXED_FEE_UNDER_79;
  const shippingCost = isFreeShipping
    ? estimateMercadoEnviosShipping(input.packageWeightGrams, input.reputation)
    : 0;

  const commissionValue = input.salePrice * (commissionPercent / 100);
  const taxValue = input.salePrice * (input.taxPercent / 100);
  const productionWithWasteCost = input.baseProductionCost * (1 + input.wastePercentage / 100);
  const totalDeductions = commissionValue + fixedFee + shippingCost + taxValue;
  const netPayout = input.salePrice - totalDeductions;
  const netProfit = netPayout - productionWithWasteCost - input.packagingCost;
  const netMarginPercent = input.salePrice > 0 ? (netProfit / input.salePrice) * 100 : 0;

  const profitAt78_90 = computeNetProfitAtPrice(ML_SAFE_UNDER_THRESHOLD_PRICE, input, commissionPercent);
  const netRate = Math.max(0.1, 1 - (commissionPercent + input.taxPercent) / 100);
  const shippingWhen79 = estimateMercadoEnviosShipping(input.packageWeightGrams, input.reputation);
  const breakEvenAbove79Price =
    (profitAt78_90 + productionWithWasteCost + input.packagingCost + shippingWhen79) / netRate;

  return {
    salePrice: input.salePrice,
    commissionPercent,
    commissionValue,
    fixedFee,
    shippingCost,
    taxValue,
    productionWithWasteCost,
    packagingCost: input.packagingCost,
    totalDeductions,
    netPayout,
    netProfit,
    netMarginPercent,
    isFreeShippingMandatory: isFreeShipping,
    isInTrapZone: isFreeShipping && netProfit < profitAt78_90,
    profitAt78_90,
    breakEvenAbove79Price: parseFloat(breakEvenAbove79Price.toFixed(2))
  };
}

function computeNetProfitAtPrice(price: number, input: MlPricingInput, commPercent: number): number {
  const comm = price * (commPercent / 100);
  const tax = price * (input.taxPercent / 100);
  const prodCost = input.baseProductionCost * (1 + input.wastePercentage / 100);
  return price - comm - tax - ML_FIXED_FEE_UNDER_79 - prodCost - input.packagingCost;
}

/**
 * Sugere o preço ideal no Mercado Livre para atingir o lucro alvo desejado,
 * desviando automaticamente da zona de prejuízo entre R$ 79 e R$ 98.
 */
export function calculateSuggestedMlPrice(input: MlPricingInput, targetProfitValue: number): number {
  const commPercent = getMlCommissionPercent(input.listingType, input.customCommissionPercent);
  const prodCost = input.baseProductionCost * (1 + input.wastePercentage / 100);
  const netRate = Math.max(0.15, 1 - (commPercent + input.taxPercent) / 100);

  const candidateUnder79 = (prodCost + input.packagingCost + targetProfitValue + ML_FIXED_FEE_UNDER_79) / netRate;
  if (candidateUnder79 < ML_FREE_SHIPPING_THRESHOLD) {
    return parseFloat(candidateUnder79.toFixed(2));
  }

  const shipping = estimateMercadoEnviosShipping(input.packageWeightGrams, input.reputation);
  const candidateOver79 = (prodCost + input.packagingCost + targetProfitValue + shipping) / netRate;
  return parseFloat(Math.max(ML_FREE_SHIPPING_THRESHOLD, candidateOver79).toFixed(2));
}

/**
 * Calcula o preço unitário B2B para o marketplace, considerando a quantidade mínima do lote
 * e diluindo a taxa fixa ou frete e a embalagem no lote completo.
 */
export function calculateSuggestedB2bPrice(
  input: MlPricingInput,
  minQty: number,
  b2bMarginPercent: number
): { unitPrice: number; batchPrice: number; unitProfit: number; batchProfit: number } {
  const qty = Math.max(1, minQty);
  const prodCost = input.baseProductionCost * (1 + input.wastePercentage / 100);
  const directUnitCost = prodCost + input.packagingCost;
  const batchDirectCost = directUnitCost * qty;
  const batchTargetProfit = batchDirectCost * (b2bMarginPercent / 100);

  const batchWeight = Math.round(input.packageWeightGrams * qty * 0.9);
  const batchPackCost = input.packagingCost * (qty === 1 ? 1 : qty <= 4 ? 1.25 : 1.6);

  const batchInput: MlPricingInput = {
    ...input,
    baseProductionCost: input.baseProductionCost * qty,
    packagingCost: batchPackCost,
    packageWeightGrams: batchWeight
  };

  const batchPrice = calculateSuggestedMlPrice(batchInput, batchTargetProfit);
  const unitPrice = parseFloat((batchPrice / qty).toFixed(2));
  const breakdown = calculateMercadoLivreBreakdown({ ...batchInput, salePrice: batchPrice });
  const batchProfit = parseFloat(breakdown.netProfit.toFixed(2));
  const unitProfit = parseFloat((batchProfit / qty).toFixed(2));

  return { unitPrice, batchPrice, unitProfit, batchProfit };
}

/**
 * Simula combinações de Kits (1x, 2x, 3x, 4x, 10x) mostrando diluição da taxa fixa e frete.
 */
export function simulateProductKits(input: MlPricingInput, unitMarkupPercent: number): KitSimulationRow[] {
  const multipliers = [1, 2, 3, 4, 10];
  return multipliers.map((mult) => {
    const prodCost = input.baseProductionCost * mult * (1 + input.wastePercentage / 100);
    const packCost = input.packagingCost * (mult === 1 ? 1 : mult <= 4 ? 1.25 : 1.8);
    const weight = input.packageWeightGrams * mult;
    const targetProfit = prodCost * (unitMarkupPercent / 100);
    const kitInput: MlPricingInput = {
      ...input,
      baseProductionCost: input.baseProductionCost * mult,
      packagingCost: packCost,
      packageWeightGrams: weight
    };
    const suggestedPrice = calculateSuggestedMlPrice(kitInput, targetProfit);
    const breakdown = calculateMercadoLivreBreakdown({ ...kitInput, salePrice: suggestedPrice });

    return {
      multiplier: mult,
      label: mult === 1 ? '1x Unitário' : `Kit ${mult} Unidades`,
      totalWeightGrams: Math.round(weight),
      productionCost: parseFloat(prodCost.toFixed(2)),
      packagingCost: parseFloat(packCost.toFixed(2)),
      suggestedPrice,
      shippingOrFixedFee: breakdown.isFreeShippingMandatory ? breakdown.shippingCost : breakdown.fixedFee,
      netProfit: parseFloat(breakdown.netProfit.toFixed(2)),
      netMarginPercent: parseFloat(breakdown.netMarginPercent.toFixed(1)),
      isFreeShipping: breakdown.isFreeShippingMandatory
    };
  });
}

/**
 * Calcula a capacidade de produção diária e os dias de disponibilidade de estoque para o ML.
 */
export function calculateLeadTimeCapacity(input: LeadTimeInput): LeadTimeResult {
  const safePrinters = Math.max(1, input.activePrinters);
  const safeHours = Math.max(1, Math.min(24, input.hoursPerDay));
  const totalHoursNeeded = Math.max(0.2, input.unitPrintTimeHours) * Math.max(1, input.unitsPerOrder);
  const dailyCapacityHours = safePrinters * safeHours;
  const unitsPerDay = dailyCapacityHours / Math.max(0.2, input.unitPrintTimeHours);
  const rawDays = Math.ceil((totalHoursNeeded / dailyCapacityHours) + 0.5);
  const recommendedMlDays = totalHoursNeeded <= dailyCapacityHours * 0.6 ? 1 : Math.min(30, rawDays);

  const recommendationLabel =
    recommendedMlDays <= 1
      ? 'Envio Rápido (24h / 1 dia de disponibilidade)'
      : `Configurar ${recommendedMlDays} dias em "Disponibilidade de Estoque"`;

  return {
    totalHoursNeeded: parseFloat(totalHoursNeeded.toFixed(1)),
    dailyPrinterCapacityHours: dailyCapacityHours,
    unitsPerDayCapacity: parseFloat(unitsPerDay.toFixed(1)),
    recommendedMlDays,
    recommendationLabel
  };
}

