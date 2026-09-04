export const googleAppsScriptCode = `/**
 * Filamento Cust - Integração Google Sheets para ERP de Impressão 3D
 * 
 * Instruções de Instalação:
 * 1. Acesse o Google Sheets (sheets.google.com) e crie uma nova planilha.
 * 2. No menu superior, clique em "Extensões" > "Apps Script".
 * 3. Cole este código no arquivo "Código.gs".
 * 4. No canto superior direito, clique em "Implantar" > "Nova implantação".
 * 5. Em "Selecionar tipo", escolha "App da Web".
 * 6. Defina:
 *    - Descrição: "Filamento Cust API"
 *    - Executar como: "Você (seu e-mail)"
 *    - Quem tem acesso: "Qualquer pessoa" (necessário para receber requisições do sistema).
 * 7. Clique em "Implantar" e conceda as permissões necessárias.
 * 8. Copie a "URL do app da Web" gerada e cole no módulo de Configurações do Filamento Cust.
 */

// Inicialização das abas e configuração
function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ["Produtos", "Estoque", "Materiais", "Custos", "Vendas", "Clientes", "Financeiro", "Configurações"];
  
  sheets.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Cria cabeçalhos base
      if (sheetName === "Produtos") {
        sheet.appendRow(["ID Produto", "Nome Produto", "Categoria", "Peso (g)", "Tempo (h)", "Custo Unitário", "Preço de Venda", "Lucro Unitário", "Material ID"]);
      } else if (sheetName === "Estoque") {
        sheet.appendRow(["ID Produto", "Nome", "Categoria", "Quantidade em Estoque", "Quantidade Mínima", "Custo Unitário", "Valor Total", "Status"]);
      } else if (sheetName === "Materiais") {
        sheet.appendRow(["ID Material", "Material", "Cor", "Marca", "Peso Inicial (g)", "Peso Atual (g)", "Valor do Rolo", "Custo por Grama", "Data de Compra"]);
      } else if (sheetName === "Custos") {
        sheet.appendRow(["Chave Config", "Valor Config", "Descrição"]);
        // Valores padrão
        sheet.appendRow(["kwhPrice", "0.92", "Preço do kWh"]);
        sheet.appendRow(["energyConsumption", "0.35", "Consumo médio da impressora em kW"]);
        sheet.appendRow(["hourlyOperationalCost", "5.00", "Custo operacional do operador por hora"]);
        sheet.appendRow(["defaultProfitMargin", "40", "Margem de lucro padrão (%)"]);
        sheet.appendRow(["taxesPercent", "6", "Porcentagem de impostos (%)"]);
      } else if (sheetName === "Vendas") {
        sheet.appendRow(["ID Venda", "Data", "Cliente", "Produto", "Quantidade", "Valor", "Custo Total", "Lucro"]);
      } else if (sheetName === "Clientes") {
        sheet.appendRow(["ID Cliente", "Nome", "Empresa", "CPF/CNPJ", "E-mail", "Telefone", "Categoria"]);
      } else if (sheetName === "Financeiro") {
        sheet.appendRow(["ID Lanc", "Data", "Tipo", "Descrição", "Categoria", "Valor"]);
      }
    }
  });
}

// Retorna cabeçalhos de resposta CORS
function getCorsResponse(outputData) {
  return ContentService.createTextOutput(JSON.stringify(outputData))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handler para requisições GET
function doGet(e) {
  setupSpreadsheet();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var db = {
    products: getSheetDataAsJson(ss.getSheetByName("Produtos")),
    inventory: getSheetDataAsJson(ss.getSheetByName("Estoque")),
    materials: getSheetDataAsJson(ss.getSheetByName("Materiais")),
    config: getConfigAsJson(ss.getSheetByName("Configurações")),
    sales: getSheetDataAsJson(ss.getSheetByName("Vendas")),
    customers: getSheetDataAsJson(ss.getSheetByName("Clientes")),
    financial: getSheetDataAsJson(ss.getSheetByName("Financeiro"))
  };
  
  return getCorsResponse({ success: true, database: db });
}

// Handler para requisições POST
function doPost(e) {
  setupSpreadsheet();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    
    if (action === "sync") {
      var data = postData.data;
      
      if (data.products) saveJsonToSheet(ss.getSheetByName("Produtos"), data.products, ["id", "name", "category", "weight", "printTime", "costPrice", "sellPrice", "profit", "materialId"]);
      if (data.inventory) saveJsonToSheet(ss.getSheetByName("Estoque"), data.inventory, ["id", "name", "category", "stock", "minStock", "costPrice", "totalValue", "status"]);
      if (data.materials) saveJsonToSheet(ss.getSheetByName("Materiais"), data.materials, ["id", "name", "color", "brand", "initialWeight", "currentWeight", "spoolPrice", "costPerGram", "purchaseDate"]);
      if (data.sales) saveJsonToSheet(ss.getSheetByName("Vendas"), data.sales, ["id", "date", "clientName", "productName", "quantity", "totalValue", "totalCost", "profit"]);
      if (data.customers) saveJsonToSheet(ss.getSheetByName("Clientes"), data.customers, ["id", "name", "company", "document", "email", "phone", "category"]);
      if (data.financial) saveJsonToSheet(ss.getSheetByName("Financeiro"), data.financial, ["id", "date", "type", "description", "category", "value"]);
      if (data.config) saveConfigToSheet(ss.getSheetByName("Configurações"), data.config);
      
      return getCorsResponse({ success: true, message: "Sincronização realizada com sucesso!" });
    }
    
    return getCorsResponse({ success: false, error: "Ação não suportada." });
  } catch(err) {
    return getCorsResponse({ success: false, error: err.toString() });
  }
}

// Auxiliar: Lê dados de uma aba e converte para JSON
function getSheetDataAsJson(sheet) {
  if (!sheet) return [];
  var range = sheet.getDataRange();
  var values = range.getValues();
  if (values.length <= 1) return [];
  
  var headers = values[0];
  var data = [];
  
  // Mapeamento de cabeçalhos de planilha para chaves de JSON do Frontend
  var headerMap = {
    // Produtos
    "ID Produto": "id", "Nome Produto": "name", "Categoria": "category", "Peso (g)": "weight", "Tempo (h)": "printTime", "Custo Unitário": "costPrice", "Preço de Venda": "sellPrice", "Lucro Unitário": "profit", "Material ID": "materialId",
    // Estoque
    "Quantidade em Estoque": "stock", "Quantidade Mínima": "minStock", "Valor Total": "totalValue", "Status": "status",
    // Materiais
    "ID Material": "id", "Material": "name", "Cor": "color", "Marca": "brand", "Peso Inicial (g)": "initialWeight", "Peso Atual (g)": "currentWeight", "Valor do Rolo": "spoolPrice", "Custo por Grama": "costPerGram", "Data de Compra": "purchaseDate",
    // Vendas
    "ID Venda": "id", "Data": "date", "Cliente": "clientName", "Produto": "productName", "Quantidade": "quantity", "Valor": "totalValue", "Custo Total": "totalCost", "Lucro": "profit",
    // Clientes
    "ID Cliente": "id", "Nome": "name", "Empresa": "company", "CPF/CNPJ": "document", "E-mail": "email", "Telefone": "phone",
    // Financeiro
    "ID Lanc": "id", "Tipo": "type", "Descrição": "description"
  };
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var header = headers[j];
      var key = headerMap[header] || header.toLowerCase();
      obj[key] = row[j];
    }
    data.push(obj);
  }
  return data;
}

// Auxiliar: Lê configurações
function getConfigAsJson(sheet) {
  var config = {
    kwhPrice: 0.92,
    energyConsumption: 0.35,
    hourlyOperationalCost: 5.00,
    defaultProfitMargin: 40,
    taxesPercent: 6,
    currency: "R$"
  };
  
  if (!sheet) return config;
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    var key = values[i][0];
    var val = parseFloat(values[i][1]);
    if (!isNaN(val)) {
      config[key] = val;
    }
  }
  return config;
}

// Auxiliar: Salva JSON genérico em uma planilha, sobrescrevendo dados antigos
function saveJsonToSheet(sheet, dataArray, keys) {
  if (!sheet) return;
  
  // Limpa dados antigos mantendo o cabeçalho
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }
  
  if (!dataArray || dataArray.length === 0) return;
  
  var rows = [];
  dataArray.forEach(function(item) {
    var row = [];
    keys.forEach(function(key) {
      row.push(item[key] !== undefined ? item[key] : "");
    });
    rows.push(row);
  });
  
  sheet.getRange(2, 1, rows.length, keys.length).setValues(rows);
}

// Auxiliar: Salva configurações de custos na aba correspondente
function saveConfigToSheet(sheet, config) {
  if (!sheet) return;
  sheet.clearContents();
  sheet.appendRow(["Chave Config", "Valor Config", "Descrição"]);
  
  sheet.appendRow(["kwhPrice", config.kwhPrice, "Preço do kWh"]);
  sheet.appendRow(["energyConsumption", config.energyConsumption, "Consumo médio da impressora em kW"]);
  sheet.appendRow(["hourlyOperationalCost", config.hourlyOperationalCost, "Custo operacional do operador por hora"]);
  sheet.appendRow(["defaultProfitMargin", config.defaultProfitMargin, "Margem de lucro padrão (%)"]);
  sheet.appendRow(["taxesPercent", config.taxesPercent, "Porcentagem de impostos (%)"]);
}
`;
