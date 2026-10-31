import React, { useState } from 'react';
import { SlidersHorizontal, ShieldCheck, HelpCircle, Info } from 'lucide-react';
import { MlPricingBreakdown, MlReputation } from '../../utils/mercadoLivrePricing';

interface MlChargesBreakdownProps {
  marketplacePlatform: string;
  setMarketplacePlatform: (p: string) => void;
  salePrice: number;
  breakdown: MlPricingBreakdown;
  packagingCost: number;
  packageWeight?: number;
  wastePercentage: number;
  setWastePercentage: (val: number) => void;
  taxPercent: number;
  setTaxPercent: (val: number) => void;
  reputation: MlReputation;
  setReputation: (r: MlReputation) => void;
}

/**
 * Painel de regras e deduções do Marketplace (Mercado Livre)
 * aplicadas diretamente na precificação de venda B2C/B2B.
 */
export const MlChargesBreakdown: React.FC<MlChargesBreakdownProps> = ({
  marketplacePlatform,
  setMarketplacePlatform,
  salePrice,
  breakdown,
  packagingCost,
  packageWeight,
  wastePercentage,
  setWastePercentage,
  taxPercent,
  setTaxPercent,
  reputation,
  setReputation
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showRuleInfo, setShowRuleInfo] = useState(false);

  const isFreeShipping = salePrice >= 79;
  const reputationLabel =
    reputation === 'VERDE'
      ? 'Verde / MercadoLíder (50% desc.)'
      : reputation === 'SEM_REPUTACAO'
      ? 'Conta Inicial (40% desc.)'
      : 'Amarela (25% desc.)';

  return (
    <div className="p-4 bg-[#14171E] border border-[#2B303E] rounded-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-[#FFE600] text-slate-950 flex items-center justify-center font-black text-[10px]">
            ML
          </span>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Encargos & Regras Mercado Livre (Somados no Preço Final)
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setShowRuleInfo(!showRuleInfo)}
          className="text-[11px] text-[#FFE600] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showRuleInfo ? 'Ocultar Regra dos R$ 79' : 'Como funciona a Regra dos R$ 79?'}</span>
        </button>
      </div>

      {/* Explicação da Regra dos R$ 79 do Mercado Livre */}
      {showRuleInfo && (
        <div className="p-3 bg-[#1C1F24] border border-amber-500/30 rounded-lg text-xs space-y-2 text-slate-300">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Info className="w-4 h-4 shrink-0" />
            <span>Como o Mercado Livre cobra taxas e frete por faixa de preço:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-[#14171E] rounded border border-[#2B303E]">
              <strong className="text-amber-300 block mb-1">Vendas abaixo de R$ 79,00:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                <li>Taxa fixa: <strong className="text-white">R$ 6,50</strong> por unidade.</li>
                <li>Frete: <strong className="text-emerald-400">R$ 0,00</strong> para o vendedor (pago pelo comprador).</li>
                <li>Comissão: 12% Clássico ou 17% Premium.</li>
              </ul>
            </div>
            <div className="p-2 bg-[#14171E] rounded border border-[#2B303E]">
              <strong className="text-emerald-400 block mb-1">Vendas a partir de R$ 79,00:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                <li>Taxa fixa de R$ 6,50: <strong className="text-emerald-400">ISENTA (R$ 0,00)</strong>.</li>
                <li>Frete Mercado Envios: <strong className="text-rose-400">Obrigatório pelo Vendedor</strong>.</li>
                <li>Valor do frete varia por peso (ex: até 300g = R$ 19,95 na Reputação Verde).</li>
              </ul>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic">
            Armadilha dos R$ 79: Se vender a R$ 80 em vez de R$ 78,90, você deixa de pagar R$ 6,50 mas passa a pagar R$ 19,95+ de frete. O app calcula isso automaticamente para proteger seu lucro!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            Modalidade de Anúncio
          </label>
          <select
            value={marketplacePlatform}
            onChange={(e) => setMarketplacePlatform(e.target.value)}
            className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#FFE600]"
          >
            <option value="Mercado Livre Clássico (11.5% + R$6)">Mercado Livre Clássico (12% comissão)</option>
            <option value="Mercado Livre Premium (16.5% + R$6)">Mercado Livre Premium (17% comissão sem juros)</option>
            <option value="Nenhum">Desativar Marketplace</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            Sua Reputação no ML
          </label>
          <select
            value={reputation}
            onChange={(e) => setReputation(e.target.value as MlReputation)}
            className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#FFE600]"
          >
            <option value="VERDE">Verde / MercadoLíder (50% desc. frete)</option>
            <option value="SEM_REPUTACAO">Conta Inicial (40% desc. frete)</option>
            <option value="AMARELA">Amarela (25% desc. frete)</option>
          </select>
        </div>

        <div className="bg-[#1C1F24] p-2 rounded-lg border border-[#2B303E] text-center">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Regra de Envio Ativa</span>
          {isFreeShipping ? (
            <div>
              <span className="text-xs font-bold text-emerald-400 block">
                Frete Grátis: R$ {breakdown.shippingCost.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-400 block">Taxa fixa R$ 6,50 ISENTA (≥ R$ 79)</span>
            </div>
          ) : (
            <div>
              <span className="text-xs font-bold text-amber-300 block">
                Taxa Fixa: R$ 6,50 (&lt; R$ 79)
              </span>
              <span className="text-[9px] text-slate-400 block">Frete pago pelo Comprador</span>
            </div>
          )}
        </div>
      </div>

      {/* Demonstrativo de Encargos para 1 unidade vendida ao Preço B2C */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
        <div className="bg-[#1C1F24] p-2 rounded border border-[#2B303E]">
          <span className="text-[9px] text-slate-400 block uppercase">
            Comissão ({breakdown.commissionPercent}%) + {breakdown.isFreeShippingMandatory ? 'Frete' : 'Taxa Fixa'}
          </span>
          <span className="text-rose-400 font-bold">
            - R$ {(breakdown.commissionValue + breakdown.fixedFee + breakdown.shippingCost).toFixed(2)}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {breakdown.isFreeShippingMandatory
              ? `Comissão R$ ${breakdown.commissionValue.toFixed(2)} + Frete R$ ${breakdown.shippingCost.toFixed(2)}`
              : `Comissão R$ ${breakdown.commissionValue.toFixed(2)} + Taxa R$ 6,50`}
          </span>
        </div>
        <div className="bg-[#1C1F24] p-2 rounded border border-[#2B303E]">
          <span className="text-[9px] text-slate-400 block uppercase">Peça + {wastePercentage}% Perda</span>
          <span className="text-slate-200 font-bold">- R$ {breakdown.productionWithWasteCost.toFixed(2)}</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Impressão 3D</span>
        </div>
        <div className="bg-[#1C1F24] p-2 rounded border border-[#2B303E]">
          <span className="text-[9px] text-slate-400 block uppercase">Embalagem</span>
          <span className="text-slate-200 font-bold">- R$ {packagingCost.toFixed(2)}</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Caixa / Insumos</span>
        </div>
        <div className="bg-[#1C1F24] p-2 rounded border border-[#2B2F36]">
          <span className="text-[9px] text-slate-400 block uppercase">Imposto NF ({taxPercent}%)</span>
          <span className="text-slate-200 font-bold">- R$ {breakdown.taxValue.toFixed(2)}</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Tributação</span>
        </div>
      </div>

      {/* Parâmetros Editáveis (Avançado) */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[11px] text-slate-400 hover:text-[#FFB800] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'Ocultar Parâmetros Avançados ▲' : 'Personalizar Imposto & Perda 3D (Avançado) ▼'}</span>
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#1C1F24] rounded-lg mt-2 border border-[#2B303E]">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Imposto NF (%)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={taxPercent}
                onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value)))}
                className="w-full bg-[#14171E] border border-[#2B303E] rounded px-2.5 py-1.5 text-xs text-white font-mono outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Margem Perda 3D (%)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={wastePercentage}
                onChange={(e) => setWastePercentage(Math.max(0, Number(e.target.value)))}
                className="w-full bg-[#14171E] border border-[#2B2F36] rounded px-2.5 py-1.5 text-xs text-white font-mono outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
