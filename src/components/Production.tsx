import { PRINTER_BRIDGE_URL, checkBridgeHealth } from "../config";
import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { usePrinters } from '../context/PrinterContext';
import { Printer, Server, Activity, Box, Play, CheckCircle2, AlertCircle, Clock, Battery, ServerCrash, Plus, X, Terminal } from 'lucide-react';
import { PrintJob } from '../types';
export const Production: React.FC = () => {
  const { printers, printJobs, addPrinter } = useDb();
  const { activeStates, bridgeOnline, checkBridgeStatus } = usePrinters();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPrinter, setNewPrinter] = useState({ name: 'Creality Hi', model: 'Creality Hi', ip: '192.168.1.105', port: 7125, monitoringEnabled: true });
  const [testStatus, setTestStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [testLog, setTestLog] = useState<string[]>([]);

  
  const handleTestConnection = async () => {
    setTestStatus('TESTING');
    setTestLog([
      `[${new Date().toLocaleTimeString()}] Testando Printer Bridge...`
    ]);
    
    try {
      // 1. Health check
      try {
        const healthRes = await fetch(PRINTER_BRIDGE_URL + '/health', { signal: AbortSignal.timeout(3000) });
        if (!healthRes.ok) throw new Error('Health check status not OK');
        setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✓ Bridge acessível em localhost:3001`]);
        setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✓ Health check OK`]);
      } catch (err: any) {
        setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✕ Não foi possível conectar ao Bridge local`]);
        setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Motivo: ${err.message}`]);
        setTestStatus('ERROR');
        return;
      }

      setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Testando impressora em ${newPrinter.ip}...`]);

      // 2. Printer test
      const res = await fetch(PRINTER_BRIDGE_URL + '/printers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: newPrinter.ip, model: newPrinter.model })
      });
      
      const data = await res.json();
      
      if (data.logs && Array.isArray(data.logs)) {
        setTestLog(prev => [...prev, ...data.logs]);
      }
      
      if (data.success) {
        setNewPrinter(prev => ({ ...prev, protocol: data.protocol }));
        setTestStatus('SUCCESS');
      } else {
        setTestStatus('ERROR');
      }
    } catch (e: any) {
      setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Erro fatal na chamada do teste.`]);
      setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Motivo: ${e.message}`]);
      setTestStatus('ERROR');
    }
  };


  const handleSavePrinter = () => {
    addPrinter({
      name: newPrinter.name,
      model: newPrinter.model,
      ip: newPrinter.ip,
      port: newPrinter.port,
      protocol: (newPrinter as any).protocol || 'MOONRAKER',
      monitoringEnabled: newPrinter.monitoringEnabled
    });
    setIsAddModalOpen(false);
    setTestStatus('IDLE');
    setTestLog([]);
  };

  // Reverse sort print jobs by startedAt

  const sortedJobs = [...printJobs].sort((a, b) => 
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: PrintJob['status'] | 'IDLE' | 'OFFLINE') => {
    switch (status) {
      case 'PRINTING': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'COMPLETED': return 'text-green-500 bg-green-50 border-green-200';
      case 'PAUSED': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'ERROR':
      case 'CANCELLED': return 'text-red-500 bg-red-50 border-red-200';
      case 'OFFLINE': return 'text-slate-400 bg-[#121418] border-[#2B2F36]';
      default: return 'text-slate-400 bg-[#2B2F36] border-[#2B2F36]';
    }
  };

  const getStatusIcon = (status: PrintJob['status'] | 'IDLE' | 'OFFLINE') => {
    switch (status) {
      case 'PRINTING': return <Play className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4" />;
      case 'ERROR': return <AlertCircle className="w-4 h-4" />;
      case 'OFFLINE': return <ServerCrash className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
                  <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <Printer className="w-8 h-8 text-[#0084FF]" />
              Monitoramento e Produção
            </h1>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${bridgeOnline ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${bridgeOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              BRIDGE {bridgeOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>
          <p className="text-slate-400 mt-1">
            Acompanhe suas impressoras e histórico de jobs em tempo real.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#0084FF] hover:bg-[#0084FF]/90 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Impressora
        </button>
      </header>

      {!bridgeOnline && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Server className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-red-400 font-medium">BRIDGE OFFLINE</h3>
              <p className="text-red-400/80 text-sm mt-0.5">Agente local não encontrado.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={async () => {
                const btn = document.getElementById('btn-check-bridge');
                if (btn) btn.innerHTML = 'Verificando...';
                await checkBridgeStatus();
                if (btn) btn.innerHTML = 'Verificar novamente';
              }} 
              id="btn-check-bridge"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/10"
            >
              Verificar novamente
            </button>
            <div className="relative group">
              <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-500/20">
                Como iniciar
              </button>
              <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-[#1e2330] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <h4 className="font-medium text-white mb-2 text-sm">Como iniciar o Printer Bridge:</h4>
                <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
                  <li>Abra a pasta do projeto no seu computador</li>
                  <li>Acesse a pasta <code className="text-red-300">printer-bridge</code></li>
                  <li>Execute o arquivo <code className="text-red-300">start-bridge.bat</code></li>
                  <li>Mantenha a janela do terminal aberta</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Printers */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" /> Impressoras Ativas
        </h2>
        
        {printers.length === 0 ? (
          <div className="bg-[#1C1F24] rounded-2xl p-8 border border-[#2B2F36] text-center">
            <Printer className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Nenhuma impressora configurada.</p>
            <p className="text-slate-400 text-sm mt-1">Acesse as Configurações para adicionar uma impressora.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {printers.map(printer => {
              const state = activeStates[printer.id] || { 
                status: printer.monitoringEnabled ? 'OFFLINE' : 'IDLE', 
                filename: '', 
                progress: 0, 
                timeElapsed: 0, 
                timeRemaining: 0 
              };

              const isOffline = state.status === 'OFFLINE';
              const isPrinting = state.status === 'PRINTING';
              
              let statusText = state.status;
              let statusColor = 'text-slate-400';
              let statusBg = 'bg-slate-500/10 border-slate-500/20';

              if (!bridgeOnline) {
                statusText = 'BRIDGE OFFLINE';
                statusColor = 'text-red-500';
                statusBg = 'bg-red-500/10 border-red-500/20';
              } else if (isOffline) {
                statusText = 'OFFLINE';
                statusColor = 'text-slate-400';
                statusBg = 'bg-slate-500/10 border-slate-500/20';
              } else if (isPrinting) {
                statusText = 'IMPRIMINDO';
                statusColor = 'text-[#0084FF]';
                statusBg = 'bg-[#0084FF]/10 border-[#0084FF]/20';
              } else if (state.status === 'PAUSED') {
                statusText = 'PAUSADA';
                statusColor = 'text-amber-500';
                statusBg = 'bg-amber-500/10 border-amber-500/20';
              } else if (state.status === 'COMPLETED') {
                statusText = 'CONCLUÍDA';
                statusColor = 'text-emerald-500';
                statusBg = 'bg-emerald-500/10 border-emerald-500/20';
              } else if (state.status === 'IDLE') {
                statusText = 'OCIOSA';
                statusColor = 'text-emerald-500';
                statusBg = 'bg-emerald-500/10 border-emerald-500/20';
              }

              return (
                <div key={printer.id} className="bg-[#1C1F24] rounded-2xl shadow-sm border border-[#2B2F36] p-6 flex flex-col relative overflow-hidden">
                  {/* Progress Bar Background */}
                  {isPrinting && (
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-[#0084FF] transition-all duration-1000 ease-linear"
                      style={{ width: `${(state.progress * 100)}%` }}
                    />
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-white">{printer.name}</h3>
                      <p className="text-xs text-slate-400">{printer.ip}:{printer.port}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1 ${getStatusColor(state.status)}`}>
                      {getStatusIcon(state.status)}
                      {state.status}
                    </div>
                  </div>

                  {!printer.monitoringEnabled ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic py-4">
                      Monitoramento Desativado
                    </div>
                  ) : isOffline ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-4">
                      Tentando conectar...
                    </div>
                  ) : (
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Arquivo Atual</label>
                        <p className="text-sm font-medium text-white truncate" title={state.filename}>
                          {state.filename || 'Nenhum arquivo'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#121418] p-3 rounded-lg border border-[#2B2F36]">
                          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Decorrido
                          </label>
                          <p className="text-sm font-bold font-mono text-slate-200 mt-1">
                            {formatTime(state.timeElapsed)}
                          </p>
                        </div>
                        <div className="bg-[#121418] p-3 rounded-lg border border-[#2B2F36]">
                          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                            <Battery className="w-3 h-3" /> Restante
                          </label>
                          <p className="text-sm font-bold font-mono text-slate-200 mt-1">
                            {formatTime(state.timeRemaining)}
                          </p>
                        </div>
                      </div>
                      
                      {isPrinting && (
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-[#2B2F36] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#0084FF] rounded-full transition-all duration-1000"
                              style={{ width: `${state.progress * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-300 font-mono">
                            {(state.progress * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* History */}
      <section className="space-y-4 pt-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Box className="w-5 h-5 text-[#0084FF]" /> Histórico de Produção
        </h2>

        <div className="bg-[#1C1F24] rounded-2xl shadow-sm border border-[#2B2F36] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121418]/80 border-b border-[#2B2F36] text-xs uppercase tracking-wider text-slate-400">
                  <th className="p-4 font-bold">Data</th>
                  <th className="p-4 font-bold">Impressora</th>
                  <th className="p-4 font-bold">Arquivo / Produto</th>
                  <th className="p-4 font-bold">Duração</th>
                  <th className="p-4 font-bold">Consumo Real</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Estoque</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {sortedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Nenhum histórico de impressão encontrado.
                    </td>
                  </tr>
                ) : (
                  sortedJobs.map(job => (
                    <tr key={job.id} className="hover:bg-[#121418] transition-colors">
                      <td className="p-4 text-slate-300 whitespace-nowrap">
                        {new Date(job.startedAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 font-medium text-white">
                        {job.printerName}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-white">{job.productName || 'Desconhecido'}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[200px]" title={job.fileName}>
                          {job.fileName}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        {formatTime(job.duration)}
                      </td>
                      <td className="p-4 text-slate-300">
                        {job.filamentConsumption?.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {job.filamentConsumption.map((f, i) => (
                              <span key={i} className="text-xs">
                                {(f.consumedWeight != null ? f.consumedWeight : (f.plannedWeight || 0)).toFixed(1)}g
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {job.inventoryApplied ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                            <CheckCircle2 className="w-3 h-3" /> Contabilizado (+{job.quantityProduced})
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">Nenhum</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add Printer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1F24] rounded-2xl border border-[#2B2F36] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#2B2F36] flex justify-between items-center bg-[#121418]">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0084FF]" />
                Adicionar Impressora
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nome da Impressora</label>
                  <input 
                    type="text" 
                    value={newPrinter.name}
                    onChange={e => setNewPrinter({...newPrinter, name: e.target.value})}
                    className="w-full bg-[#121418] border border-[#2B2F36] text-white rounded-lg px-4 py-2 outline-none focus:border-[#0084FF]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Modelo</label>
                  <input 
                    type="text" 
                    value={newPrinter.model}
                    onChange={e => setNewPrinter({...newPrinter, model: e.target.value})}
                    className="w-full bg-[#121418] border border-[#2B2F36] text-white rounded-lg px-4 py-2 outline-none focus:border-[#0084FF]" 
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Endereço IP</label>
                    <input 
                      type="text" 
                      value={newPrinter.ip}
                      onChange={e => setNewPrinter({...newPrinter, ip: e.target.value})}
                      className="w-full bg-[#121418] border border-[#2B2F36] text-white rounded-lg px-4 py-2 outline-none focus:border-[#0084FF]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Porta</label>
                    <input 
                      type="number" 
                      value={newPrinter.port}
                      onChange={e => setNewPrinter({...newPrinter, port: Number(e.target.value)})}
                      className="w-full bg-[#121418] border border-[#2B2F36] text-white rounded-lg px-4 py-2 outline-none focus:border-[#0084FF]" 
                    />
                  </div>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-[#2B2F36] bg-[#121418]">
                  <input 
                    type="checkbox" 
                    checked={newPrinter.monitoringEnabled}
                    onChange={e => setNewPrinter({...newPrinter, monitoringEnabled: e.target.checked})}
                    className="w-4 h-4 rounded bg-[#1C1F24] border-[#3A3F47] text-[#0084FF] focus:ring-[#0084FF]/50" 
                  />
                  <div>
                    <p className="text-sm font-bold text-white">Monitoramento Automático</p>
                    <p className="text-xs text-slate-400">Ativa a telemetria e o desconto automático de filamento</p>
                  </div>
                </label>
              </div>

              {/* Diagnostic Log */}
              <div className="mt-6 bg-[#000000] rounded-lg border border-[#2B2F36] p-4 min-h-[120px] font-mono text-xs">
                <div className="text-slate-500 mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Printer Connection Log
                </div>
                {testLog.length === 0 ? (
                  <div className="text-slate-600 italic">Nenhum teste de conexão realizado.</div>
                ) : (
                  <div className="space-y-1">
                    {testLog.map((log, i) => (
                      <div key={i} className={`${log.includes('Erro') || log.includes('Falha') ? 'text-red-400' : log.includes('sucesso') ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {log}
                      </div>
                    ))}
                  </div>
                )}
                {testStatus === 'TESTING' && <div className="text-[#0084FF] mt-2 animate-pulse">Testando...</div>}
                {testStatus === 'SUCCESS' && <div className="text-emerald-400 font-bold mt-2">✓ Conectada</div>}
                {testStatus === 'ERROR' && <div className="text-red-400 font-bold mt-2">✕ Não foi possível conectar</div>}
              </div>
            </div>

            <div className="p-4 border-t border-[#2B2F36] bg-[#121418] flex items-center justify-between">
              <button 
                onClick={handleTestConnection}
                disabled={testStatus === 'TESTING'}
                className="px-4 py-2 bg-[#2B2F36] hover:bg-[#3A3F47] text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
              >
                {testStatus === 'TESTING' ? 'Testando...' : 'Testar Conexão'}
              </button>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSavePrinter}
                  disabled={testStatus === 'TESTING' || !newPrinter.name || !newPrinter.ip}
                  className="px-4 py-2 bg-[#0084FF] hover:bg-[#0084FF]/90 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                >
                  Salvar Impressora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
