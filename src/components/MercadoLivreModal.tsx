import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { generateMercadoLivreListing } from '../utils/mercadoLivreTemplate';
import { X, Copy, Check, Sparkles, ExternalLink, Info, SlidersHorizontal } from 'lucide-react';

interface MercadoLivreModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const MercadoLivreModal: React.FC<MercadoLivreModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [dimensions, setDimensions] = useState('');
  const [colors, setColors] = useState('Preto, Branco (ou consulte outras cores)');
  const [customNotes, setCustomNotes] = useState('');
  const [includeFaq, setIncludeFaq] = useState(true);
  const [includeCare, setIncludeCare] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  const [copiedType, setCopiedType] = useState<'title' | 'desc' | 'all' | null>(null);

  const generated = useMemo(() => {
    if (!product) return { title: '', description: '' };
    return generateMercadoLivreListing(product, {
      dimensions,
      colors,
      customNotes,
      includeFaq,
      includeCare
    });
  }, [product, dimensions, colors, customNotes, includeFaq, includeCare]);

  const [editableTitle, setEditableTitle] = useState('');
  const [editableDesc, setEditableDesc] = useState('');

  // Atualiza as dimensões e os campos editáveis sempre que o produto mudar ou abrir
  React.useEffect(() => {
    if (product) {
      setDimensions(product.dimensions || '');
      setEditableTitle(generated.title);
      setEditableDesc(generated.description);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleCopy = async (text: string, type: 'title' | 'desc' | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      alert('Não foi possível copiar automaticamente. Selecione o texto e use Ctrl+C.');
    }
  };

  const titleLength = editableTitle.length;
  const isTitleOver = titleLength > 60;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-2xl shadow-2xl w-full max-w-3xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Mercado Livre */}
        <div className="px-6 py-4 bg-[#FFE600] text-[#121418] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#121418] text-[#FFE600] flex items-center justify-center font-black text-lg shadow-sm">
              ML
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight text-slate-900 flex items-center gap-1.5">
                Folha de Anúncio — Mercado Livre
                <Sparkles className="w-4 h-4 text-amber-700" />
              </h2>
              <p className="text-xs text-slate-800 font-medium">
                {product.name} • {product.materialType || 'PLA'} • {product.weight}g
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-800 hover:bg-black/10 rounded-full transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback visual de copiado */}
        {copiedType && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-6 py-2.5 flex items-center justify-between text-emerald-400 text-xs font-bold animate-fadeIn">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              {copiedType === 'desc' && 'Descrição completa copiada! Pronto para colar no Mercado Livre.'}
              {copiedType === 'title' && 'Título copiado com sucesso!'}
              {copiedType === 'all' && 'Título + Descrição copiados para a área de transferência!'}
            </span>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
              1-Clique
            </span>
          </div>
        )}

        {/* Corpo do Modal */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-200">
          
          {/* Seção do Título */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                Título do Anúncio (SEO)
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${isTitleOver ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-slate-800 text-slate-400'}`}>
                  {titleLength}/60 caracteres {isTitleOver ? '(excedeu 60)' : ''}
                </span>
              </label>
              <button
                type="button"
                onClick={() => handleCopy(editableTitle, 'title')}
                className="text-xs font-bold text-[#FFE600] hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                {copiedType === 'title' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copiar Título
              </button>
            </div>
            <input
              type="text"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[#FFE600] focus:ring-1 focus:ring-[#FFE600] outline-none transition-all"
              placeholder="Título chamativo no Mercado Livre..."
            />
          </div>

          {/* Toggle de Personalização Adicional */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 font-medium transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0084FF]" />
              {showOptions ? 'Ocultar ajustes de dimensões e cores' : 'Ajustar medidas, cores e observações antes de copiar'}
            </button>

            {showOptions && (
              <div className="mt-3 p-4 bg-[#121418] border border-[#2B2F36] rounded-xl space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Medidas / Dimensões (ex: 15cm x 10cm x 8cm)
                    </label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="Ex: 12cm Altura x 8cm Largura"
                      className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#0084FF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Cores Disponíveis
                    </label>
                    <input
                      type="text"
                      value={colors}
                      onChange={(e) => setColors(e.target.value)}
                      placeholder="Ex: Preto, Branco, Cinza, Azul..."
                      className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#0084FF] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Observação adicional da peça (opcional)
                  </label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Ex: Acompanha fita dupla face para fixação..."
                    className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#0084FF] outline-none"
                  />
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCare}
                      onChange={(e) => setIncludeCare(e.target.checked)}
                      className="rounded border-[#2B2F36] bg-[#1C1F24] text-[#0084FF] focus:ring-0"
                    />
                    Cuidados do {product.materialType || 'PLA'}
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeFaq}
                      onChange={(e) => setIncludeFaq(e.target.checked)}
                      className="rounded border-[#2B2F36] bg-[#1C1F24] text-[#0084FF] focus:ring-0"
                    />
                    Perguntas Frequentes (FAQ)
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Seção da Descrição */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                Descrição Pronta para o Mercado Livre (Texto Puro Otimizado)
              </label>
              <span className="text-[11px] text-slate-400">
                Você pode editar livremente abaixo
              </span>
            </div>
            <textarea
              rows={11}
              value={editableDesc}
              onChange={(e) => setEditableDesc(e.target.value)}
              className="w-full bg-[#121418] border border-[#2B2F36] rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:border-[#FFE600] outline-none resize-none transition-all"
            />
          </div>

          {/* Dica Rápida de Conversão */}
          <div className="bg-[#121418] border border-[#2B2F36] rounded-lg p-3 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-[#FFE600] shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-200">Dica de Vendas:</strong> O Mercado Livre não aceita formatação HTML. Este texto já está formatado com quebras e marcadores ideais, além de proteger você contra devoluções ao esclarecer com transparência as marcas naturais de camada da impressão 3D!
            </p>
          </div>
        </div>

        {/* Rodapé com Botão de 1 Clique */}
        <div className="px-6 py-4 bg-[#121418] border-t border-[#2B2F36] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Preço Sugerido: <strong className="text-[#22C55E] font-mono">R$ {(product.marketplacePrice || product.b2cPrice || product.sellPrice).toFixed(2)}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(`${editableTitle}\n\n${editableDesc}`, 'all')}
              className="px-3.5 py-2.5 bg-[#1C1F24] hover:bg-[#2B2F36] text-slate-300 border border-[#2B2F36] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar Tudo
            </button>

            <button
              type="button"
              onClick={() => handleCopy(editableDesc, 'desc')}
              className="px-5 py-2.5 bg-[#FFE600] hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              {copiedType === 'desc' ? (
                <>
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>Copiar Descrição (1 Clique)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
