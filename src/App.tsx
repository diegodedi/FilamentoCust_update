import React, { useState, useEffect } from 'react';
import { DbProvider } from './context/DbContext';
import { PrinterProvider } from './context/PrinterContext';
import { Production } from './components/Production';
import { Dashboard } from './components/Dashboard';
import { Thermometer } from './components/Thermometer';
import { Products } from './components/Products';
import { Inventory } from './components/Inventory';
import { Materials } from './components/Materials';
import { Supplies } from './components/Supplies';
import { Costs } from './components/Costs';
import { Sales } from './components/Sales';
import { Customers } from './components/Customers';
import { Finance } from './components/Finance';
import { Settings } from './components/Settings';
import { ProductSearch } from './components/ProductSearch';
import { Sidebar, MENU_ITEMS } from './components/layout/Sidebar';
import { AppNavbar } from './components/layout/AppNavbar';
import { HelpCenterModal } from './components/help/HelpCenterModal';
import { WhatsNewModal } from './components/help/WhatsNewModal';
import { CHANGELOG_DATA, CURRENT_APP_VERSION } from './data/changelogData';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [hasUnreadVersion, setHasUnreadVersion] = useState(false);

  useEffect(() => {
    try {
      const lastSeen = localStorage.getItem('forge_last_seen_version');
      if (lastSeen !== CURRENT_APP_VERSION) {
        setHasUnreadVersion(true);
        setIsWhatsNewOpen(true);
      }
    } catch {
      // storage safely handled
    }
  }, []);

  const handleCloseWhatsNew = () => {
    setIsWhatsNewOpen(false);
    setHasUnreadVersion(false);
    try {
      localStorage.setItem('forge_last_seen_version', CURRENT_APP_VERSION);
    } catch {
      // storage safely handled
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'producao':
        return <Production />;
      case 'dashboard':
        return <Dashboard setView={setActiveView} />;
      case 'termometro':
        return <Thermometer />;
      case 'produtos':
        return <Products />;
      case 'pesquisa-produtos':
        return <ProductSearch />;
      case 'estoque':
        return <Inventory />;
      case 'materiais':
        return <Materials />;
      case 'insumos':
        return <Supplies />;
      case 'custos':
        return <Costs />;
      case 'vendas':
        return <Sales />;
      case 'clientes':
        return <Customers />;
      case 'financeiro':
        return <Finance />;
      case 'configuracoes':
        return <Settings />;
      default:
        return <Dashboard setView={setActiveView} />;
    }
  };

  const currentLabel = MENU_ITEMS.find(item => item.id === activeView)?.label || 'Filamento Cust';

  return (
    <DbProvider>
      <PrinterProvider>
        <div className="min-h-screen bg-[#0F1115] text-[#F8FAFC] flex selection:bg-[#FFB800] selection:text-[#0F1115]">
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onOpenHelp={() => setIsHelpOpen(true)}
            hasUnreadVersion={hasUnreadVersion}
          />

          <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full min-w-0">
            <AppNavbar
              currentLabel={currentLabel}
              onOpenSidebar={() => setSidebarOpen(true)}
              onOpenHelp={() => setIsHelpOpen(true)}
              hasUnreadVersion={hasUnreadVersion}
            />

            <main className="w-full max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 md:py-8 flex-1 min-w-0">
              {renderView()}
            </main>
          </div>

          <HelpCenterModal 
            isOpen={isHelpOpen} 
            onClose={() => setIsHelpOpen(false)} 
          />

          <WhatsNewModal
            isOpen={isWhatsNewOpen}
            onClose={handleCloseWhatsNew}
            onOpenHelp={() => {
              handleCloseWhatsNew();
              setIsHelpOpen(true);
            }}
            latestRelease={CHANGELOG_DATA[0]}
          />
        </div>
      </PrinterProvider>
    </DbProvider>
  );
}
