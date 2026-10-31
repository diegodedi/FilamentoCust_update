import React from 'react';
import { RotateCcw, DollarSign, Store, Building2, AlertTriangle } from 'lucide-react';

interface ProductFinalPricingCardsProps {
  baseCost: number;
  productionCost: number;
  packagingCost: number;
  b2cMargin: number;
  setB2cMargin: (val: number) => void;
  b2cPriceOverride: number | null;
  setB2cPriceOverride: (val: number | null) => void;
  currentB2C: number;
  suggestedB2C: number;
  b2cProfit: number;
  b2cNetMarginPercent: number;
  b2bMargin: number;
  setB2bMargin: (val: number) => void;
  b2bMinQty: number;
  setB2bMinQty: (val: number) => void;
  b2bPriceOverride: number | null;
  setB2bPriceOverride: (val: number | null) => void;
  currentB2B: number;
  suggestedB2B: number;
  b2bUnitProfit: number;
  b2bBatchProfit: number;
  isInTrapZone?: boolean;
  profitAt78_90?: number;
  breakEvenAbove79Price?: number;
  shippingCost?: number;
  onFixPriceAt78_90?: () => void;
  onBumpPriceAbove79?: () => void;
}

/**
 * Cartões finais de precificação de venda no Marketplace (B2C e B2B),
 * somando automaticamente produção, embalagem, taxas do Mercado Livre e impostos.
 */
export const ProductFinalPricingCards: React.FC<ProductFinalPricingCardsProps> = ({
  baseCost,
  productionCost,
  packagingCost,
  b2cMargin,
  setB2cMargin,
  b2cPriceOverride,
  setB2cPriceOverride,
  currentB2C,
  suggestedB2C,
  b2cProfit,
  b2cNetMarginPercent,
  b2bMargin,
  setB2bMargin,
  b2bMinQty,
  setB2bMinQty,
  b2bPriceOverride,
  setB2bPriceOverride,
  currentB2B,
  suggestedB2B,
  b2bUnitProfit,
  b2bBatchProfit,
  isInTrapZone,
  profitAt78_90,
  breakEvenAbove79Price,
  shippingCost,
  onFixPriceAt78_90,
  onBumpPriceAbove79
}) => {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Preços Finais de Venda no Marketplace
          </h4>
        </div>
        <div className="text-[11px] font-mono bg-[#14171E] border border-[#2B303E] px-2.5 py-1 rounded-lg text-slate-300">
          Custo Base: Peça (<strong className="text-white">R$ {productionCost.toFixed(2)}</strong>) + Embalagem (
          <strong className="text-emerald-400">R$ {packagingCost.toFixed(2)}</strong>) ={' '}
          <strong className="text-[#FFB800]">R$ {baseCost.toFixed(2)}</strong>
        </div>
      </div>

      {/* Alerta de Frete Grátis Obrigatório (Faixa de Armadilha dos R$ 79+) */}
      {isInTrapZone && (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3 space-y-2">
          <div className="flex items-start gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Atenção: Faixa de Frete Grátis Obrigatório (R$ 79+).</strong> Ao vender no B2C por{' '}
              <strong>R$ {currentB2C.toFixed(2)}</strong>, o frete obrigatório de{' '}
              <strong>R$ {Number(shippingCost).toFixed(2)}</strong> reduziu seu lucro líquido para{' '}
              <strong>R$ {b2cProfit.toFixed(2)}</strong>.
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pl-6">
            {onFixPriceAt78_90 && profitAt78_90 !== undefined && (
              <button
                type="button"
                onClick={onFixPriceAt78_90}
                className="px-3 py-1 bg-[#FFE600] text-slate-950 rounded-lg text-[11px] font-extrabold cursor-pointer"
              >
                Fixar B2C em R$ 78,90 (Lucro R$ {profitAt78_90.toFixed(2)})
              </button>
            )}
            {onBumpPriceAbove79 && breakEvenAbove79Price !== undefined && (
              <button
                type="button"
                onClick={onBumpPriceAbove79}
                className="px-3 py-1 bg-[#1C1F24] text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold cursor-pointer"
              >
                Subir B2C para R$ {breakEvenAbove79Price.toFixed(2)} (Absorver Frete)
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card B2C - Consumidor Final no Marketplace */}
        <div className="bg-[#121418] border border-emerald-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#22C55E]" />
              <h5 className="text-xs font-bold text-[#22C55E] uppercase">B2C — Consumidor Final (Marketplace)</h5>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              Lucro Líq: R$ {b2cProfit.toFixed(2)} ({b2cNetMarginPercent.toFixed(0)}%)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Margem de Lucro (%)
              </label>
              <input
                type="number"
                min="0"
                value={b2cMargin}
                onChange={(e) => {
                  setB2cMargin(Math.max(0, Number(e.target.value)));
                  setB2cPriceOverride(null);
                }}
                className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-2 text-xs text-white focus:border-[#22C55E] outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-[#22C55E] uppercase font-bold block">
                  Preço Final B2C (R$)
                </label>
                {b2cPriceOverride !== null && (
                  <button
                    type="button"
                    onClick={() => setB2cPriceOverride(null)}
                    className="text-[10px] text-[#22C55E] hover:underline flex items-center gap-0.5 cursor-pointer"
                    title="Restaurar padrão sugerido"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Sugerido
                  </button>
                )}
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={b2cPriceOverride !== null ? b2cPriceOverride : parseFloat(suggestedB2C.toFixed(2))}
                onChange={(e) =>
                  setB2cPriceOverride(e.target.value === '' ? null : Math.max(0, Number(e.target.value)))
                }
                className="w-full bg-[#1C1F24] border border-[#22C55E] rounded-lg px-3 py-1.5 text-sm text-[#22C55E] font-mono font-extrabold focus:ring-1 focus:ring-[#22C55E] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card B2B - Empresas e Atacado no Marketplace */}
        <div className="bg-[#121418] border border-blue-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0084FF]" />
              <h5 className="text-xs font-bold text-[#0084FF] uppercase">B2B — Para Empresas (Marketplace)</h5>
            </div>
            <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
              Lucro: R$ {b2bUnitProfit.toFixed(2)}/un • Lote: R$ {b2bBatchProfit.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 items-end">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Margem (%)
              </label>
              <input
                type="number"
                min="0"
                value={b2bMargin}
                onChange={(e) => {
                  setB2bMargin(Math.max(0, Number(e.target.value)));
                  setB2bPriceOverride(null);
                }}
                className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-2.5 py-2 text-xs text-white focus:border-[#0084FF] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Qtd Mín.
              </label>
              <input
                type="number"
                min="1"
                value={b2bMinQty}
                onChange={(e) => {
                  setB2bMinQty(Math.max(1, Number(e.target.value)));
                  setB2bPriceOverride(null);
                }}
                className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-2.5 py-2 text-xs text-white focus:border-[#0084FF] outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-[#0084FF] uppercase font-bold block">
                  Preço Un. (R$)
                </label>
                {b2bPriceOverride !== null && (
                  <button
                    type="button"
                    onClick={() => setB2bPriceOverride(null)}
                    className="text-[10px] text-[#0084FF] hover:underline flex items-center gap-0.5 cursor-pointer"
                    title="Restaurar padrão sugerido"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Sugerido
                  </button>
                )}
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={b2bPriceOverride !== null ? b2bPriceOverride : parseFloat(suggestedB2B.toFixed(2))}
                onChange={(e) =>
                  setB2bPriceOverride(e.target.value === '' ? null : Math.max(0, Number(e.target.value)))
                }
                className="w-full bg-[#1C1F24] border border-[#0084FF] rounded-lg px-2.5 py-1.5 text-sm text-[#0084FF] font-mono font-extrabold focus:ring-1 focus:ring-[#0084FF] outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
