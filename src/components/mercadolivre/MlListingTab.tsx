import React, { useState, useMemo, useEffect } from 'react';
import { Copy, Check, Info, SlidersHorizontal } from 'lucide-react';
import { Product } from '../../types';
import { generateMercadoLivreListing } from '../../utils/mercadoLivreTemplate';

interface MlListingTabProps {
  product: Product;
}

/**
 * Aba de geração e cópia de Título SEO (60 chars) e Descrição Texto Puro para o Mercado Livre.
 */
export const MlListingTab: React.FC<MlListingTabProps> = ({ product }) => {
  const [dimensions, setDimensions] = useState(product.dimensions || '');
  const [colors, setColors] = useState('Preto, Branco (ou consulte outras cores)');
  const [customNotes, setCustomNotes] = useState('');
  const [includeFaq, setIncludeFaq] = useState(true);
  const [includeCare, setIncludeCare] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [copiedType, setCopiedType] = useState<'title' | 'desc' | 'all' | null>(null);

  const generated = useMemo(() => {
    return generateMercadoLivreListing(product, {
      dimensions,
      colors,
      customNotes,
      includeFaq,
      includeCare
    });
  }, [product, dimensions, colors, customNotes, includeFaq, includeCare]);

  const [editableTitle, setEditableTitle] = useState(generated.title);
  const [editableDesc, setEditableDesc] = useState(generated.description);

  useEffect(() => {
    setDimensions(product.dimensions || '');
  }, [product]);

  useEffect(() => {
    setEditableTitle(generated.title);
    setEditableDesc(generated.description);
  }, [generated.title, generated.description]);

  const handleCopy = async (text: string, type: 'title' | 'desc' | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Fallback silencioso caso o navegador bloqueie área de transferência
    }
  };

  const titleLength = editableTitle.length;
  const isTitleOver = titleLength > 60;

  return (
    <div className="space-y-4">
      {copiedType && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2 text-emerald-400 text-xs font-bold">
          <Check className="w-4 h-4 shrink-0" />
          <span>
            {copiedType === 'desc' && 'Descrição completa copiada! Pronto para colar no Mercado Livre.'}
            {copiedType === 'title' && 'Título otimizado copiado com sucesso!'}
            {copiedType === 'all' && 'Título + Descrição copiados para a área de transferência!'}
          </span>
        </div>
      )}

      {/* Seção do Título SEO */}
      <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Título Sugerido (SEO Mercado Livre)
          </label>
          <span className={`text-[11px] font-mono font-bold ${isTitleOver ? 'text-rose-400' : 'text-emerald-400'}`}>
            {titleLength}/60 caracteres
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={editableTitle}
            onChange={(e) => setEditableTitle(e.target.value)}
            className="flex-1 bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3.5 py-2 text-sm text-white font-medium focus:border-[#FFE600] outline-none"
          />
          <button
            type="button"
            onClick={() => handleCopy(editableTitle, 'title')}
            className="px-4 py-2 bg-[#1C1F24] hover:bg-[#2B2F36] text-slate-200 border border-[#2B2F36] rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {copiedType === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copiar Título</span>
          </button>
        </div>
      </div>

      {/* Personalização Rápida */}
      <div className="bg-[#121418] border border-[#2B2F36] rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-[#1C1F24] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#FFE600]" />
            Personalizar Detalhes do Anúncio (Medidas, Cores, Observações)
          </span>
          <span className="text-[#FFE600] text-[11px]">{showOptions ? 'Ocultar ▲' : 'Expandir ▼'}</span>
        </button>

        {showOptions && (
          <div className="p-4 border-t border-[#2B2F36] space-y-3 bg-[#161920]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Dimensões da Peça</label>
                <input
                  type="text"
                  placeholder="Ex: 15cm x 8cm x 5cm"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#FFE600]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Cores Disponíveis</label>
                <input
                  type="text"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#FFE600]"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Observação Extra no Anúncio</label>
              <input
                type="text"
                placeholder="Ex: Acompanha fita dupla face 3M / Parafusos inclusos..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#FFE600]"
              />
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCare}
                  onChange={(e) => setIncludeCare(e.target.checked)}
                  className="rounded border-[#2B2F36] bg-[#1C1F24]"
                />
                Incluir Cuidados com o Material ({product.materialType || 'PLA'})
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFaq}
                  onChange={(e) => setIncludeFaq(e.target.checked)}
                  className="rounded border-[#2B2F36] bg-[#1C1F24]"
                />
                Incluir Perguntas Frequentes (FAQ)
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Descrição */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-300">
            Descrição Pronta para o Mercado Livre (Texto Puro Otimizado)
          </label>
          <span className="text-[11px] text-slate-400">Editável livremente abaixo</span>
        </div>
        <textarea
          rows={10}
          value={editableDesc}
          onChange={(e) => setEditableDesc(e.target.value)}
          className="w-full bg-[#121418] border border-[#2B2F36] rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:border-[#FFE600] outline-none resize-none"
        />
      </div>

      {/* Rodapé de Ações */}
      <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Info className="w-4 h-4 text-[#FFE600] shrink-0" />
          <span>Protege contra devoluções explicando as camadas naturais da impressão 3D.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopy(`${editableTitle}\n\n${editableDesc}`, 'all')}
            className="px-3.5 py-2 bg-[#1C1F24] hover:bg-[#2B2F36] text-slate-300 border border-[#2B2F36] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" /> Copiar Tudo
          </button>
          <button
            type="button"
            onClick={() => handleCopy(editableDesc, 'desc')}
            className="px-4 py-2 bg-[#FFE600] hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" /> Copiar Descrição (1 Clique)
          </button>
        </div>
      </div>
    </div>
  );
};

