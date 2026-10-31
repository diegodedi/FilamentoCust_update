# 🗺️ Filamento Cust — Project Map

## Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, Lucide React
- Theme / UI: Luxury Matte Stealth Graphite + Amber Gold Palette (`#FFB800` / `#FF5E3A` / `#1A1D25`)
- Desktop: Electron 44, Electron Builder
- Sync/Storage: LocalStorage, Google Sheets API (GAS / Direct API), Firebase Auth
- Background Service: Printer Bridge (Express, OctoPrint/Moonraker API)

## Folder Structure
src/
  components/
    dashboard/          → Dashboard subcomponents (DashboardMetrics, DashboardCharts, DashboardAlertsAndTop)
    finance/            → Finance subcomponents (FinanceMetrics, FinanceLedgerTable, FinanceModal)
    costs/              → Costs subcomponents (CostsParameters, CostsSummary)
    sales/              → Sales subcomponents (SalesMetrics, SalesTable, SalesModal)
    inventory/          → Inventory subcomponents (InventoryMetrics, InventoryTable, InventoryExtras)
    products/           → Product modal subcomponents (SingleProductModal, SingleProductFieldsSection, SingleProductMaterialSelector, MultipartPartsEditor, ProductPricingController, AutoPackagingBoxSelector, MlChargesBreakdown, ProductPackagingAndMlSection, ProductFinalPricingCards)
    mercadolivre/       → ML Hub subcomponents (MlListingTab, MlPricingAndSuppliesTab, MlPackagingSelector, MlKitsAndLeadTimeTab, MlShippingAndFlyerTab)
    materials/          → Materials & Spools subcomponents (MaterialCard, MaterialModal, MaterialBrandSelector, MaterialPricingWeightSection, MaterialSellerSidebar, SellerModal)
    thermometer/        → Thermometer subcomponents (ThermometerSidebar, ThermometerModelCard, ThermometerBottomMetrics)
    production/         → Production subcomponents (PrinterCard, PrintJobsHistoryTable, AddPrinterModal)
    search/             → Market Research subcomponents (MarketProductCard, MarketMetricsBanner)
    layout/             → Shell navigation components (Sidebar, AppNavbar)
    help/               → Help Center & Versioning (HelpCenterModal, HelpTopicViewer, ChangelogViewer, WhatsNewModal)
    MercadoLivreModal.tsx → Central Mercado Livre & E-Commerce 3D (4 tabs hub)
    ProductCard.tsx     → Modernized card with amber badge, Kit badge, specs, pricing and ML Hub button
    Customers.tsx       → CRM customer contacts with loyalty badges (Ouro, Prata, Bronze)
    Supplies.tsx        → Supplies & packaging inventory cards
    Products.tsx        → Product catalog with responsive grid
    Materials.tsx       → Spool and filament management (orchestrator)
    Production.tsx      → 3D Printer queue and live status (orchestrator)
    Thermometer.tsx     → Thermal and pricing simulation view (orchestrator)
    ProductSearch.tsx   → Market research and product price checker (orchestrator)
    Settings.tsx        → System settings and Google Sheets sync
  context/              → DbContext (data persistence & sync), PrinterContext
  data/                 → Initial/demo data (initialData.ts), documentationData.ts, changelogData.ts, marketSearchData.ts
  services/             → Printer integration and communication services
  utils/                → Google Sheets sync, GAS code generator, ML template & ML pricing/shipping calculators
  types/                → TypeScript domain interfaces and types (help.ts, types.ts)
printer-bridge/         → Local node service for 3D printer communication

## Routes / Views
Painel Central          → Central dashboard & operational metrics
Produção                → 3D Printer queue and live status
Termômetro 3D           → Printer temperature and state monitor
Produtos                → Product catalog management
Pesquisa de Produtos    → Market research and product price checker
Controle de Estoque     → Inventory control and movements
Filamentos              → Spool inventory and material management
Insumos                 → Additional supplies & components
Calculadora de Custos   → Pricing and production cost calculator
Vendas e Faturamento    → Sales registry, orders and profit analysis
Clientes e CRM          → Customer contacts, CRM categories (Bronze/Prata/Ouro)
Financeiro              → Cash flow, revenue and expense ledger
Configurações           → System settings and Google Sheets sync

## Key Files
src/context/DbContext.tsx         → Central data context, CRUD methods and LocalStorage/Sheets sync
src/index.css                     → Design tokens, brand colors, custom dark scrollbar & theme utilities
src/App.tsx                       → Modular application shell with version check and modals
src/components/layout/Sidebar.tsx → Responsive navigation drawer with Help quick access
src/components/layout/AppNavbar.tsx → Sticky top navbar with status indicator and Help button
src/components/help/HelpCenterModal.tsx → Interactive documentation and knowledge base modal
src/components/help/WhatsNewModal.tsx → Automatic update announcement modal (What's New)
src/data/documentationData.ts     → Comprehensive 3D printing guides and practical calculation examples
src/data/changelogData.ts         → Structured release history and version notes (v1.0.32)
src/utils/mercadoLivrePricing.ts  → Pure calculation engine for ML fees, R$79 shipping, kits and lead time
printer-bridge/electron.js        → Electron main process, window management and on-demand auto-updater flow
package.json                      → Dependencies and Electron build scripts

## Storage Keys (LocalStorage)
forge_products · forge_inventory · forge_materials · forge_customers · forge_sales · forge_financial · forge_config · forge_last_seen_version · 3derp_printers · 3derp_printJobs · @filamento/thermometer

## Last updated: 2026-10-31 (v1.0.32 - Refatoração Modular Completa, Central de Ajuda & Manual Interativo, Controle de Versões e Pop-up WhatsNew)
