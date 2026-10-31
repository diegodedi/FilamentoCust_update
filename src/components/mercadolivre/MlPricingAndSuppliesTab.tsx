import React, { useState, useMemo } from 'react';
import { AlertTriangle, Check, Save, Calculator } from 'lucide-react';
import { Product, ProductPackagingItem } from '../../types';
import { useDb } from '../../context/DbContext';
import { MlPackagingSelector } from './MlPackagingSelector';
import {
  MlListingType,
  MlReputation,
  ML_SAFE_UNDER_THRESHOLD_PRICE,
  calculateMercadoLivreBreakdown,
  calculateSuggestedMlPrice
} from '../../utils/mercadoLivrePricing';

interface MlPricingAndSuppliesTabProps {
  product: Product;
  onProductUpdated: (updated: Product) => void;
}

/**
 * Aba de precificação real do Mercado Livre (Regra R$ 79, Impostos, Perda 3D e Insumos de Embalagem).
 */
export const MlPricingAndSuppliesTab: React.FC<MlPricingAndSuppliesTabProps> = ({
  product,
  onProductUpdated
}) => {
  const { supplies, updateProduct } = useDb();

  const [wastePercent, setWastePercent] = useState<number>(product.wastePercentage ?? 5);
  const [packItems, setPackItems] = useState<ProductPackagingItem[]>(
    product.packagingItems && product.packagingItems.length > 0 ? product.packagingItems : []
  );
  const [listingType, setListingType] = useState<MlListingType>(product.mlListingType || 'CLASSICO');
  const [reputation, setReputation] = useState<MlReputation>(product.mlReputation || 'VERDE');
  const [taxPercent, setTaxPercent] = useState<number>(product.mlTaxPercent ?? 4);
  const [salePrice, setSalePrice] = useState<number>(
    product.marketplacePrice || Number(((product.b2cPrice || product.sellPrice) + 8).toFixed(2))
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const calculatedPackagingCost = useMemo(() => {
    if (packItems.length === 0) return product.packagingCost ?? 0;
    return packItems.reduce((sum, item) => {
      const sup = supplies.find((s) => s.id === item.supplyId);
      const unitVal = sup ? Number(sup.unitPrice) || 0 : 0;
      return sum + unitVal * item.quantity;
    }, 0);
  }, [packItems, supplies, product.packagingCost]);

  const packageWeightGrams = product.packageWeight || Math.round(product.weight + 80);

  const pricingInput = useMemo(
    () => ({
      salePrice,
      baseProductionCost: product.costPrice,
      wastePercentage: wastePercent,
      packagingCost: calculatedPackagingCost,
      packageWeightGrams,
      listingType,
      taxPercent,
      reputation
    }),
    [salePrice, product.costPrice, wastePercent, calculatedPackagingCost, packageWeightGrams, listingType, taxPercent, reputation]
  );

  const breakdown = useMemo(() => calculateMercadoLivreBreakdown(pricingInput), [pricingInput]);

  const handleApplyRecommendedPrice = () => {
    const targetB2CProfit = Math.max(5, (product.b2cPrice || product.sellPrice) - product.costPrice);
    const ideal = calculateSuggestedMlPrice(pricingInput, targetB2CProfit);
    setSalePrice(ideal);
  };

  const handleSaveToProduct = () => {
    const platformLabel =
      listingType === 'CLASSICO'
        ? 'Mercado Livre Clássico (11.5% + R$6)'
        : 'Mercado Livre Premium (16.5% + R$6)';

    const updated: Product = {
      ...product,
      wastePercentage: wastePercent,
      packagingItems: packItems,
      packagingCost: parseFloat(calculatedPackagingCost.toFixed(2)),
      marketplacePlatform: platformLabel,
      marketplacePrice: parseFloat(salePrice.toFixed(2)),
      marketplacePriceOverride: parseFloat(salePrice.toFixed(2)),
      mlListingType: listingType,
      mlReputation: reputation,
      mlTaxPercent: taxPercent,
      mlShippingCost: breakdown.shippingCost,
      mlNetProfit: parseFloat(breakdown.netProfit.toFixed(2))
    };

    updateProduct(product.id, updated);
    onProductUpdated(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-4">
      <MlPackagingSelector
        supplies={supplies}
        wastePercent={wastePercent}
        setWastePercent={setWastePercent}
        packItems={packItems}
        setPackItems={setPackItems}
      />

      {/* Seção 2: Simulador Real de Taxas + Gatilho R$ 79 */}
      <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-[#FFE600]" />
            2. Simulador Real Mercado Livre (Gatilho R$ 79 & Impostos)
          </h3>
          <button
            type="button"
            onClick={handleApplyRecommendedPrice}
            className="text-[11px] bg-[#FFE600]/15 hover:bg-[#FFE600]/25 text-[#FFE600] border border-[#FFE600]/30 px-2.5 py-1 rounded-lg font-bold cursor-pointer"
          >
            Sugerir Preço Ideal p/ Lucro B2C
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Modalidade ML</label>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value as MlListingType)}
              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-2.5 py-2 text-xs text-white outline-none focus:border-[#FFE600]"
            >
              <option value="CLASSICO">Clássico (12%)</option>
              <option value="PREMIUM">Premium Sem Juros (17%)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Reputação (Frete)</label>
            <select
              value={reputation}
              onChange={(e) => setReputation(e.target.value as MlReputation)}
              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-2.5 py-2 text-xs text-white outline-none focus:border-[#FFE600]"
            >
              <option value="VERDE">Verde / Líder (50% desc.)</option>
              <option value="SEM_REPUTACAO">Conta Inicial (40% desc.)</option>
              <option value="AMARELA">Amarela (25% desc.)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Imposto NF (%)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={taxPercent}
              onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-2.5 py-2 text-xs text-white font-mono outline-none focus:border-[#FFE600]"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#FFE600] uppercase font-bold block mb-1">Preço no ML (R$)</label>
            <input
              type="number"
              min="1"
              step="0.10"
              value={salePrice}
              onChange={(e) => setSalePrice(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#1C1F24] border border-[#FFE600] rounded-lg px-2.5 py-2 text-sm text-[#FFE600] font-mono font-extrabold outline-none"
            />
          </div>
        </div>

        {/* Alerta Inteligente da Virada dos R$ 79,00 */}
        {breakdown.isInTrapZone && (
          <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3 space-y-2">
            <div className="flex items-start gap-2 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Alerta da Zona de Frete Grátis (R$ 79,00+):</strong> Ao anunciar por{' '}
                <strong>R$ {salePrice.toFixed(2)}</strong>, você paga{' '}
                <strong>R$ {breakdown.shippingCost.toFixed(2)}</strong> de frete obrigatório e sobra apenas{' '}
                <strong>R$ {breakdown.netProfit.toFixed(2)}</strong>. Se vender a{' '}
                <strong>R$ {ML_SAFE_UNDER_THRESHOLD_PRICE.toFixed(2)}</strong>, seu lucro líquido sobe para{' '}
                <strong>R$ {breakdown.profitAt78_90.toFixed(2)}</strong>!
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-6">
              <button
                type="button"
                onClick={() => setSalePrice(ML_SAFE_UNDER_THRESHOLD_PRICE)}
                className="px-3 py-1 bg-[#FFE600] text-slate-950 rounded-lg text-[11px] font-extrabold cursor-pointer"
              >
                Fixar em R$ 78,90 (Lucro R$ {breakdown.profitAt78_90.toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => setSalePrice(breakdown.breakEvenAbove79Price)}
                className="px-3 py-1 bg-[#1C1F24] text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold cursor-pointer"
              >
                Subir p/ R$ {breakdown.breakEvenAbove79Price.toFixed(2)} (Compensar Frete)
              </button>
            </div>
          </div>
        )}

        {/* Raio-X do Repasse */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-[#1C1F24] p-2.5 rounded-lg border border-[#2B2F36]">
            <span className="text-[10px] text-slate-400 block">Comissão + Taxa/Frete</span>
            <span className="text-rose-400 font-bold">
              - R$ {(breakdown.commissionValue + breakdown.fixedFee + breakdown.shippingCost).toFixed(2)}
            </span>
          </div>
          <div className="bg-[#1C1F24] p-2.5 rounded-lg border border-[#2B2F36]">
            <span className="text-[10px] text-slate-400 block">Peça + {wastePercent}% Perda</span>
            <span className="text-slate-200 font-bold">- R$ {breakdown.productionWithWasteCost.toFixed(2)}</span>
          </div>
          <div className="bg-[#1C1F24] p-2.5 rounded-lg border border-[#2B2F36]">
            <span className="text-[10px] text-slate-400 block">Embalagem + Imposto</span>
            <span className="text-slate-200 font-bold">
              - R$ {(breakdown.packagingCost + breakdown.taxValue).toFixed(2)}
            </span>
          </div>
          <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/30">
            <span className="text-[10px] text-emerald-300 block">Lucro Líquido Real</span>
            <span className={`font-extrabold ${breakdown.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              R$ {breakdown.netProfit.toFixed(2)} ({breakdown.netMarginPercent.toFixed(0)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#2B2F36]">
          <span className="text-[11px] text-slate-400">
            {breakdown.isFreeShippingMandatory
              ? `Frete Grátis Obrigatório incluso: R$ ${breakdown.shippingCost.toFixed(2)}`
              : `Taxa fixa ML abaixo de R$ 79 inclusa: R$ ${breakdown.fixedFee.toFixed(2)}`}
          </span>
          <button
            type="button"
            onClick={handleSaveToProduct}
            className="px-4 py-2 bg-[#FFE600] hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Salvo no Produto!' : 'Salvar Preço & Embalagem no Produto'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
