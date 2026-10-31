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
    MercadoLivreModal.tsx → Central Mercado Livre & E-Commerce 3D (4 tabs hub)
    ProductCard.tsx     → Modernized card with amber badge, Kit badge, specs, pricing and ML Hub button
    Customers.tsx       → CRM customer contacts with loyalty badges (Ouro, Prata, Bronze)
    Supplies.tsx        → Supplies & packaging inventory cards
    Products.tsx        → Product catalog with responsive grid
    Materials.tsx       → Spool and filament management
    Production.tsx      → 3D Printer queue and live status
    Thermometer.tsx     → Thermal and pricing simulation view
    ProductSearch.tsx   → Market research and product price checker
    Settings.tsx        → System settings and Google Sheets sync
  context/              → DbContext (data persistence & sync), PrinterContext
  data/                 → Initial/demo data (initialData.ts)
  services/             → Printer integration and communication services
  utils/                → Google Sheets sync, GAS code generator, ML template & ML pricing/shipping calculators
  types.ts              → TypeScript domain interfaces and types
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
src/App.tsx                       → Responsive layout, mobile drawer, top navbar, wide container
src/components/ProductCard.tsx    → Product card component with material badge, specs, pricing and ML Hub button
src/components/MercadoLivreModal.tsx → Central Mercado Livre (Anúncio, Regra R$79, Embalagem, Kits e Pós-Venda)
src/utils/mercadoLivrePricing.ts  → Pure calculation engine for ML fees, R$79 shipping, kits and lead time
printer-bridge/electron.js        → Electron main process, window management and on-demand auto-updater flow
package.json                      → Dependencies and Electron build scripts

## Storage Keys (LocalStorage)
forge_products · forge_inventory · forge_materials · forge_customers · forge_sales · forge_financial · forge_config · 3derp_printers · 3derp_printJobs

## Last updated: 2026-10-31 (v1.0.31 - Central Mercado Livre, Precificação B2C/B2B com Margem Líquida Real, Peso Embalado Inteligente e Refatoração Modular GOLDCODE v3.0)
