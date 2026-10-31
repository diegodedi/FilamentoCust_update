import React from 'react';
import { Menu, BookOpen } from 'lucide-react';

interface AppNavbarProps {
  currentLabel: string;
  onOpenSidebar: () => void;
  onOpenHelp: () => void;
  hasUnreadVersion: boolean;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  currentLabel,
  onOpenSidebar,
  onOpenHelp,
  hasUnreadVersion
}) => {
  return (
    <header className="bg-[#14171E] border-b border-[#222733] h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl bg-[#1B1E26] border border-[#2B303E] hover:border-[#FFB800]/50 text-slate-200 transition-colors cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 truncate">
          <h1 className="font-headline-sm text-white text-sm sm:text-base font-bold truncate">
            {currentLabel}
          </h1>
        </div>
      </div>

      {/* Status Ribbon & Quick Badges */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1B1E26] hover:bg-[#252A36] border border-[#2B303E] hover:border-[#FFB800]/50 rounded-xl text-xs font-semibold text-slate-200 transition-colors cursor-pointer relative"
          title="Abrir Central de Ajuda e Documentação"
        >
          <BookOpen className="w-4 h-4 text-[#FFB800]" />
          <span className="hidden sm:inline">Ajuda & Manual</span>
          {hasUnreadVersion && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFB800] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFB800]"></span>
            </span>
          )}
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#1B1E26] border border-[#2B303E] rounded-full text-[11px] font-mono text-slate-300 font-semibold shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </span>
          <span>ONLINE</span>
        </div>
      </div>
    </header>
  );
};

