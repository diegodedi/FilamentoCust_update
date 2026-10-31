import React from 'react';
import { ChangelogRelease } from '../../types/help';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight 
} from 'lucide-react';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  latestRelease: ChangelogRelease;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  isOpen,
  onClose,
  onOpenHelp,
  latestRelease
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#11141A] border border-amber-500/50 rounded-2xl w-full max-w-xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="p-6 bg-gradient-to-r from-[#1A1D25] to-[#14171E] border-b border-[#222733] flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FFB800] rounded-xl text-[#0F1115] shadow-lg shadow-amber-500/30">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/40 font-bold">
                  Novidades da v{latestRelease.version}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {latestRelease.date}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                {latestRelease.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1B1E26] transition-colors cursor-pointer"
            aria-label="Fechar novidades"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            O <strong>Filamento Cust</strong> foi atualizado com novos recursos e aprimoramentos para tornar a precificação da sua oficina 3D ainda mais rápida e segura:
          </p>

          <div className="space-y-2.5">
            {latestRelease.highlights.map((highlight, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#151922] border border-[#222733] text-xs sm:text-sm text-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
                <span className="leading-snug">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#0E1014] border-t border-[#222733] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenHelp();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1A1D25] border border-[#2B303E] transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#FFB800]" />
            <span>Abrir Central de Ajuda & Manual</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FFB800] hover:bg-[#e6a600] text-[#0F1115] shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <span>Entendi, continuar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

