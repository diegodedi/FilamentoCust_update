export const PRINTER_BRIDGE_URL = 'http://localhost:3001';

export const checkBridgeHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${PRINTER_BRIDGE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (res.ok) {
      return { status: 'ONLINE', message: 'Bridge online' };
    } else {
      return { status: 'HTTP_ERROR', message: `HTTP Error: ${res.status}` };
    }
  } catch (err: any) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      return { status: 'TIMEOUT', message: 'Timeout ao conectar no Bridge local (porta 3001).' };
    } else if (err.message && err.message.includes('Failed to fetch')) {
      return { status: 'CONNECTION_REFUSED', message: 'O Bridge não está rodando ou bloqueio de rede (CORS).' };
    }
    return { status: 'NETWORK_ERROR', message: err.message || 'Erro de rede desconhecido' };
  }
};
