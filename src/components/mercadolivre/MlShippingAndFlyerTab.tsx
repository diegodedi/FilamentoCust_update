import React, { useState } from 'react';
import { Box, Printer, Save, Check, HeartHandshake } from 'lucide-react';
import { Product } from '../../types';
import { useDb } from '../../context/DbContext';
import { getMaterialCareInstructions } from '../../utils/mercadoLivreTemplate';

interface MlShippingAndFlyerTabProps {
  product: Product;
  onProductUpdated: (updated: Product) => void;
}

/**
 * Aba de Ficha Técnica de Envio (Mercado Envios) e Gerador de Cartão Pós-Venda Imprimível.
 */
export const MlShippingAndFlyerTab: React.FC<MlShippingAndFlyerTabProps> = ({
  product,
  onProductUpdated
}) => {
  const { updateProduct } = useDb();

  const [boxDimensions, setBoxDimensions] = useState<string>(product.packageDimensions || '16 x 11 x 6 cm');
  const [emptyBoxWeight, setEmptyBoxWeight] = useState<number>(
    product.packageWeight ? Math.max(10, product.packageWeight - product.weight) : 80
  );
  const [storeName, setStoreName] = useState<string>('Estúdio 3D Forge');
  const [supportContact, setSupportContact] = useState<string>(
    'Dúvidas? Envie mensagem no chat da sua compra antes de abrir reclamação!'
  );
  const [savedShipping, setSavedShipping] = useState(false);

  const totalPackagedWeight = Math.round(product.weight + emptyBoxWeight);
  const materialType = product.materialType || 'PLA';
  const careText = getMaterialCareInstructions(materialType);

  const handleSaveShippingSpecs = () => {
    const updated: Product = {
      ...product,
      packageDimensions: boxDimensions.trim(),
      packageWeight: totalPackagedWeight
    };
    updateProduct(product.id, updated);
    onProductUpdated(updated);
    setSavedShipping(true);
    setTimeout(() => setSavedShipping(false), 2500);
  };

  const handlePrintFlyers = () => {
    const printWin = window.open('', '_blank', 'width=850,height=700');
    if (!printWin) return;

    const cardHtml = `
      <div class="card">
        <div class="header">✨ OBRIGADO PELA SUA COMPRA! ✨</div>
        <div class="store">${storeName} — Manufatura Aditiva 3D</div>
        <div class="product">Peça: <strong>${product.name}</strong> • Material: <strong>${materialType}</strong></div>
        <div class="section-title">SOBRE A SUA PEÇA EM IMPRESSÃO 3D:</div>
        <p>Sua peça foi fabricada camada por camada com tecnologia de precisão. As sutis linhas na superfície são a assinatura autêntica da impressão 3D!</p>
        <div class="section-title">CUIDADOS DE CONSERVAÇÃO (${materialType}):</div>
        <pre class="care">${careText}</pre>
        <div class="footer">🤝 ${supportContact}</div>
      </div>
    `;

    printWin.document.write(`
      <html>
        <head>
          <title>Cartões Pós-Venda - ${product.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 16px; color: #111; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .card { border: 2px dashed #444; border-radius: 12px; padding: 16px; box-sizing: border-box; page-break-inside: avoid; }
            .header { font-weight: 900; font-size: 14px; text-align: center; background: #FFE600; padding: 6px; border-radius: 6px; }
            .store { text-align: center; font-size: 11px; color: #555; margin-top: 4px; font-weight: bold; }
            .product { font-size: 12px; margin: 10px 0; padding: 6px; background: #f4f4f4; border-radius: 6px; text-align: center; }
            .section-title { font-size: 11px; font-weight: bold; margin-top: 8px; color: #222; text-transform: uppercase; }
            p, .care { font-size: 11px; line-height: 1.4; margin: 4px 0; white-space: pre-wrap; font-family: Arial, sans-serif; }
            .footer { margin-top: 10px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 11px; font-weight: bold; text-align: center; }
          </style>
        </head>
        <body>
          <div class="grid">${cardHtml}${cardHtml}${cardHtml}${cardHtml}</div>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="space-y-4">
      {/* Seção 1: Medidas e Peso do Pacote para Mercado Envios */}
      <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-1.5">
            <Box className="w-4 h-4" />
            1. Ficha de Pacote Embalado (Exigido pelo Mercado Envios)
          </h3>
          <span className="text-[11px] text-slate-400">Etiqueta de Envio</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Dimensões da Caixa (C x L x A)
            </label>
            <input
              type="text"
              placeholder="Ex: 16 x 11 x 6 cm"
              value={boxDimensions}
              onChange={(e) => setBoxDimensions(e.target.value)}
              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#FFE600]"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Peso Caixa + Proteção (g)
            </label>
            <input
              type="number"
              min="10"
              value={emptyBoxWeight}
              onChange={(e) => setEmptyBoxWeight(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-[#FFE600]"
            />
          </div>
          <div>
            <label className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">
              Peso Total Embalado (Peça + Caixa)
            </label>
            <div className="w-full bg-[#1C1F24] border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono font-bold">
              {totalPackagedWeight}g ({product.weight}g + {emptyBoxWeight}g)
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveShippingSpecs}
            className="px-3.5 py-1.5 bg-[#252A37] hover:bg-[#FFE600] text-slate-200 hover:text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {savedShipping ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedShipping ? 'Medidas Salvas!' : 'Salvar Medidas de Envio'}</span>
          </button>
        </div>
      </div>

      {/* Seção 2: Cartão Pós-Venda e Instruções de Cuidados (Imprimível) */}
      <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-[#FFE600]" />
              2. Cartão de Agradecimento & Cuidados 3D (Evita Reclamações no ML)
            </h3>
            <p className="text-[11px] text-slate-400">
              Imprima 4 cartões por folha A4 para colocar dentro da caixa junto com o produto.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePrintFlyers}
            className="px-4 py-2 bg-[#FFE600] hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir 4 Cartões (A4)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Nome da sua Loja</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#FFE600]"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Mensagem Anti-Reclamação</label>
            <input
              type="text"
              value={supportContact}
              onChange={(e) => setSupportContact(e.target.value)}
              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#FFE600]"
            />
          </div>
        </div>

        {/* Preview do Cartão */}
        <div className="bg-[#1C1F24] border-2 border-dashed border-[#383F50] rounded-xl p-4 space-y-2 text-xs">
          <div className="bg-[#FFE600] text-slate-950 font-black text-center py-1 rounded text-xs">
            ✨ OBRIGADO PELA SUA COMPRA! — {storeName.toUpperCase()} ✨
          </div>
          <div className="text-slate-300 text-center text-[11px]">
            Produto: <strong className="text-white">{product.name}</strong> • Material:{' '}
            <strong className="text-[#FFE600]">{materialType}</strong>
          </div>
          <div className="text-[11px] text-slate-300 bg-[#121418] p-2.5 rounded-lg border border-[#2B2F36] whitespace-pre-line">
            <strong className="text-[#FFE600] block mb-1">CUIDADOS COM SUA PEÇA 3D ({materialType}):</strong>
            {careText}
          </div>
          <div className="text-[11px] text-emerald-400 font-bold text-center pt-1">
            🤝 {supportContact}
          </div>
        </div>
      </div>
    </div>
  );
};

