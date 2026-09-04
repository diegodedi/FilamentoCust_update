import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, InventoryItem, Material, Customer, Sale, FinancialLog, CostConfig, SyncConfig, Printer, PrintJob, Seller, Supply } from '../types';
import {
  initialMaterials,
  initialProducts,
  initialInventory,
  initialCustomers,
  initialSales,
  initialFinancialLogs,
  initialCostConfig,
  initialSupplies
} from '../data/initialData';
import {
  googleSignIn,
  logoutGoogle as googleLogoutApi,
  getAccessToken,
  initAuth,
  listSpreadsheets,
  createERPSpreadsheet,
  pushDataToSpreadsheet,
  pullDataFromSpreadsheet,
  DriveSpreadsheet
} from '../utils/googleSheets';
import { User } from 'firebase/auth';

interface DbContextType {
  products: Product[];
  inventory: InventoryItem[];
  materials: Material[];
  customers: Customer[];
  sales: Sale[];
  financialLogs: FinancialLog[];
  costConfig: CostConfig;
  syncConfig: SyncConfig;
  printers: Printer[];
  printJobs: PrintJob[];
  sellers: Seller[];
  supplies: Supply[];
  
  // Supplies API
  addSupply: (s: Omit<Supply, 'id'>) => void;
  updateSupply: (id: string, s: Supply) => void;
  deleteSupply: (id: string) => void;
  
  addSeller: (s: Omit<Seller, 'id'>) => void;
  updateSeller: (id: string, s: Seller) => void;
  deleteSeller: (id: string) => void;
  
  addPrinter: (p: Omit<Printer, 'id'>) => void;
  updatePrinter: (id: string, p: Printer) => void;
  deletePrinter: (id: string) => void;
  
  addPrintJob: (job: Omit<PrintJob, 'id' | 'createdAt'>) => string;
  updatePrintJob: (id: string, updates: Partial<PrintJob>) => void;
  updateMaterialWeight: (materialId: string, decrementWeight: number) => void;
  
  // Products API
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, p: Product) => void;
  deleteProduct: (id: string) => void;
  
  // Inventory API
  registerMovement: (productId: string, type: 'IN' | 'OUT', qty: number) => boolean;
  registerPartMovement: (productId: string, partId: string, type: 'IN' | 'OUT', qty: number) => boolean;
  updateInventoryItem: (id: string, item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  
  // Materials API
  addMaterial: (m: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, m: Material) => void;
  deleteMaterial: (id: string) => void;
  
  // Customers API
  addCustomer: (c: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, c: Customer) => void;
  deleteCustomer: (id: string) => void;
  
  // Sales API
  addSale: (s: Omit<Sale, 'id'>) => void;
  updateSale: (id: string, s: Sale) => void;
  deleteSale: (id: string) => void;
  
  // Financials API
  addFinancialLog: (f: Omit<FinancialLog, 'id'>) => void;
  updateFinancialLog: (id: string, f: FinancialLog) => void;
  deleteFinancialLog: (id: string) => void;
  
  // Config API
  updateCostConfig: (c: CostConfig) => void;
  
  // Google Sheets Sync
  updateSyncConfig: (cfg: SyncConfig) => void;
  syncWithGoogleSheets: (gasUrl: string) => Promise<{ success: boolean; message: string }>;
  isSyncing: boolean;

  // Direct Google Sheets API Sync
  googleUser: User | null;
  googleToken: string | null;
  signInWithGoogle: () => Promise<boolean>;
  logoutGoogle: () => Promise<void>;
  createAndLinkSheet: (title?: string) => Promise<string | null>;
  listDirectSheets: () => Promise<DriveSpreadsheet[]>;
  syncDirect: (spreadsheetId: string, spreadsheetName: string, action: 'pull' | 'push' | 'sync') => Promise<{ success: boolean; message: string }>;
}

const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [financialLogs, setFinancialLogs] = useState<FinancialLog[]>([]);
  const [costConfig, setCostConfig] = useState<CostConfig>(initialCostConfig);
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({ mode: 'local', gasUrl: '', connected: false });
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>(initialSupplies);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  // Direct Google Sheets Auth States
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Sync Google Auth on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem('forge_sellers', JSON.stringify(sellers));
  }, [sellers, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem('forge_supplies', JSON.stringify(supplies));
  }, [supplies, loaded]);

  // Load initial data
  useEffect(() => {
    const localProducts = localStorage.getItem('forge_products');
    const localInventory = localStorage.getItem('forge_inventory');
    const localMaterials = localStorage.getItem('forge_materials');
    const localCustomers = localStorage.getItem('forge_customers');
    const localSales = localStorage.getItem('forge_sales');
    const localFinancial = localStorage.getItem('forge_financial');
    const localConfig = localStorage.getItem('forge_config');
    const localSync = localStorage.getItem('forge_sync');
    const localSellers = localStorage.getItem('forge_sellers');
    const localSupplies = localStorage.getItem('forge_supplies');

    if (localProducts) setProducts(JSON.parse(localProducts));
    else setProducts([]); 

    if (localInventory) setInventory(JSON.parse(localInventory));
    else setInventory([]);

    if (localMaterials) setMaterials(JSON.parse(localMaterials));
    else setMaterials([]);

    if (localCustomers) setCustomers(JSON.parse(localCustomers));
    else setCustomers([]);

    if (localSales) setSales(JSON.parse(localSales));
    else setSales([]);

    if (localFinancial) setFinancialLogs(JSON.parse(localFinancial));
    else setFinancialLogs([]);

    if (localSellers) setSellers(JSON.parse(localSellers));
    else setSellers([]);

    if (localSupplies) setSupplies(JSON.parse(localSupplies));

    setLoaded(true);

    if (localConfig) setCostConfig(JSON.parse(localConfig));
    else setCostConfig(initialCostConfig);

    if (localSync) setSyncConfig(JSON.parse(localSync));
    const localPrinters = localStorage.getItem('3derp_printers');
    if (localPrinters) setPrinters(JSON.parse(localPrinters));
    const localPrintJobs = localStorage.getItem('3derp_printJobs');
    if (localPrintJobs) setPrintJobs(JSON.parse(localPrintJobs));
  }, []);

  // Save changes to localStorage helper
  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Autocommit/sync trigger to GAS or direct Google Sheets API if configured
  const commitToGasIfEnabled = async (updatedData: {
    products?: Product[];
    inventory?: InventoryItem[];
    materials?: Material[];
    sales?: Sale[];
    customers?: Customer[];
    financial?: FinancialLog[];
    config?: CostConfig;
  }) => {
    if (syncConfig.mode === 'gas' && syncConfig.gasUrl) {
      try {
        const payload = {
          action: 'sync',
          data: {
            products: updatedData.products || products,
            inventory: updatedData.inventory || inventory,
            materials: updatedData.materials || materials,
            sales: updatedData.sales || sales,
            customers: updatedData.customers || customers,
            financial: updatedData.financial || financialLogs,
            config: updatedData.config || costConfig,
            printJobs: printJobs
          }
        };
        await fetch(syncConfig.gasUrl, {
          method: 'POST',
          mode: 'no-cors', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn("GAS background sync error (expected if URL is offline):", err);
      }
    } else if (syncConfig.mode === 'direct' && syncConfig.spreadsheetId) {
      const token = googleToken || getAccessToken();
      if (token) {
        try {
          await pushDataToSpreadsheet(token, syncConfig.spreadsheetId, {
            products: updatedData.products || products,
            inventory: updatedData.inventory || inventory,
            materials: updatedData.materials || materials,
            sales: updatedData.sales || sales,
            customers: updatedData.customers || customers,
            financialLogs: updatedData.financial || financialLogs,
            printJobs,
            costConfig: updatedData.config || costConfig
          });
        } catch (err) {
          console.warn("Direct Google Sheets background sync error:", err);
        }
      }
    }
  };

  // --- SUPPLIES ---
  const addSupply = (s: Omit<Supply, 'id'>) => {
    const newSupply = { ...s, id: `sup-${Date.now()}` };
    setSupplies(prev => [...prev, newSupply]);
  };

  const updateSupply = (id: string, s: Supply) => {
    setSupplies(prev => prev.map(sup => sup.id === id ? s : sup));
  };

  const deleteSupply = (id: string) => {
    setSupplies(prev => prev.filter(sup => sup.id !== id));
  };

  // --- SELLERS ---
  const addSeller = (s: Omit<Seller, 'id'>) => {
    const newId = `seller-${Math.floor(100 + Math.random() * 900)}`;
    const newSeller: Seller = { ...s, id: newId };
    const updated = [...sellers, newSeller];
    setSellers(updated);
  };

  const updateSeller = (id: string, s: Seller) => {
    const updated = sellers.map(seller => seller.id === id ? s : seller);
    setSellers(updated);
  };

  const deleteSeller = (id: string) => {
    const updated = sellers.filter(seller => seller.id !== id);
    setSellers(updated);
  };

  // Products CRUD
  const addProduct = (p: Omit<Product, 'id'>) => {
    const newId = `prod-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProduct: Product = { ...p, id: newId };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveToLocalStorage('forge_products', updated);

    // Also auto-add to inventory
    const newInventory: InventoryItem = {
      id: newId,
      name: p.name,
      category: p.category,
      stock: 0,
      minStock: 5,
      costPrice: p.costPrice,
      totalValue: 0,
      status: 'CRITICO'
    };
    const updatedInventory = [...inventory, newInventory];
    setInventory(updatedInventory);
    saveToLocalStorage('forge_inventory', updatedInventory);

    commitToGasIfEnabled({ products: updated, inventory: updatedInventory });
  };

  const updateProduct = (id: string, p: Product) => {
    const updated = products.map(prod => prod.id === id ? p : prod);
    setProducts(updated);
    saveToLocalStorage('forge_products', updated);

    // Sync inventory details as well
    const updatedInventory = inventory.map(item => {
      if (item.id === id) {
        return {
          ...item,
          name: p.name,
          category: p.category,
          costPrice: p.costPrice,
          totalValue: item.stock * p.costPrice,
          status: getStockStatus(item.stock, item.minStock)
        };
      }
      return item;
    });
    setInventory(updatedInventory);
    saveToLocalStorage('forge_inventory', updatedInventory);

    commitToGasIfEnabled({ products: updated, inventory: updatedInventory });
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(prod => prod.id !== id);
    setProducts(updated);
    saveToLocalStorage('forge_products', updated);

    const updatedInventory = inventory.filter(item => item.id !== id);
    setInventory(updatedInventory);
    saveToLocalStorage('forge_inventory', updatedInventory);

    commitToGasIfEnabled({ products: updated, inventory: updatedInventory });
  };

  // Inventory logic
  const getStockStatus = (stock: number, minStock: number): 'NORMAL' | 'BAIXO' | 'CRITICO' => {
    if (stock <= 0) return 'CRITICO';
    if (stock <= minStock) return 'BAIXO';
    return 'NORMAL';
  };

  const registerMovement = (productId: string, type: 'IN' | 'OUT', qty: number): boolean => {
    let success = true;
    const updated = inventory.map(item => {
      if (item.id === productId) {
        let newStock = item.stock;
        if (type === 'IN') {
          newStock += qty;
        } else {
          if (item.stock >= qty) {
            newStock -= qty;
          } else {
            success = false;
            return item;
          }
        }
        return {
          ...item,
          stock: newStock,
          totalValue: newStock * item.costPrice,
          status: getStockStatus(newStock, item.minStock)
        };
      }
      return item;
    });

    if (success) {
      setInventory(updated);
      saveToLocalStorage('forge_inventory', updated);
      commitToGasIfEnabled({ inventory: updated });
    }
    return success;
  };

  const registerPartMovement = (productId: string, partId: string, type: 'IN' | 'OUT', qty: number): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.isMultipart || !product.parts) return false;

    let success = true;
    const updated = inventory.map(item => {
      if (item.id === productId) {
        let newStock = item.stock;
        const partsStock = { ...(item.partsStock || {}) };
        const currentPartStock = partsStock[partId] || 0;

        if (type === 'IN') {
          partsStock[partId] = currentPartStock + qty;
        } else {
          if (currentPartStock >= qty) {
            partsStock[partId] = currentPartStock - qty;
          } else {
            success = false;
            return item;
          }
        }

        let completeAssemblies = 0;
        if (type === 'IN') {
          let maxPossible = Infinity;
          for (const p of product.parts) {
            const stock = partsStock[p.id] || 0;
            const required = p.quantity || 1;
            const possible = Math.floor(stock / required);
            if (possible < maxPossible) maxPossible = possible;
          }

          if (maxPossible > 0 && maxPossible !== Infinity) {
            completeAssemblies = maxPossible;
            for (const p of product.parts) {
              const required = p.quantity || 1;
              partsStock[p.id] -= required * completeAssemblies;
            }
          }
        }

        if (completeAssemblies > 0) {
          newStock += completeAssemblies;
        }

        return {
          ...item,
          stock: newStock,
          partsStock,
          totalValue: newStock * item.costPrice,
          status: getStockStatus(newStock, item.minStock)
        };
      }
      return item;
    });

    if (success) {
      setInventory(updated);
      saveToLocalStorage('forge_inventory', updated);
      commitToGasIfEnabled({ inventory: updated });
    }
    return success;
  };

  const updateInventoryItem = (id: string, item: InventoryItem) => {
    const updatedItem = {
      ...item,
      totalValue: item.stock * item.costPrice,
      status: getStockStatus(item.stock, item.minStock)
    };
    const updated = inventory.map(i => i.id === id ? updatedItem : i);
    setInventory(updated);
    saveToLocalStorage('forge_inventory', updated);
    commitToGasIfEnabled({ inventory: updated });
  };

  const deleteInventoryItem = (id: string) => {
    const updated = inventory.filter(i => i.id !== id);
    setInventory(updated);
    saveToLocalStorage('forge_inventory', updated);
    commitToGasIfEnabled({ inventory: updated });
  };

  // Materials CRUD
  const addMaterial = (m: Omit<Material, 'id'>) => {
    const newId = `mat-${Math.floor(100 + Math.random() * 900)}`;
    const newMaterial: Material = { ...m, id: newId };
    const updated = [...materials, newMaterial];
    setMaterials(updated);
    saveToLocalStorage('forge_materials', updated);
    commitToGasIfEnabled({ materials: updated });
  };

  const updateMaterial = (id: string, m: Material) => {
    const updated = materials.map(mat => mat.id === id ? m : mat);
    setMaterials(updated);
    saveToLocalStorage('forge_materials', updated);
    commitToGasIfEnabled({ materials: updated });
  };

  const deleteMaterial = (id: string) => {
    const updated = materials.filter(mat => mat.id !== id);
    setMaterials(updated);
    saveToLocalStorage('forge_materials', updated);
    commitToGasIfEnabled({ materials: updated });
  };

  // Customers CRUD
  const addCustomer = (c: Omit<Customer, 'id'>) => {
    const newId = `cli-${Math.floor(100 + Math.random() * 900)}`;
    const newCustomer: Customer = { ...c, id: newId };
    const updated = [...customers, newCustomer];
    setCustomers(updated);
    saveToLocalStorage('forge_customers', updated);
    commitToGasIfEnabled({ customers: updated });
  };

  const updateCustomer = (id: string, c: Customer) => {
    const updated = customers.map(cust => cust.id === id ? c : cust);
    setCustomers(updated);
    saveToLocalStorage('forge_customers', updated);
    commitToGasIfEnabled({ customers: updated });
  };

  const deleteCustomer = (id: string) => {
    const updated = customers.filter(cust => cust.id !== id);
    setCustomers(updated);
    saveToLocalStorage('forge_customers', updated);
    commitToGasIfEnabled({ customers: updated });
  };

  // Sales
  const addSale = (s: Omit<Sale, 'id'>) => {
    const newId = `vend-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSale: Sale = { ...s, id: newId };
    
    // Check if inventory has enough item
    const success = registerMovement(s.productId, 'OUT', s.quantity);
    if (!success) {
      throw new Error(`Estoque insuficiente para o produto "${s.productName}"`);
    }

    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    saveToLocalStorage('forge_sales', updatedSales);

    // Auto-create a financial log entry
    const newFinancial: FinancialLog = {
      id: `fin-${Math.floor(1000 + Math.random() * 9000)}`,
      date: s.date,
      type: 'RECEITA',
      description: `Venda - ${s.clientName} - ${s.quantity}x ${s.productName}`,
      category: 'Vendas',
      value: s.totalValue
    };
    const updatedFinancial = [newFinancial, ...financialLogs];
    setFinancialLogs(updatedFinancial);
    saveToLocalStorage('forge_financial', updatedFinancial);

    commitToGasIfEnabled({ sales: updatedSales, financial: updatedFinancial });
  };

  
  const updateSale = (id: string, s: Sale) => {
    const updated = sales.map(item => item.id === id ? s : item);
    setSales(updated);
    saveToLocalStorage('forge_sales', updated);
    commitToGasIfEnabled({ sales: updated });
  };

  const deleteSale = (id: string) => {
    const updated = sales.filter(item => item.id !== id);
    setSales(updated);
    saveToLocalStorage('forge_sales', updated);
    commitToGasIfEnabled({ sales: updated });
  };

  // Financial Logs
  const addFinancialLog = (f: Omit<FinancialLog, 'id'>) => {
    const newId = `fin-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLog: FinancialLog = { ...f, id: newId };
    const updated = [newLog, ...financialLogs];
    setFinancialLogs(updated);
    saveToLocalStorage('forge_financial', updated);
    commitToGasIfEnabled({ financial: updated });
  };

  const updateFinancialLog = (id: string, f: FinancialLog) => {
    const updated = financialLogs.map(log => log.id === id ? f : log);
    setFinancialLogs(updated);
    saveToLocalStorage('forge_financial', updated);
    commitToGasIfEnabled({ financial: updated });
  };

  const deleteFinancialLog = (id: string) => {
    const updated = financialLogs.filter(log => log.id !== id);
    setFinancialLogs(updated);
    saveToLocalStorage('forge_financial', updated);
    commitToGasIfEnabled({ financial: updated });
  };

  // Config
  const updateCostConfig = (c: CostConfig) => {
    setCostConfig(c);
    saveToLocalStorage('forge_config', c);
    commitToGasIfEnabled({ config: c });
  };

  // Sheets Sync Configuration

  const addPrinter = (p: Omit<Printer, 'id'>) => {
    const newP = { ...p, id: 'printer-' + Date.now() };
    const updated = [...printers, newP];
    setPrinters(updated);
    saveToLocalStorage('3derp_printers', updated);
  };
  const updatePrinter = (id: string, p: Printer) => {
    const updated = printers.map(x => x.id === id ? p : x);
    setPrinters(updated);
    saveToLocalStorage('3derp_printers', updated);
  };
  const deletePrinter = (id: string) => {
    const updated = printers.filter(x => x.id !== id);
    setPrinters(updated);
    saveToLocalStorage('3derp_printers', updated);
  };

  const addPrintJob = (job: Omit<PrintJob, 'id' | 'createdAt'>) => {
    const newId = 'job-' + Date.now();
    const newJ = { ...job, id: newId, createdAt: new Date().toISOString() };
    setPrintJobs(prev => {
      const updated = [...prev, newJ];
      saveToLocalStorage('3derp_printJobs', updated);
      return updated;
    });
    return newId;
  };
  const updatePrintJob = (id: string, updates: Partial<PrintJob>) => {
    setPrintJobs(prev => {
      const updated = prev.map(x => x.id === id ? { ...x, ...updates } : x);
      saveToLocalStorage('3derp_printJobs', updated);
      return updated;
    });
  };
  const updateMaterialWeight = (id: string, dec: number) => {
    setMaterials(prev => {
      let updatedMaterials = [...prev];
      let found = false;
      updatedMaterials = updatedMaterials.map(m => {
        if (m.id === id) {
          found = true;
          return { ...m, currentWeight: Math.max(0, m.currentWeight - dec) };
        }
        return m;
      });
      
      if (found) {
        saveToLocalStorage('forge_materials', updatedMaterials);
        commitToGasIfEnabled({ materials: updatedMaterials });
      }
      return updatedMaterials;
    });
  };

  const updateSyncConfig = (cfg: SyncConfig) => {
    setSyncConfig(cfg);
    saveToLocalStorage('forge_sync', cfg);
  };

  const syncWithGoogleSheets = async (gasUrl: string): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    try {
      // 1. Fetch data from Google Sheets App Script API
      const response = await fetch(`${gasUrl}?action=get_all`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const resData = await response.json();
      
      if (resData && resData.success && resData.database) {
        const db = resData.database;
        
        // Update states and local storage with pulled data if they exist
        if (db.products && db.products.length > 0) {
          setProducts(db.products);
          saveToLocalStorage('forge_products', db.products);
        }
        if (db.inventory && db.inventory.length > 0) {
          setInventory(db.inventory);
          saveToLocalStorage('forge_inventory', db.inventory);
        }
        if (db.materials && db.materials.length > 0) {
          setMaterials(db.materials);
          saveToLocalStorage('forge_materials', db.materials);
        }
        if (db.customers && db.customers.length > 0) {
          setCustomers(db.customers);
          saveToLocalStorage('forge_customers', db.customers);
        }
        if (db.sales && db.sales.length > 0) {
          setSales(db.sales);
          saveToLocalStorage('forge_sales', db.sales);
        }
        if (db.financial && db.financial.length > 0) {
          setFinancialLogs(db.financial);
          saveToLocalStorage('forge_financial', db.financial);
        }
        if (db.config) {
          setCostConfig(db.config);
          saveToLocalStorage('forge_config', db.config);
        }

        const newSyncCfg: SyncConfig = {
          mode: 'gas',
          gasUrl,
          connected: true
        };
        updateSyncConfig(newSyncCfg);
        
        return { success: true, message: "Dados sincronizados com o Google Sheets com sucesso!" };
      } else {
        // If GET was empty, we upload current local data to initialize the spreadsheet
        const payload = {
          action: 'sync',
          data: {
            products,
            inventory,
            materials,
            sales,
            customers,
            financial: financialLogs,
            config: costConfig
          }
        };

        const postResponse = await fetch(gasUrl, {
          method: 'POST',
          mode: 'no-cors', // Standard bypass for Google Apps Script Web App redirects
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const newSyncCfg: SyncConfig = {
          mode: 'gas',
          gasUrl,
          connected: true
        };
        updateSyncConfig(newSyncCfg);

        return { success: true, message: "Planilha vazia! O seu estoque local foi enviado para inicializar o Google Sheets." };
      }
    } catch (err: any) {
      console.error("Sheets Sync Error:", err);
      return { success: false, message: `Falha na conexão com o Apps Script: ${err.message}. Verifique a URL e as permissões de acesso.` };
    } finally {
      setIsSyncing(false);
    }
  };

  // Direct Google Sheets API sync handlers
  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        updateSyncConfig({
          ...syncConfig,
          userEmail: result.user.email || undefined
        });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Error signing in with Google:", err);
      const errMsg = err?.message || "";
      const errCode = err?.code || "";
      
      if (errCode === 'auth/unauthorized-domain' || errMsg.includes('unauthorized-domain')) {
        alert(
          "⚠️ Domínio de Hospedagem Não Autorizado!\n\n" +
          "Sua autenticação com o Google falhou porque este endereço de site (ex: Hostinger) não está autorizado no console do seu projeto Firebase.\n\n" +
          "Como resolver na Hostinger:\n" +
          "1. Acesse o Firebase Console (https://console.firebase.google.com)\n" +
          "2. Entre no seu projeto e clique em 'Authentication' no menu esquerdo.\n" +
          "3. Acesse a aba 'Settings' (Configurações) e depois a seção 'Authorized Domains' (Domínios Autorizados).\n" +
          "4. Clique em 'Add domain' e adicione o endereço exato do seu site na Hostinger.\n\n" +
          "Nota: Você pode continuar usando todo o sistema de forma 100% Offline (Banco Local) normalmente! Seus dados estão salvos de forma segura no seu navegador."
        );
      } else if (errCode === 'auth/popup-closed-by-user' || errMsg.includes('popup-closed-by-user')) {
        // Usuário apenas fechou o pop-up, não precisa de alerta chamativo
        console.log("Pop-up de login fechado pelo usuário.");
      } else {
        alert(
          "⚠️ Não foi possível conectar ao Google:\n" + 
          (err?.message || "Erro de inicialização ou rede.") + "\n\n" +
          "Dica: Se você deseja hospedar este aplicativo fora do Google AI Studio (como na Hostinger), configure suas próprias credenciais no arquivo 'firebase-applet-config.json' ou use o aplicativo em modo 100% Offline (Banco Local), que funciona de forma automática e independente!"
        );
      }
      return false;
    }
  };

  const logoutGoogle = async () => {
    await googleLogoutApi();
    setGoogleUser(null);
    setGoogleToken(null);
    if (syncConfig.mode === 'direct') {
      updateSyncConfig({
        mode: 'local',
        gasUrl: '',
        connected: false
      });
    }
  };

  const listDirectSheets = async (): Promise<DriveSpreadsheet[]> => {
    const token = googleToken || getAccessToken();
    if (!token) {
      throw new Error("Não autenticado com o Google.");
    }
    return await listSpreadsheets(token);
  };

  const createAndLinkSheet = async (title?: string): Promise<string | null> => {
    const token = googleToken || getAccessToken();
    if (!token) {
      alert("Por favor, conecte sua conta Google primeiro.");
      return null;
    }
    try {
      setIsSyncing(true);
      const sheetTitle = title || "Filamento Cust - Impressão 3D";
      const spreadsheetId = await createERPSpreadsheet(token, sheetTitle);
      
      // Initialize with local data
      await pushDataToSpreadsheet(token, spreadsheetId, {
        products,
        inventory,
        materials,
        sales,
        customers,
        financialLogs,
        printJobs,
        costConfig
      });

      const newCfg: SyncConfig = {
        mode: 'direct',
        gasUrl: '',
        connected: true,
        spreadsheetId,
        spreadsheetName: sheetTitle,
        userEmail: googleUser?.email || undefined
      };
      updateSyncConfig(newCfg);
      return spreadsheetId;
    } catch (err: any) {
      console.error("Erro ao criar planilha direct:", err);
      alert(`Falha ao criar planilha: ${err.message}`);
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  const syncDirect = async (
    spreadsheetId: string,
    spreadsheetName: string,
    action: 'pull' | 'push' | 'sync'
  ): Promise<{ success: boolean; message: string }> => {
    const token = googleToken || getAccessToken();
    if (!token) {
      return { success: false, message: "Não conectado ao Google. Faça login primeiro." };
    }
    setIsSyncing(true);
    try {
      if (action === 'push') {
        await pushDataToSpreadsheet(token, spreadsheetId, {
          products,
          inventory,
          materials,
          sales,
          customers,
          financialLogs,
          costConfig,
          printJobs
        });
        
        const newCfg: SyncConfig = {
          mode: 'direct',
          gasUrl: '',
          connected: true,
          spreadsheetId,
          spreadsheetName,
          userEmail: googleUser?.email || undefined
        };
        updateSyncConfig(newCfg);
        return { success: true, message: "Dados locais enviados para o Google Sheets com sucesso!" };
      } else if (action === 'pull') {
        const pulled = await pullDataFromSpreadsheet(token, spreadsheetId);
        
        if (pulled.products && pulled.products.length > 0) {
          setProducts(pulled.products);
          saveToLocalStorage('forge_products', pulled.products);
        }
        if (pulled.inventory && pulled.inventory.length > 0) {
          setInventory(pulled.inventory);
          saveToLocalStorage('forge_inventory', pulled.inventory);
        }
        if (pulled.materials && pulled.materials.length > 0) {
          setMaterials(pulled.materials);
          saveToLocalStorage('forge_materials', pulled.materials);
        }
        if (pulled.sales && pulled.sales.length > 0) {
          setSales(pulled.sales);
          saveToLocalStorage('forge_sales', pulled.sales);
        }
        if (pulled.customers && pulled.customers.length > 0) {
          setCustomers(pulled.customers);
          saveToLocalStorage('forge_customers', pulled.customers);
        }
        if (pulled.financialLogs && pulled.financialLogs.length > 0) {
          setFinancialLogs(pulled.financialLogs);
          saveToLocalStorage('forge_financial', pulled.financialLogs);
        }
        if (pulled.printJobs && pulled.printJobs.length > 0) {
          setPrintJobs(pulled.printJobs);
          saveToLocalStorage('3derp_printJobs', pulled.printJobs);
        }
        if (pulled.costConfig) {
          setCostConfig(pulled.costConfig);
          saveToLocalStorage('forge_config', pulled.costConfig);
        }

        const newCfg: SyncConfig = {
          mode: 'direct',
          gasUrl: '',
          connected: true,
          spreadsheetId,
          spreadsheetName,
          userEmail: googleUser?.email || undefined
        };
        updateSyncConfig(newCfg);
        return { success: true, message: "Dados do Google Sheets importados com sucesso!" };
      } else {
        // action === 'sync'
        let pulled;
        try {
          pulled = await pullDataFromSpreadsheet(token, spreadsheetId);
        } catch (e) {
          pulled = null;
        }

        if (pulled && pulled.products && pulled.products.length > 0) {
          setProducts(pulled.products);
          saveToLocalStorage('forge_products', pulled.products);
          setInventory(pulled.inventory);
          saveToLocalStorage('forge_inventory', pulled.inventory);
          setMaterials(pulled.materials);
          saveToLocalStorage('forge_materials', pulled.materials);
          setSales(pulled.sales);
          saveToLocalStorage('forge_sales', pulled.sales);
          setCustomers(pulled.customers);
          saveToLocalStorage('forge_customers', pulled.customers);
          setFinancialLogs(pulled.financialLogs);
          saveToLocalStorage('forge_financial', pulled.financialLogs);
          if (pulled.costConfig) {
            setCostConfig(pulled.costConfig);
            saveToLocalStorage('forge_config', pulled.costConfig);
          }
          
          const newCfg: SyncConfig = {
            mode: 'direct',
            gasUrl: '',
            connected: true,
            spreadsheetId,
            spreadsheetName,
            userEmail: googleUser?.email || undefined
          };
          updateSyncConfig(newCfg);
          return { success: true, message: "Dados sincronizados do Google Sheets com sucesso!" };
        } else {
          await pushDataToSpreadsheet(token, spreadsheetId, {
            products,
            inventory,
            materials,
            sales,
            customers,
            financialLogs,
            printJobs,
            costConfig
          });
          
          const newCfg: SyncConfig = {
            mode: 'direct',
            gasUrl: '',
            connected: true,
            spreadsheetId,
            spreadsheetName,
            userEmail: googleUser?.email || undefined
          };
          updateSyncConfig(newCfg);
          return { success: true, message: "Planilha vazia! Seus dados locais foram enviados para o Google Sheets." };
        }
      }
    } catch (err: any) {
      console.error("Direct sync error:", err);
      return { success: false, message: `Erro na sincronização: ${err.message}` };
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <DbContext.Provider value={{
      products,
      inventory,
      materials,
      customers,
      sales,
      financialLogs,
      costConfig,
      syncConfig,
      addProduct,
      updateProduct,
      deleteProduct,
      registerMovement,
      updateInventoryItem,
      deleteInventoryItem,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addSale,
      updateSale,
      deleteSale,
      addFinancialLog,
      updateFinancialLog,
      deleteFinancialLog,
      updateCostConfig,
      updateSyncConfig,
    printers,
    printJobs,
    sellers,
    addSeller,
    updateSeller,
    deleteSeller,
    addPrinter,
    updatePrinter,
    deletePrinter,
    supplies,
    addSupply,
    updateSupply,
    deleteSupply,
    addPrintJob,
    updatePrintJob,
    updateMaterialWeight,
      syncWithGoogleSheets,
      isSyncing,
      googleUser,
      googleToken,
      signInWithGoogle,
      logoutGoogle,
      createAndLinkSheet,
      listDirectSheets,
      syncDirect
    }}>
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (context === undefined) {
    throw new Error('useDb must be used within a DbProvider');
  }
  return context;
};
