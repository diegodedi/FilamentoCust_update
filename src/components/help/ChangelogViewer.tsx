import React from 'react';
import { ChangelogRelease, ChangeType } from '../../types/help';
import { 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Wrench, 
  Bug, 
  Tag 
} from 'lucide-react';

interface ChangelogViewerProps {
  releases: ChangelogRelease[];
}

export const ChangelogViewer: React.FC<ChangelogViewerProps> = ({ releases }) => {
  const renderBadge = (type: ChangeType) => {
    switch (type) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3 h-3" /> NOVO
          </span>
        );
      case 'improvement':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Wrench className="w-3 h-3" /> MELHORIA
          </span>
        );
      case 'fix':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Bug className="w-3 h-3" /> CORREÇÃO
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#222733]">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#FFB800]" />
          Histórico de Versões & Novidades
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Acompanhe a evolução contínua do Filamento Cust e os novos recursos lançados a cada atualização.
        </p>
      </div>

      <div className="space-y-6">
        {releases.map((release) => (
          <div 
            key={release.version}
            className={`rounded-2xl p-5 border transition-all ${
              release.isCurrent 
                ? 'bg-[#151922] border-amber-500/40 shadow-xl shadow-amber-500/5' 
                : 'bg-[#11141A] border-[#222733]'
            }`}
          >
            {/* Version Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#222733]">
              <div className="flex items-center gap-2.5">
                <span className="text-sm sm:text-base font-extrabold font-mono px-3 py-1 rounded-xl bg-[#FFB800] text-[#0F1115] shadow-sm">
                  v{release.version}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {release.title}
                </h3>
                {release.isCurrent && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-[#FFB800] border border-amber-500/40">
                    Versão Atual
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{release.date}</span>
              </div>
            </div>

            {/* Highlights */}
            {release.highlights && release.highlights.length > 0 && (
              <div className="mt-4 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Principais Destaques:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {release.highlights.map((highlight, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-[#0E1014] border border-[#222733] text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB800] shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Changes */}
            <div className="mt-4 pt-4 border-t border-[#222733]/60 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Registro Detalhado de Alterações:
              </span>
              <div className="space-y-1.5">
                {release.changes.map((change, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-300"
                  >
                    <div className="shrink-0 mt-0.5">{renderBadge(change.type)}</div>
                    <span className="leading-relaxed">{change.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

