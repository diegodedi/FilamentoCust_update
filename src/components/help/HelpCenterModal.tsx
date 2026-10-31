import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  History, 
  HelpCircle, 
  ChevronRight,
  Package,
  Layers,
  Percent,
  Printer,
  Users,
  CircleDollarSign,
  ShoppingBag,
  LayoutDashboard
} from 'lucide-react';
import { HELP_CATEGORIES, HELP_TOPICS } from '../../data/documentationData';
import { CHANGELOG_DATA } from '../../data/changelogData';
import { HelpCategoryId, HelpTopic } from '../../types/help';
import { HelpTopicViewer } from './HelpTopicViewer';
import { ChangelogViewer } from './ChangelogViewer';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopicId?: string;
  initialTab?: 'docs' | 'changelog';
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
  initialTopicId,
  initialTab = 'docs'
}) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'changelog'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<HelpCategoryId | 'all'>('all');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(initialTopicId || null);

  // Icon mapping
  const renderCategoryIcon = (iconName: string) => {
    const props = { className: 'w-4 h-4' };
    switch (iconName) {
      case 'Package': return <Package {...props} />;
      case 'Layers': return <Layers {...props} />;
      case 'Percent': return <Percent {...props} />;
      case 'Printer': return <Printer {...props} />;
      case 'Users': return <Users {...props} />;
      case 'CircleDollarSign': return <CircleDollarSign {...props} />;
      case 'ShoppingBag': return <ShoppingBag {...props} />;
      default: return <LayoutDashboard {...props} />;
    }
  };

  // Filter topics based on search and category
  const filteredTopics = useMemo(() => {
    return HELP_TOPICS.filter((topic) => {
      const matchesCategory = selectedCategoryId === 'all' || topic.categoryId === selectedCategoryId;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery = 
        topic.title.toLowerCase().includes(q) ||
        topic.summary.toLowerCase().includes(q) ||
        topic.keywords.some(k => k.toLowerCase().includes(q)) ||
        topic.content.some(c => c.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategoryId]);

  const currentTopic = useMemo(() => {
    return HELP_TOPICS.find(t => t.id === selectedTopicId);
  }, [selectedTopicId]);

  const currentCategory = useMemo(() => {
    return HELP_CATEGORIES.find(c => c.id === currentTopic?.categoryId);
  }, [currentTopic]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#11141A] border border-[#2B303E] rounded-2xl w-full max-w-5xl h-[88vh] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Tabs */}
        <div className="p-4 sm:p-5 bg-[#14171E] border-b border-[#222733] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FFB800] rounded-xl text-[#0F1115] shadow-md shadow-amber-500/20">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Central de Ajuda & Documentação
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Guias, manuais de cálculo, exemplos práticos e histórico de versões do Filamento Cust
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex items-center p-1 bg-[#1A1D25] rounded-xl border border-[#2B303E]">
              <button
                onClick={() => {
                  setActiveTab('docs');
                  setSelectedTopicId(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'docs' 
                    ? 'bg-[#FFB800] text-[#0F1115] font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Manual & Exemplos</span>
              </button>
              <button
                onClick={() => setActiveTab('changelog')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'changelog' 
                    ? 'bg-[#FFB800] text-[#0F1115] font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Novidades & Versões</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1B1E26] transition-colors cursor-pointer"
              aria-label="Fechar Central de Ajuda"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'changelog' ? (
            <ChangelogViewer releases={CHANGELOG_DATA} />
          ) : selectedTopicId && currentTopic ? (
            <HelpTopicViewer
              topic={currentTopic}
              category={currentCategory}
              onBack={() => setSelectedTopicId(null)}
              onSelectTopic={(id) => setSelectedTopicId(id)}
            />
          ) : (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por assunto (ex: regra 79, multipart, caixa de envio, fórmula de custo, margem)..."
                  className="w-full pl-12 pr-4 py-3 bg-[#151922] border border-[#2B303E] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 bg-[#1A1D25] rounded-md"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCategoryId === 'all'
                      ? 'bg-[#FFB800] text-[#0F1115] font-bold'
                      : 'bg-[#151922] text-slate-400 hover:text-slate-200 border border-[#222733]'
                  }`}
                >
                  Todos os Tópicos ({HELP_TOPICS.length})
                </button>
                {HELP_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#FFB800] text-[#0F1115] font-bold'
                          : 'bg-[#151922] text-slate-400 hover:text-slate-200 border border-[#222733]'
                      }`}
                    >
                      {renderCategoryIcon(cat.iconName)}
                      <span>{cat.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Topics Grid */}
              {filteredTopics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredTopics.map((topic) => {
                    const cat = HELP_CATEGORIES.find(c => c.id === topic.categoryId);
                    return (
                      <div
                        key={topic.id}
                        onClick={() => setSelectedTopicId(topic.id)}
                        className="p-4 rounded-xl bg-[#14171E] hover:bg-[#181D26] border border-[#222733] hover:border-amber-500/40 cursor-pointer transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1A1D25] text-slate-400 border border-[#2B303E]">
                              {cat?.title || 'Guia'}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#FFB800] group-hover:translate-x-1 transition-all" />
                          </div>
                          <h3 className="text-sm font-bold text-white group-hover:text-[#FFB800] transition-colors">
                            {topic.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {topic.summary}
                          </p>
                        </div>

                        {topic.practicalExample && (
                          <div className="mt-3 pt-2.5 border-t border-[#222733]/60 flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium">
                            <span>💡 Contém exemplo prático com simulação de cálculo</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center bg-[#14171E] rounded-2xl border border-[#222733] p-6">
                  <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-white">Nenhum tópico encontrado</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Tente buscar por termos mais genéricos como "custo", "embalagem", "filamento" ou selecione outra categoria.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryId('all');
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#1B1E26] text-xs font-semibold text-[#FFB800] border border-[#2B303E] hover:bg-[#252A36] cursor-pointer"
                  >
                    Ver todos os tópicos
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

