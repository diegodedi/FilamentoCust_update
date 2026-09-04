import { PRINTER_BRIDGE_URL, checkBridgeHealth } from "../config";
import React, { useState, useEffect } from 'react';
import { useDb } from '../context/DbContext';
import { usePrinters } from '../context/PrinterContext';
import { googleAppsScriptCode } from '../utils/gasCode';
import { 
  Save, RefreshCw, Copy, Check, Sliders, Server, HelpCircle, Code, CheckCircle,
  LogIn, LogOut, FileSpreadsheet, Plus, Download, Upload, ExternalLink, ShieldAlert, Printer, Trash2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const { bridgeOnline } = usePrinters();
  const { 
    costConfig, syncConfig, updateCostConfig, syncWithGoogleSheets, updateSyncConfig,
    googleUser, googleToken, signInWithGoogle, logoutGoogle, createAndLinkSheet, listDirectSheets, syncDirect, isSyncing, printers, removePrinter, updatePrinter } = useDb();

  // Cost configs
  const [kwhPrice, setKwhPrice] = useState(costConfig.kwhPrice);
  const [energyConsumption, setEnergyConsumption] = useState(costConfig.energyConsumption);
  const [hourlyOperationalCost, setHourlyOperationalCost] = useState(costConfig.hourlyOperationalCost);
  const [defaultProfitMargin, setDefaultProfitMargin] = useState(costConfig.defaultProfitMargin);
  const [taxesPercent, setTaxesPercent] = useState(costConfig.taxesPercent);

  // Sync configs (legacy Apps Script)
  const [gasUrl, setGasUrl] = useState(syncConfig.gasUrl);
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Direct Sync states
  const [syncMethod, setSyncMethod] = useState<'direct' | 'legacy'>('direct');
  const [driveSheets, setDriveSheets] = useState<any[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [selectedSheetId, setSelectedSheetId] = useState('');
  const [newSheetTitle, setNewSheetTitle] = useState('Filamento Cust - Impressão 3D');
  const [directFeedback, setDirectFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Tab state within settings
  const [activeTab, setActiveTab] = useState<'geral' | 'sheets' | 'printers'>('geral');

  // Printer Modal states
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [editingPrinterId, setEditingPrinterId] = useState<string | null>(null);
  const [printerName, setPrinterName] = useState('');
  const [printerModel, setPrinterModel] = useState('');
  const [printerIp, setPrinterIp] = useState('');
  const [printerPort, setPrinterPort] = useState('7125');
  const [printerProtocol, setPrinterProtocol] = useState<'MOONRAKER' | 'WebSocket' | 'GENERIC'>('MOONRAKER');
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error', message: string }>({ status: 'idle', message: '' });

  const { addPrinter } = useDb();

  const handleOpenPrinterModal = (printer?: any) => {
    if (printer) {
      setEditingPrinterId(printer.id);
      setPrinterName(printer.name);
      setPrinterModel(printer.model || '');
      setPrinterIp(printer.ip);
      setPrinterPort(printer.port.toString());
      setPrinterProtocol(printer.protocol);
    } else {
      setEditingPrinterId(null);
      setPrinterName('');
      setPrinterModel('');
      setPrinterIp('');
      setPrinterPort('7125');
      setPrinterProtocol('MOONRAKER');
    }
    setTestResult({ status: 'idle', message: '' });
    setIsPrinterModalOpen(true);
  };

  const handleSavePrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!printerName || !printerIp) return;
    
    const pData = {
      name: printerName,
      model: printerModel,
      ip: printerIp,
      port: parseInt(printerPort) || 7125,
      protocol: printerProtocol,
      monitoringEnabled: true
    };

    if (editingPrinterId) {
      updatePrinter(editingPrinterId, pData);
    } else {
      addPrinter({ ...pData, id: Date.now().toString() });
    }
    setIsPrinterModalOpen(false);
  };

  const handleTestPrinterConnection = async () => {
    if (!printerIp) {
      setTestResult({ status: 'error', message: 'Preencha o IP da impressora.' });
      return;
    }
    
    setTestResult({ status: 'testing', message: 'Testando Printer Bridge e Impressora...' });
    
    try {
      // 1. Health check no Bridge
      try {
        const healthRes = await fetch(PRINTER_BRIDGE_URL + '/health', { signal: AbortSignal.timeout(3000) });
        if (!healthRes.ok) throw new Error('Health falhou');
      } catch (err: any) {
        setTestResult({ 
          status: 'error', 
          message: '✕ Printer Bridge indisponível. Verifique se o comando npm run printer-bridge está rodando localmente no terminal.' 
        });
        return;
      }

      // 2. Testar Impressora via Bridge
      const res = await fetch(PRINTER_BRIDGE_URL + '/printers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: printerIp, model: printerModel })
      });
      
      const data = await res.json();
      
      let logsText = '';
      if (data.logs && Array.isArray(data.logs)) {
        logsText = data.logs.join('\n');
      }
      
      if (data.success) {
        setTestResult({ status: 'success', message: 'Conexão bem sucedida!\n' + logsText });
        if (data.protocol) {
          setPrinterProtocol(data.protocol);
        }
      } else {
        setTestResult({ status: 'error', message: 'Falha na conexão.\n' + logsText });
      }
    } catch (err: any) {
      setTestResult({ status: 'error', message: `Erro fatal no teste: ${err.message}` });
    }
  };

  useEffect(() => {
    if (googleUser && syncMethod === 'direct' && syncConfig.mode !== 'direct') {
      loadDriveSheets();
    }
  }, [googleUser, syncMethod]);

  const loadDriveSheets = async () => {
    setIsLoadingSheets(true);
    try {
      const sheets = await listDirectSheets();
      setDriveSheets(sheets);
      if (sheets.length > 0) {
        setSelectedSheetId(sheets[0].id);
      }
    } catch (err) {
      console.error("Erro ao listar planilhas:", err);
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    updateCostConfig({
      kwhPrice,
      energyConsumption,
      hourlyOperationalCost,
      defaultProfitMargin,
      taxesPercent,
      currency: "R$"
    });
    alert('Configurações gerais atualizadas com sucesso!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 3000);
  };

  const handleConnectSync = async () => {
    if (!gasUrl.trim()) {
      alert('Insira a URL do seu App da Web do Google Apps Script.');
      return;
    }
    setIsSyncingLocal(true);
    setSyncFeedback(null);
    
    const result = await syncWithGoogleSheets(gasUrl);
    setSyncFeedback(result);
    setIsSyncingLocal(false);
  };

  const handleDisconnect = () => {
    updateSyncConfig({
      mode: 'local',
      gasUrl: '',
      connected: false
    });
    setGasUrl('');
    setSyncFeedback(null);
    alert('Desconectado do Google Sheets. Retornando ao banco de dados local.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline-md text-white mb-1">Configurações Gerais e Integrações</h2>
        <p className="text-slate-400 font-body-md font-medium">Ajuste os parâmetros padrão do fatiamento de custos e configure a governança de dados.</p>
      </div>

      {/* Sub-Navegação interna de abas */}
      <div className="flex border-b border-[#2B2F36] gap-1">
        <button
          onClick={() => setActiveTab('geral')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'geral' 
              ? 'border-slate-800 text-white font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" /> Parâmetros Operacionais
        </button>
        <button
          onClick={() => setActiveTab('sheets')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'sheets' 
              ? 'border-slate-800 text-white font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" /> Integração Google Sheets
        </button>
        <button
          onClick={() => setActiveTab('printers')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'printers' 
              ? 'border-slate-800 text-white font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Printer className="w-4 h-4" /> Impressoras
        </button>
      </div>


            {activeTab === 'printers' && (
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Printer className="w-5 h-5 text-[#0084FF]" /> Impressoras e Integrações
                </h3>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${bridgeOnline ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${bridgeOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  BRIDGE {bridgeOnline ? 'ONLINE' : 'OFFLINE'}
                </div>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                {!bridgeOnline ? "Printer Bridge offline. Instruções: execute 'start-bridge.bat' na pasta printer-bridge no seu computador." : "Gerencie as impressoras conectadas ao sistema."}
              </p>
            </div>
            <button
              onClick={() => handleOpenPrinterModal()}
              className="bg-[#0084FF] hover:bg-[#0084FF]/90 text-white font-bold py-2.5 px-5 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nova Impressora
            </button>
          </div>
          
          <div className="bg-[#1C1F24] rounded-xl border border-[#2B2F36] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#121418] border-b border-[#2B2F36] text-xs font-bold text-slate-400 uppercase">
                  <th className="p-4">Nome</th>
                  <th className="p-4">IP / Porta</th>
                  <th className="p-4">Monitoramento</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2F36]">
                {printers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">Nenhuma impressora configurada.</td>
                  </tr>
                ) : (
                  printers.map(p => (
                    <tr key={p.id} className="hover:bg-[#121418] transition-colors">
                      <td className="p-4 font-bold text-white">{p.name} <span className="text-xs font-normal text-slate-400 ml-2">{p.model}</span></td>
                      <td className="p-4 text-slate-300 font-mono text-sm">{p.ip}:{p.port}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => updatePrinter(p.id, { monitoringEnabled: !p.monitoringEnabled })}
                          className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${p.monitoringEnabled ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[#2B2F36] text-slate-400'}`}
                        >
                          {p.monitoringEnabled ? 'Ativado' : 'Desativado'}
                        </button>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            if(window.confirm('Tem certeza que deseja remover esta impressora?')) {
                              removePrinter(p.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-[#2B2F36] rounded-lg transition-colors cursor-pointer"
                          title="Remover impressora"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenPrinterModal(p)}
                          className="p-2 text-slate-400 hover:text-[#0084FF] hover:bg-[#2B2F36] rounded-lg transition-colors cursor-pointer"
                          title="Editar impressora"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE NOVA/EDITAR IMPRESSORA */}
      {isPrinterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1F24] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-[#2B2F36]">
            <div className="p-6 border-b border-[#2B2F36] flex justify-between items-center bg-[#121418]">
              <h2 className="font-headline-md text-white m-0">
                {editingPrinterId ? 'Editar Impressora' : 'Cadastrar Impressora'}
              </h2>
              <button onClick={() => setIsPrinterModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-300 rounded-full transition-colors cursor-pointer">
                <Trash2 className="w-5 h-5 hidden" /> {/* just keeping spacing consistent if X was here */}
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <form onSubmit={handleSavePrinter} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nome / Identificação</label>
                  <input
                    type="text"
                    required
                    value={printerName}
                    onChange={(e) => setPrinterName(e.target.value)}
                    placeholder="Ex: Ender 3 Pro - Preto"
                    className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Modelo (Opcional)</label>
                  <input
                    type="text"
                    value={printerModel}
                    onChange={(e) => setPrinterModel(e.target.value)}
                    placeholder="Ex: Creality Ender 3 V2"
                    className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Endereço IP</label>
                    <input
                      type="text"
                      required
                      value={printerIp}
                      onChange={(e) => setPrinterIp(e.target.value)}
                      placeholder="192.168.0.100"
                      className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF] font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Porta</label>
                    <input
                      type="text"
                      required
                      value={printerPort}
                      onChange={(e) => setPrinterPort(e.target.value)}
                      placeholder="7125"
                      className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF] font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Protocolo / API</label>
                  <select
                    value={printerProtocol}
                    onChange={(e: any) => setPrinterProtocol(e.target.value)}
                    className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]"
                  >
                    <option value="MOONRAKER">Klipper / Moonraker (Fluidd/Mainsail) - Porta 7125</option>
                    <option value="WebSocket">Creality Web Box / Sonic Pad - Porta 80</option>
                    <option value="GENERIC">OctoPrint / Genérico - Porta 80</option>
                  </select>
                </div>

                {/* Test Connection UI */}
                <div className="mt-6 p-4 bg-[#121418] border border-[#2B2F36] rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase">Diagnóstico de Conexão</h4>
                    <button
                      type="button"
                      onClick={handleTestPrinterConnection}
                      disabled={testResult.status === 'testing'}
                      className="px-3 py-1.5 bg-[#2B2F36] hover:bg-[#3A3F47] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {testResult.status === 'testing' ? 'Testando...' : 'Testar Conexão'}
                    </button>
                  </div>
                  
                  {testResult.status !== 'idle' && (
                    <div className={`p-3 rounded-lg border text-xs leading-relaxed whitespace-pre-line ${
                      testResult.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      testResult.status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>
                      {testResult.message}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                    * O teste envia um comando para o Printer Bridge (rodando localmente) verificar a conexão real (HTTP/WebSocket) com a impressora, validando a integridade da rede.
                  </p>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-[#2B2F36] mt-6">
                  <button
                    type="button"
                    onClick={() => setIsPrinterModalOpen(false)}
                    className="px-5 py-2.5 bg-transparent border border-[#2B2F36] text-slate-300 hover:bg-[#2B2F36] rounded-lg font-bold text-sm transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0084FF] hover:bg-[#0084FF]/90 text-white rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer"
                  >
                    {editingPrinterId ? 'Salvar Alterações' : 'Cadastrar Impressora'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'geral' ? (
        /* Geral Params Form */
        <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-6 shadow-sm max-w-2xl">
          <div className="mb-6 pb-4 border-b border-[#2B2F36] flex justify-between items-center">
            <h3 className="font-headline-sm text-white text-sm">Parâmetros Globais de Precificação</h3>
            <span className="text-[10px] text-slate-400 font-mono">Aplica-se em todo o sistema</span>
          </div>

          <form onSubmit={handleSaveConfigs} className="space-y-5 text-slate-200 font-body-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase flex items-center gap-1">
                  Preço do kWh Elétrico (R$) 
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Verifique o valor na fatura de sua concessionária de energia." />
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={kwhPrice}
                  onChange={(e) => setKwhPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg outline-none focus:border-[#0084FF] font-mono font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase flex items-center gap-1">
                  Consumo Médio da Impressora (kW)
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Consumo médio por hora. Uma impressora comum consome cerca de 0.2 a 0.4 kW por hora." />
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={energyConsumption}
                  onChange={(e) => setEnergyConsumption(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg outline-none focus:border-[#0084FF] font-mono font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase flex items-center gap-1">
                  Custo Operacional / Hora Máquina (R$)
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Custo de amortização da máquina, manutenção preventiva e valor de mão de obra por hora." />
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  value={hourlyOperationalCost}
                  onChange={(e) => setHourlyOperationalCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg outline-none focus:border-[#0084FF] font-mono font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase">Porcentagem de Impostos Padrão (%)</label>
                <input 
                  type="number" 
                  required
                  value={taxesPercent}
                  onChange={(e) => setTaxesPercent(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg outline-none focus:border-[#0084FF] font-mono font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-label-md text-slate-400 text-xs uppercase">Margem de Lucro Sugerida Padrão (%)</label>
              <input 
                type="number" 
                required
                value={defaultProfitMargin}
                onChange={(e) => setDefaultProfitMargin(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg outline-none focus:border-[#0084FF] font-mono font-medium font-bold"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                className="px-5 py-2.5 bg-[#0084FF] hover:bg-[#0084FF]/90 text-white rounded-lg font-label-md text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" /> Salvar Configurações
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Google Sheets live sync dashboard */
        <div className="space-y-6">
          {/* Sync Method Switcher (Pills) */}
          <div className="bg-[#2B2F36] p-1 rounded-xl flex max-w-md border border-[#2B2F36]">
            <button
              onClick={() => setSyncMethod('direct')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                syncMethod === 'direct'
                  ? 'bg-[#1C1F24] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#0084FF]" /> Conexão Direta (Recomendado)
            </button>
            <button
              onClick={() => setSyncMethod('legacy')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                syncMethod === 'legacy'
                  ? 'bg-[#1C1F24] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-slate-400" /> Script Manual (Legado)
            </button>
          </div>

          {syncMethod === 'direct' ? (
            /* --- METHOD 1: DIRECT GOOGLE SHEETS API VIA OAUTH --- */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Panel: Auth and Linking */}
              <div className="lg:col-span-5 bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-6 shadow-sm space-y-6">
                <div className="pb-4 border-b border-[#2B2F36]">
                  <h3 className="font-headline-sm text-white text-sm flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4.5 h-4.5 text-[#0084FF]" /> Sincronismo via Nuvem Google
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Sincronize seu ERP diretamente com sua planilha do Google Drive de forma nativa.</p>
                </div>

                {!googleUser ? (
                  /* 1. NOT LOGGED IN */
                  <div className="space-y-4 py-2">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Conecte sua conta do Google para ler e gravar dados em suas planilhas em tempo real. Não é necessário colar códigos ou configurar scripts!
                    </p>
                    
                    {/* Material Styled Google Sign-In Button */}
                    <button 
                      onClick={signInWithGoogle}
                      disabled={isSyncing}
                      className="w-full flex items-center justify-center gap-3 bg-[#1C1F24] border border-[#3A3F47] hover:border-slate-400 text-slate-200 px-4 py-2.5 rounded-lg shadow-sm font-bold text-xs transition-all cursor-pointer hover:bg-[#121418] disabled:opacity-50"
                    >
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4.5 h-4.5 block">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      </svg>
                      Conectar com o Google
                    </button>
                  </div>
                ) : (
                  /* 2. LOGGED IN */
                  <div className="space-y-6">
                    {/* Logged in User Profile banner */}
                    <div className="p-4 bg-[#121418] border border-[#2B2F36] rounded-lg flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {googleUser.photoURL ? (
                          <img src={googleUser.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-[#2B2F36]" JSXReferrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 bg-[#0084FF]/10 rounded-full flex items-center justify-center font-bold text-xs text-[#0084FF]">
                            {googleUser.displayName?.charAt(0) || googleUser.email?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="text-xs">
                          <p className="font-bold text-white">{googleUser.displayName || 'Usuário Google'}</p>
                          <p className="text-slate-400 font-mono">{googleUser.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={logoutGoogle}
                        className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-[#3A3F47] transition-all cursor-pointer"
                        title="Sair da Conta Google"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>

                    {syncConfig.mode === 'direct' && syncConfig.spreadsheetId ? (
                      /* 2.1 SPREADSHEET LINKED AND CONNECTED */
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-100 rounded-lg space-y-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <p className="font-bold text-white">Sincronização Ativa (Nativa)</p>
                              <p className="text-slate-400 mt-0.5">Sua planilha está conectada e as atualizações de produtos, estoque e vendas ocorrem de forma imediata.</p>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-green-100 flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-300 font-mono truncate max-w-[200px]" title={syncConfig.spreadsheetName}>
                              📁 {syncConfig.spreadsheetName || 'Planilha Vinculada'}
                            </span>
                            <a 
                              href={`https://docs.google.com/spreadsheets/d/${syncConfig.spreadsheetId}/edit`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[#0084FF] hover:underline font-bold flex items-center gap-0.5"
                            >
                              Abrir <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        {/* Connection control buttons */}
                        <div className="space-y-2 pt-2">
                          <button
                            onClick={async () => {
                              const res = await syncDirect(syncConfig.spreadsheetId!, syncConfig.spreadsheetName!, 'sync');
                              setDirectFeedback(res);
                            }}
                            disabled={isSyncing}
                            className="w-full py-2 px-4 bg-[#0084FF] hover:bg-[#0084FF]/90 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora (Bidirecional)'}
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={async () => {
                                const res = await syncDirect(syncConfig.spreadsheetId!, syncConfig.spreadsheetName!, 'push');
                                setDirectFeedback(res);
                              }}
                              disabled={isSyncing}
                              className="py-2 px-3 bg-[#1C1F24] border border-[#2B2F36] text-slate-200 hover:bg-[#121418] rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Exporta dados locais para o Sheets"
                            >
                              <Upload className="w-3.5 h-3.5 text-slate-400" /> Enviar Local (Push)
                            </button>
                            
                            <button
                              onClick={async () => {
                                const res = await syncDirect(syncConfig.spreadsheetId!, syncConfig.spreadsheetName!, 'pull');
                                setDirectFeedback(res);
                              }}
                              disabled={isSyncing}
                              className="py-2 px-3 bg-[#1C1F24] border border-[#2B2F36] text-slate-200 hover:bg-[#121418] rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Substitui banco local pelos dados da planilha"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-400" /> Importar Planilha (Pull)
                            </button>
                          </div>

                          <button
                            onClick={handleDisconnect}
                            className="w-full py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-all cursor-pointer text-center mt-2"
                          >
                            Desvincular Planilha Ativa
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 2.2 SPREADSHEET NOT LINKED YET - CHOOSE OR CREATE */
                      <div className="space-y-6">
                        {/* Option A: Create new */}
                        <div className="space-y-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1">
                            <Plus className="w-4 h-4 text-[#0084FF]" /> Opção A: Criar Nova Planilha ERP
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Criaremos uma planilha novinha em seu Google Drive configurada com todas as abas estruturadas do Filamento Cust.
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newSheetTitle}
                              onChange={(e) => setNewSheetTitle(e.target.value)}
                              placeholder="Nome da planilha"
                              className="flex-1 px-3 py-1.5 border border-[#2B2F36] bg-[#1C1F24] rounded-lg text-xs outline-none focus:border-[#0084FF]"
                            />
                            <button
                              onClick={async () => {
                                const sheetId = await createAndLinkSheet(newSheetTitle);
                                if (sheetId) {
                                  setDirectFeedback({ success: true, message: `Planilha "${newSheetTitle}" criada e vinculada com sucesso!` });
                                }
                              }}
                              disabled={isSyncing}
                              className="px-3 py-1.5 bg-[#0084FF] hover:bg-[#0084FF]/90 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                            >
                              {isSyncing ? 'Criando...' : 'Criar'}
                            </button>
                          </div>
                        </div>

                        {/* Option B: Choose existing */}
                        <div className="space-y-3 p-4 bg-[#121418] border border-[#2B2F36] rounded-xl">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Opção B: Vincular Existente
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Selecione uma planilha de planilhas de seu Drive para mapear e sincronizar.
                          </p>
                          
                          {isLoadingSheets ? (
                            <div className="flex items-center justify-center gap-1 py-2 text-xs text-slate-400">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Carregando arquivos do Drive...
                            </div>
                          ) : driveSheets.length > 0 ? (
                            <div className="space-y-3">
                              <select
                                value={selectedSheetId}
                                onChange={(e) => setSelectedSheetId(e.target.value)}
                                className="w-full px-3 py-2 border border-[#2B2F36] bg-[#1C1F24] rounded-lg text-xs outline-none focus:border-[#0084FF]"
                              >
                                {driveSheets.map(sheet => (
                                  <option key={sheet.id} value={sheet.id}>
                                    {sheet.name} (Modificado {new Date(sheet.modifiedTime).toLocaleDateString()})
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={async () => {
                                  const selected = driveSheets.find(s => s.id === selectedSheetId);
                                  if (selected) {
                                    const res = await syncDirect(selected.id, selected.name, 'sync');
                                    setDirectFeedback(res);
                                  }
                                }}
                                disabled={isSyncing || !selectedSheetId}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
                              >
                                {isSyncing ? 'Conectando...' : 'Vincular Planilha Selecionada'}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-[10px] text-slate-400">Nenhuma planilha recente encontrada no Drive.</p>
                              <button
                                onClick={loadDriveSheets}
                                className="text-xs font-bold text-[#0084FF] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3" /> Listar Planilhas Novamente
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {directFeedback && (
                  <div className={`p-4 border rounded-lg text-xs leading-relaxed ${
                    directFeedback.success 
                      ? 'bg-green-50 border-green-100 text-[#22C55E] font-medium' 
                      : 'bg-red-50 border-red-100 text-red-800'
                  }`}>
                    {directFeedback.message}
                  </div>
                )}
              </div>

              {/* Right Panel: Feature Highlights */}
              <div className="lg:col-span-7 bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-headline-sm text-white text-sm">Vantagens do Sincronismo Direto</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Entenda os benefícios de utilizar o ERP integrado nativamente.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div className="p-4 bg-[#121418] border border-[#2B2F36] rounded-lg space-y-1.5">
                    <p className="font-bold text-white">🔄 Tempo Real de Verdade</p>
                    <p className="text-slate-400 leading-relaxed text-[11px]">Cada alteração de produto, cliente, venda ou fluxo financeiro é gravada na nuvem na hora, evitando perda de progresso.</p>
                  </div>
                  <div className="p-4 bg-[#121418] border border-[#2B2F36] rounded-lg space-y-1.5">
                    <p className="font-bold text-white">📊 Multi-Aba Estruturado</p>
                    <p className="text-slate-400 leading-relaxed text-[11px]">As tabelas são divididas de forma limpa em abas separadas, prontas para gerar gráficos e relatórios dinâmicos.</p>
                  </div>
                  <div className="p-4 bg-[#121418] border border-[#2B2F36] rounded-lg space-y-1.5">
                    <p className="font-bold text-white">🔓 Totalmente Editável</p>
                    <p className="text-slate-400 leading-relaxed text-[11px]">Modifique dados de materiais ou preço direto na planilha e simplesmente clique em "Importar Planilha" para sincronizar.</p>
                  </div>
                  <div className="p-4 bg-[#121418] border border-[#2B2F36] rounded-lg space-y-1.5">
                    <p className="font-bold text-white">🛡️ Segurança Google</p>
                    <p className="text-slate-400 leading-relaxed text-[11px]">Autenticação robusta gerida diretamente via provedor oficial Google OAuth, garantindo sigilo absoluto dos seus dados.</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-xs leading-relaxed text-amber-800">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900">Gerenciamento de Cache de Acesso</p>
                    <p className="text-amber-700 text-[11px] mt-0.5">Seguindo os mais rígidos protocolos de privacidade, as chaves temporárias de gravação ficam retidas estritamente na memória e expiram imediatamente ao fechar a janela ou ao sair da sessão.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* --- METHOD 2: LEGACY MANUAL APPS SCRIPT WEB APP CONNECTION --- */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
              {/* Form connection parameters (Left) */}
              <div className="lg:col-span-5 bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-6 shadow-sm space-y-6">
                <div className="pb-4 border-b border-[#2B2F36]">
                  <h3 className="font-headline-sm text-white text-sm">Vincular Planilha (Legado)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Sincronize todo o ERP com uma planilha ativa em tempo real usando Apps Script.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-label-md text-slate-400 text-xs uppercase block">Status de Sincronismo</label>
                    {syncConfig.connected ? (
                      <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                        <div className="text-xs font-medium">
                          <p className="font-bold text-white">Conexão Ativa (Legado)</p>
                          <p className="text-slate-400">Gravando dados no Google Sheets via URL Web App.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#121418] border border-[#2B2F36] rounded-lg flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-slate-400 rounded-full"></div>
                        <div className="text-xs">
                          <p className="font-bold text-slate-200">Offline (Banco Local)</p>
                          <p className="text-slate-400">Os dados estão sendo salvos apenas localmente neste navegador.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-label-md text-slate-400 text-xs uppercase">URL do App da Web (Google Sheets)</label>
                    <input 
                      type="text" 
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={gasUrl}
                      onChange={(e) => setGasUrl(e.target.value)}
                      disabled={syncConfig.connected}
                      className="w-full px-3 py-2 border border-[#2B2F36] rounded-lg text-xs outline-none bg-[#121418] focus:border-[#0084FF] disabled:bg-[#2B2F36] disabled:text-slate-400 font-mono"
                    />
                  </div>

                  {syncConfig.connected ? (
                    <button 
                      onClick={handleDisconnect}
                      className="w-full py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      Desconectar do Google Sheets
                    </button>
                  ) : (
                    <button 
                      onClick={handleConnectSync}
                      disabled={isSyncingLocal}
                      className="w-full py-2 bg-[#0084FF] hover:bg-[#0084FF]/90 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSyncingLocal ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Conectando e Sincronizando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" /> Conectar e Sincronizar
                        </>
                      )}
                    </button>
                  )}

                  {syncFeedback && (
                    <div className={`p-4 border rounded-lg text-xs leading-relaxed ${
                      syncFeedback.success 
                        ? 'bg-green-50 border-green-100 text-[#22C55E] font-medium' 
                        : 'bg-red-50 border-red-100 text-red-800'
                    }`}>
                      {syncFeedback.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Code Viewer Panel (Right) */}
              <div className="lg:col-span-7 bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-[#2B2F36]">
                  <h3 className="font-headline-sm text-white text-sm flex items-center gap-2">
                    <Code className="w-4.5 h-4.5 text-[#0084FF]" /> Código Google Apps Script
                  </h3>
                  <button 
                    onClick={handleCopyCode}
                    className="px-3 py-1 border border-[#2B2F36] hover:bg-[#121418] rounded text-[11px] font-bold text-slate-300 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    {codeCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar Código
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Cole este código no editor de scripts da sua planilha Google. Ele criará as abas necessárias automaticamente na primeira execução e conectará as requisições API de forma segura.
                </p>

                <div className="h-64 bg-slate-900 rounded-lg p-4 font-mono text-[10px] text-slate-300 overflow-y-auto whitespace-pre-wrap select-all">
                  {googleAppsScriptCode}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
