const express = require('express');
const cors = require('cors');
const net = require('net');
const WebSocket = require('ws');
const PrinterSession = require('./PrinterSession');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Store active printer sessions
const sessions = new Map();

// Helper for TCP port testing
async function testTcp(ip, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2500);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { socket.destroy(); resolve(false); });
    socket.connect(port, ip);
  });
}

// 1. HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'filamento-cust-printer-bridge',
    version: '2.0.0',
    uptime: process.uptime(),
    printersConnected: sessions.size
  });
});

// 2. DIAGNOSTIC TEST
app.post('/printers/test', async (req, res) => {
  const { ip, model } = req.body;
  if (!ip) return res.status(400).json({ error: 'O IP é obrigatório.' });

  const logs = [];
  logs.push(`[${new Date().toLocaleTimeString()}] Iniciando teste de conexão para: ${model || 'Impressora'}`);
  logs.push(`[${new Date().toLocaleTimeString()}] IP Alvo: ${ip}`);

  try {
    let success = false;
    let protocol = null;

    // Test Moonraker (Port 7125) FIRST (Better API)
    logs.push(`[${new Date().toLocaleTimeString()}] Testando interface Moonraker (Porta 7125)...`);
    const isMoonrakerOpen = await testTcp(ip, 7125);
    
    if (isMoonrakerOpen) {
      logs.push(`[${new Date().toLocaleTimeString()}] ✓ Porta 7125 (Moonraker) acessível.`);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const mrRes = await fetch(`http://${ip}:7125/printer/info`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (mrRes.ok) {
           logs.push(`[${new Date().toLocaleTimeString()}] ✓ Resposta HTTP Moonraker recebida.`);
           protocol = 'MOONRAKER';
           success = true;
        }
      } catch (e) {
         logs.push(`[${new Date().toLocaleTimeString()}] ✕ Falha na API Moonraker: ${e.message}`);
      }
    } else {
      logs.push(`[${new Date().toLocaleTimeString()}] ✕ Porta 7125 não responde.`);
    }

    if (!success) {
      // Test WebSocket (Port 9999) - Default for older Creality Boxes
      logs.push(`[${new Date().toLocaleTimeString()}] Testando interface WebSocket (Porta 9999)...`);
      const isWsOpen = await testTcp(ip, 9999);
      
      if (isWsOpen) {
        logs.push(`[${new Date().toLocaleTimeString()}] ✓ Porta 9999 está acessível.`);
        
        // Perform an actual WebSocket connection test
        await new Promise((resolve) => {
          let ws;
          try {
            ws = new WebSocket(`ws://${ip}:9999`);
            const timeout = setTimeout(() => {
              if (ws) ws.close();
              logs.push(`[${new Date().toLocaleTimeString()}] ✕ Timeout ao conectar no WebSocket.`);
              resolve();
            }, 3000);

            ws.on('open', () => {
              clearTimeout(timeout);
              logs.push(`[${new Date().toLocaleTimeString()}] ✓ WebSocket conectado com sucesso.`);
              protocol = 'WebSocket';
              success = true;
              
              // Wait for one message or close after 2s
              const msgTimeout = setTimeout(() => {
                logs.push(`[${new Date().toLocaleTimeString()}] ✓ Nenhuma mensagem em 2s, mas a conexão foi bem sucedida.`);
                ws.close();
                resolve();
              }, 2000);
              
              ws.on('message', (data) => {
                clearTimeout(msgTimeout);
                logs.push(`[${new Date().toLocaleTimeString()}] ✓ Mensagem recebida da impressora.`);
                ws.close();
                resolve();
              });
            });

            ws.on('error', (err) => {
              logs.push(`[${new Date().toLocaleTimeString()}] ✕ Erro no WebSocket: ${err.message}`);
            });

            ws.on('close', () => {
               resolve();
            });
          } catch (err) {
             logs.push(`[${new Date().toLocaleTimeString()}] ✕ Falha ao instanciar WebSocket: ${err.message}`);
             resolve();
          }
        });
      } else {
        logs.push(`[${new Date().toLocaleTimeString()}] ✕ WebSocket indisponível na porta 9999 (Connection refused/timeout).`);
      }
    }

    if (success) {
      logs.push(`[${new Date().toLocaleTimeString()}] ✓ Protocolo identificado com sucesso: ${protocol}`);
      return res.json({ success: true, protocol, logs });
    } else {
      logs.push(`[${new Date().toLocaleTimeString()}] Resultado: Não foi possível estabelecer comunicação real com a impressora.`);
      return res.json({ success: false, logs });
    }

  } catch (error) {
    logs.push(`[${new Date().toLocaleTimeString()}] Erro inesperado: ${error.message}`);
    return res.json({ success: false, logs });
  }
});

// 3. REGISTER PRINTER
app.post('/printers', async (req, res) => {
  let { id, ip, protocol } = req.body;
  if (!id || !ip) return res.status(400).json({ error: 'id and ip are required' });
  
  if (protocol && protocol.toUpperCase() === 'WEBSOCKET') {
     // Force upgrade to Moonraker if available, it's way more reliable
     try {
        const mrRes = await fetch(`http://${ip}:7125/printer/info`, { signal: AbortSignal.timeout(1500) });
        if (mrRes.ok) protocol = 'MOONRAKER';
     } catch(e) {}
  }

  if (sessions.has(id)) {
    sessions.get(id).stop();
    sessions.delete(id);
  }

  const session = new PrinterSession(id, ip, protocol || 'MOONRAKER');
  sessions.set(id, session);
  
  res.json({ success: true });
});

app.delete('/printers/:id', (req, res) => {
  const { id } = req.params;
  if (sessions.has(id)) {
    sessions.get(id).stop();
    sessions.delete(id);
  }
  res.json({ success: true });
});

// 4. GET PRINTER STATUS
app.get('/printers/:id/status', (req, res) => {
  const { id } = req.params;
  const session = sessions.get(id);
  if (!session) return res.status(404).json({ error: 'Printer not registered' });
  res.json(session.state);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`[Bridge] Servidor iniciado. Escutando na porta ${PORT}`);
  console.log(`[Bridge] Endpoint de saúde: http://localhost:${PORT}/health`);
  console.log(`===================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Bridge] A porta ${PORT} já está em uso.`);
  } else {
    console.error(`[Bridge] Erro no servidor:`, err);
  }
});
