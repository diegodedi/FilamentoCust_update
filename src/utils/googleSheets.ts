import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, InventoryItem, Material, Customer, Sale, FinancialLog, CostConfig, PrintJob } from '../types';

// Initialize Firebase with try-catch to make it completely fail-safe outside Google environment
let app: any = null;
let auth: any = null;

try {
  if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } else {
    console.warn("Firebase config is default or empty. App will run in 100% Offline/Local mode.");
  }
} catch (e) {
  console.error("Failed to initialize Firebase:", e);
}

const provider = new GoogleAuthProvider();
// Add required Google Workspace scopes
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  if (!auth) {
    onAuthFailure();
    return () => {};
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      onAuthFailure();
    }
  });
};

// Sign in with Google Popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth) {
    throw new Error('O recurso de autenticação Google não pôde ser inicializado devido à falta de chaves válidas do Firebase no arquivo de configuração do app.');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Falha ao obter o token de acesso do Google Auth.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro de login:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Get current cached token
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Log out
export const logoutGoogle = async () => {
  if (auth) {
    await signOut(auth);
  }
  cachedAccessToken = null;
};

// --- Google Drive API Calls ---

export interface DriveSpreadsheet {
  id: string;
  name: string;
  modifiedTime: string;
}

// List spreadsheets in Google Drive
export const listSpreadsheets = async (token: string): Promise<DriveSpreadsheet[]> => {
  const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Falha ao listar planilhas do Google Drive.');
  }
  
  const data = await res.json();
  return data.files || [];
};

// --- Google Sheets API Calls ---

// Create a new Spreadsheet with the pre-defined sheets/tabs
export const createERPSpreadsheet = async (token: string, title: string = 'Filamento Cust - Impressão 3D'): Promise<string> => {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const body = {
    properties: { title },
    sheets: [
      { properties: { title: 'Produtos' } },
      { properties: { title: 'Estoque' } },
      { properties: { title: 'Materiais' } },
      { properties: { title: 'Vendas' } },
      { properties: { title: 'Clientes' } },
      { properties: { title: 'Financeiro' } },
      { properties: { title: 'Produção' } },
      { properties: { title: 'Configurações' } },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Falha ao criar planilha no Google Sheets.');
  }

  const data = await res.json();
  return data.spreadsheetId;
};

// Ensure spreadsheet has all required sheets. Create them if missing.
const ensureRequiredSheets = async (token: string, spreadsheetId: string): Promise<void> => {
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`;
  const res = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return; // fail silently or rely on subsequent writes

  const data = await res.json();
  const existingTitles = (data.sheets || []).map((s: any) => s.properties?.title);
  
  const requiredSheets = ['Produtos', 'Estoque', 'Materiais', 'Vendas', 'Clientes', 'Financeiro', 'Configurações', 'Produção'];
  const missingSheets = requiredSheets.filter(title => !existingTitles.includes(title));

  if (missingSheets.length === 0) return;

  const requests = missingSheets.map(title => ({
    addSheet: { properties: { title } }
  }));

  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
  await fetch(updateUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });
};

// Overwrite all tabs in the Spreadsheet with the current application state
export const pushDataToSpreadsheet = async (
  token: string,
  spreadsheetId: string,
  data: {
    products: Product[];
    inventory: InventoryItem[];
    materials: Material[];
    sales: Sale[];
    customers: Customer[];
    financialLogs: FinancialLog[];
    printJobs: PrintJob[];
    costConfig: CostConfig;
  }
): Promise<void> => {
  // First make sure tabs exist
  await ensureRequiredSheets(token, spreadsheetId);

  // Clear existing values in cells of all tabs
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`;
  const rangesToClear = [
    'Produtos!A1:Z1000',
    'Estoque!A1:Z1000',
    'Materiais!A1:Z1000',
    'Vendas!A1:Z1000',
    'Clientes!A1:Z1000',
    'Financeiro!A1:Z1000',
    'Produção!A1:Z1000',
    'Produção!A1:Z1000',
    'Configurações!A1:Z1000'
  ];
  
  await fetch(clearUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ranges: rangesToClear })
  });

  // Prepare table rows
  const productsRows = [
    ["ID Produto", "Nome Produto", "Categoria", "Peso (g)", "Tempo (h)", "Custo Unitário", "Preço de Venda", "Lucro Unitário", "Material ID"],
    ...data.products.map(p => [
      p.id,
      p.name,
      p.category,
      p.weight,
      p.printTime,
      p.costPrice,
      p.sellPrice,
      p.profit,
      p.materialId
    ])
  ];

  const inventoryRows = [
    ["ID Produto", "Nome", "Categoria", "Quantidade em Estoque", "Quantidade Mínima", "Custo Unitário", "Valor Total", "Status"],
    ...data.inventory.map(i => [
      i.id,
      i.name,
      i.category,
      i.stock,
      i.minStock,
      i.costPrice,
      i.totalValue,
      i.status
    ])
  ];

  const materialsRows = [
    ["ID Material", "Material", "Cor", "Marca", "Peso Inicial (g)", "Peso Atual (g)", "Valor do Rolo", "Custo por Grama", "Data de Compra", "Histórico (JSON)"],
    ...data.materials.map(m => [
      m.id,
      m.name,
      m.color,
      m.brand,
      m.initialWeight,
      m.currentWeight,
      m.spoolPrice,
      m.costPerGram,
      m.purchaseDate,
      m.priceHistory ? JSON.stringify(m.priceHistory) : ""
    ])
  ];

  const salesRows = [
    ["ID Venda", "Data", "Cliente", "Produto", "Quantidade", "Valor", "Custo Total", "Lucro"],
    ...data.sales.map(s => [
      s.id,
      s.date,
      s.clientName,
      s.productName,
      s.quantity,
      s.totalValue,
      s.totalCost,
      s.profit
    ])
  ];

  const customersRows = [
    ["ID Cliente", "Nome", "Empresa", "CPF/CNPJ", "E-mail", "Telefone", "Categoria"],
    ...data.customers.map(c => [
      c.id,
      c.name,
      c.company,
      c.document,
      c.email,
      c.phone,
      c.category
    ])
  ];

  const financialRows = [
    ["ID Lanc", "Data", "Tipo", "Descrição", "Categoria", "Valor"],
    ...data.financialLogs.map(f => [
      f.id,
      f.date,
      f.type,
      f.description,
      f.category,
      f.value
    ])
  ];

  
  const printJobsRows = [
    ["ID Job", "Data Inicio", "Data Fim", "Impressora", "Arquivo", "Produto", "Duração", "Quantidade", "Filamento Usado", "Status", "Contabilizado"],
    ...data.printJobs.map(j => [
      j.id,
      j.startedAt,
      j.completedAt || "",
      j.printerName,
      j.fileName,
      j.productName || "N/A",
      j.duration,
      j.quantityProduced,
      j.filamentConsumption.map(fc => fc.materialName + " (" + fc.plannedWeight + "g)").join(", "),
      j.status,
      j.inventoryApplied ? "SIM" : "NÃO"
    ])
  ];

  const configRows = [
    ["Chave Config", "Valor Config", "Descrição"],
    ["kwhPrice", data.costConfig.kwhPrice, "Preço do kWh"],
    ["energyConsumption", data.costConfig.energyConsumption, "Consumo médio da impressora em kW"],
    ["hourlyOperationalCost", data.costConfig.hourlyOperationalCost, "Custo operacional do operador por hora"],
    ["defaultProfitMargin", data.costConfig.defaultProfitMargin, "Margem de lucro padrão (%)"],
    ["taxesPercent", data.costConfig.taxesPercent, "Porcentagem de impostos (%)"]
  ];

  // Batch update rows
  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  const bodyUpdate = {
    valueInputOption: 'USER_ENTERED',
    data: [
      { range: 'Produtos!A1', values: productsRows },
      { range: 'Estoque!A1', values: inventoryRows },
      { range: 'Materiais!A1', values: materialsRows },
      { range: 'Vendas!A1', values: salesRows },
      { range: 'Clientes!A1', values: customersRows },
      { range: 'Financeiro!A1', values: financialRows },
      { range: 'Produção!A1', values: printJobsRows },
      { range: 'Configurações!A1', values: configRows }
    ]
  };

  const resUpdate = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyUpdate)
  });

  if (!resUpdate.ok) {
    const err = await resUpdate.json();
    throw new Error(err.error?.message || 'Falha ao sincronizar dados com a planilha.');
  }
};

// Helper to convert sheet values into objects
function parseSheetValues(
  values: any[][] | undefined,
  keyMap: Record<string, string>,
  numericFields: string[] = []
): any[] {
  if (!values || values.length <= 1) return [];
  const headers = values[0];
  const rows: any[] = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj: any = {};
    headers.forEach((header, index) => {
      const key = keyMap[header];
      if (key) {
        let val = row[index];
        if (val === undefined) val = "";
        if (numericFields.includes(key)) {
          obj[key] = parseFloat(val) || 0;
        } else {
          obj[key] = val;
        }
      }
    });
    // Only push if row has some data
    if (Object.keys(obj).length > 0 && obj.id) {
      rows.push(obj);
    }
  }
  return rows;
}

// Pull all tabs from the Spreadsheet and return database structure
export const pullDataFromSpreadsheet = async (
  token: string,
  spreadsheetId: string
): Promise<{
  products: Product[];
  inventory: InventoryItem[];
  materials: Material[];
  sales: Sale[];
  customers: Customer[];
  financialLogs: FinancialLog[];
  printJobs: PrintJob[];
  costConfig?: CostConfig;
}> => {
  // Ensure we have tabs first
  await ensureRequiredSheets(token, spreadsheetId);

  const ranges = [
    'Produtos!A1:Z1000',
    'Estoque!A1:Z1000',
    'Materiais!A1:Z1000',
    'Vendas!A1:Z1000',
    'Clientes!A1:Z1000',
    'Financeiro!A1:Z1000',
    'Configurações!A1:Z1000'
  ];

  const rangesParam = ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${rangesParam}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Falha ao buscar dados do Google Sheets.');
  }

  const data = await res.json();
  const valueRanges = data.valueRanges || [];

  // Map ranges to variables
  const getRangeValues = (name: string): any[][] | undefined => {
    const found = valueRanges.find((vr: any) => vr.range && vr.range.startsWith(name));
    return found ? found.values : undefined;
  };

  const productsKeyMap = {
    "ID Produto": "id",
    "Nome Produto": "name",
    "Categoria": "category",
    "Peso (g)": "weight",
    "Tempo (h)": "printTime",
    "Custo Unitário": "costPrice",
    "Preço de Venda": "sellPrice",
    "Lucro Unitário": "profit",
    "Material ID": "materialId"
  };
  const productsNumeric = ["weight", "printTime", "costPrice", "sellPrice", "profit"];

  const inventoryKeyMap = {
    "ID Produto": "id",
    "Nome": "name",
    "Categoria": "category",
    "Quantidade em Estoque": "stock",
    "Quantidade Mínima": "minStock",
    "Custo Unitário": "costPrice",
    "Valor Total": "totalValue",
    "Status": "status"
  };
  const inventoryNumeric = ["stock", "minStock", "costPrice", "totalValue"];

  const materialsKeyMap = {
    "ID Material": "id",
    "Material": "name",
    "Cor": "color",
    "Marca": "brand",
    "Peso Inicial (g)": "initialWeight",
    "Peso Atual (g)": "currentWeight",
    "Valor do Rolo": "spoolPrice",
    "Custo por Grama": "costPerGram",
    "Data de Compra": "purchaseDate",
    "Histórico (JSON)": "_priceHistoryJSON"
  };
  const materialsNumeric = ["initialWeight", "currentWeight", "spoolPrice", "costPerGram"];

  const salesKeyMap = {
    "ID Venda": "id",
    "Data": "date",
    "Cliente": "clientName",
    "Produto": "productName",
    "Quantidade": "quantity",
    "Valor": "totalValue",
    "Custo Total": "totalCost",
    "Lucro": "profit"
  };
  const salesNumeric = ["quantity", "totalValue", "totalCost", "profit"];

  const customersKeyMap = {
    "ID Cliente": "id",
    "Nome": "name",
    "Empresa": "company",
    "CPF/CNPJ": "document",
    "E-mail": "email",
    "Telefone": "phone",
    "Categoria": "category"
  };

  const financialKeyMap = {
    "ID Lanc": "id",
    "Data": "date",
    "Tipo": "type",
    "Descrição": "description",
    "Categoria": "category",
    "Valor": "value"
  };
  const financialNumeric = ["value"];

  // Parse arrays
  const parsedProducts = parseSheetValues(getRangeValues('Produtos'), productsKeyMap, productsNumeric);
  const parsedInventory = parseSheetValues(getRangeValues('Estoque'), inventoryKeyMap, inventoryNumeric);
  const parsedMaterialsRaw = parseSheetValues(getRangeValues('Materiais'), materialsKeyMap, materialsNumeric);
  const parsedMaterials = parsedMaterialsRaw.map(m => {
    const newM = { ...m };
    if (newM._priceHistoryJSON) {
      try {
        newM.priceHistory = JSON.parse(newM._priceHistoryJSON);
      } catch (e) {
        newM.priceHistory = [];
      }
      delete newM._priceHistoryJSON;
    }
    return newM;
  });
  const parsedSales = parseSheetValues(getRangeValues('Vendas'), salesKeyMap, salesNumeric);
  const parsedCustomers = parseSheetValues(getRangeValues('Clientes'), customersKeyMap);
  const parsedFinancial = parseSheetValues(getRangeValues('Financeiro'), financialKeyMap, financialNumeric);

  const printJobsKeyMap = {
    "ID Job": "id",
    "Data Inicio": "startedAt",
    "Data Fim": "completedAt",
    "Impressora": "printerName",
    "Arquivo": "fileName",
    "Produto": "productName",
    "Duração": "duration",
    "Quantidade": "quantityProduced",
    "Status": "status"
  };
  const printJobsNumeric = ["duration", "quantityProduced"];
  const parsedPrintJobs = parseSheetValues(getRangeValues('Produção'), printJobsKeyMap, printJobsNumeric).map(j => ({
    ...j,
    filamentConsumption: [], // Simplification for read-only pull
    inventoryApplied: j.Contabilizado === "SIM"
  }));


  // Parse configurations
  const configValues = getRangeValues('Configurações');
  const configObj: CostConfig = {
    kwhPrice: 0.92,
    energyConsumption: 0.35,
    hourlyOperationalCost: 5.00,
    defaultProfitMargin: 40,
    taxesPercent: 6,
    currency: "R$"
  };

  if (configValues && configValues.length > 1) {
    for (let i = 1; i < configValues.length; i++) {
      const row = configValues[i];
      const key = row[0];
      const val = parseFloat(row[1]);
      if (key && !isNaN(val)) {
        (configObj as any)[key] = val;
      }
    }
  }

  return {
    products: parsedProducts,
    inventory: parsedInventory,
    materials: parsedMaterials,
    sales: parsedSales,
    customers: parsedCustomers,
    financialLogs: parsedFinancial,
    printJobs: parsedPrintJobs,
    costConfig: configObj
  };
};
