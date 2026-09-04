const CrealityClient = require('./CrealityClient');
const CrealityParser = require('./CrealityParser');

class PrinterSession {
  constructor(id, ip, protocol) {
    this.id = id;
    this.ip = ip;
    this.protocol = (protocol || 'MOONRAKER').toUpperCase();
    
    this.state = {
      connected: false,
      protocol: this.protocol,
      status: 'OFFLINE',
      filename: '',
      progress: 0,
      timeElapsed: 0,
      timeRemaining: 0,
      jobId: '',
      printerModel: null,
      filamentWeight: 0,
      lastUpdate: new Date().toISOString()
    };

    this.client = null;
    this.pollInterval = null;
    
    this.start();
  }

  start() {
    if (this.protocol === 'WEBSOCKET') {
      this.client = new CrealityClient(this.id, this.ip);
      
      this.client.on('connected', () => {
        this.updateState({ connected: true, status: 'IDLE' });
      });

      this.client.on('disconnected', () => {
        this.updateState({ connected: false, status: 'OFFLINE' });
      });

      this.client.on('message', (msg) => {
        const parsed = CrealityParser.parse(msg);
        this.updateState({
          ...parsed,
          connected: true
        });
      });

      this.client.connect();
    } else if (this.protocol === 'MOONRAKER') {
      this.pollInterval = setInterval(() => this.pollMoonraker(), 2000);
      this.pollMoonraker();
    }
  }

  stop() {
    if (this.client) {
      this.client.disconnect();
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.updateState({ connected: false, status: 'OFFLINE' });
  }

  updateState(newState) {
    const prevStatus = this.state.status;
    this.state = { ...this.state, ...newState, lastUpdate: new Date().toISOString() };
    
    if (prevStatus !== this.state.status) {
      console.log(`[Printer ${this.id}] Status changed: ${prevStatus} -> ${this.state.status}`);
      if (this.state.status === 'COMPLETED') {
        console.log(`[Printer ${this.id}] Print completed: ${this.state.filename}`);
      }
    }
  }

  async pollMoonraker() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const url = `http://${this.ip}:7125/printer/objects/query?print_stats&display_status&virtual_sdcard&exclude_object`;
      
      // Dynamic import for fetch if using node 18+, which has it globally. 
      // If node <18, you'd need node-fetch, but standard environment usually is Node 18+
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      if (data && data.result && data.result.status) {
        const stats = data.result.status.print_stats || {};
        const display = data.result.status.display_status || {};
        const vSdcard = data.result.status.virtual_sdcard || {};
        const excludeObject = data.result.status.exclude_object || {};
        
        let mappedStatus = 'IDLE';
        const rawState = (stats.state || '').toLowerCase();
        
        // Map common Creality/Moonraker states to our standard states
        switch (rawState) {
          case 'printing':
            mappedStatus = 'PRINTING';
            break;
          case 'paused':
            mappedStatus = 'PAUSED';
            break;
          case 'error':
            mappedStatus = 'ERROR';
            break;
          case 'complete':
            mappedStatus = 'COMPLETED';
            break;
          case 'standby':
            mappedStatus = 'IDLE';
            break;
          default:
            // Fallback for custom states
            if (rawState.length > 0) {
               mappedStatus = rawState.toUpperCase();
            }
        }

        // Fallback: If state is generic but progress is moving, force PRINTING
        let progress = (vSdcard.progress) || 0;
        if (progress > 0 && progress < 1 && mappedStatus !== 'PAUSED') {
            mappedStatus = 'PRINTING';
        }

        let rawFilename = stats.filename || '';
        let normalizedFilename = rawFilename.replace(/\.(gcode|3mf|gco)$/i, '').trim();

        // Calculate plate quantity using exclude_object objects array
        let plateQuantity = 1;
        if (excludeObject.objects && Array.isArray(excludeObject.objects) && excludeObject.objects.length > 0) {
           plateQuantity = excludeObject.objects.length;
        }

        // Fetch file metadata if we have a filename and it changed
        if (rawFilename && rawFilename !== this._lastRawFilename) {
          this._lastRawFilename = rawFilename;
          try {
            const metaUrl = `http://${this.ip}:7125/server/files/metadata?filename=${encodeURIComponent(rawFilename)}`;
            console.log(`[Printer ${this.id}] Fetching metadata from ${metaUrl}`);
            const metaRes = await fetch(metaUrl, { signal: controller.signal });
            if (metaRes.ok) {
              const metaData = await metaRes.json();
              console.log(`[Printer ${this.id}] Metadata result:`, JSON.stringify(metaData.result));
              
              let weight = 0;
              if (metaData && metaData.result) {
                if (metaData.result.filament_weight_total) weight = metaData.result.filament_weight_total;
                else if (metaData.result.filament_weight) {
                  if (Array.isArray(metaData.result.filament_weight)) {
                    weight = metaData.result.filament_weight.reduce((a,b)=>a+b, 0);
                  } else {
                    weight = metaData.result.filament_weight;
                  }
                } else if (metaData.result.estimated_material_print_weight) {
                   weight = metaData.result.estimated_material_print_weight;
                }
              }
              
              if (weight > 0) {
                this.state.filamentWeight = weight;
                console.log(`[Printer ${this.id}] Extracted filament weight from metadata: ${weight}g`);
              }
            }
          } catch (e) {
            console.error(`[Printer ${this.id}] Error fetching metadata:`, e.message);
          }
        }

        // Always override/update with the ACTUAL filament used from print_stats (if available)
        // This is dynamic and provides the exact real consumption.
        if (stats.filament_used > 0) {
          const lengthMm = stats.filament_used;
          const volumeCm3 = (Math.PI * Math.pow(1.75 / 2, 2) * lengthMm) / 1000;
          const weightGrams = volumeCm3 * 1.24; // Default to PLA density
          
          if (weightGrams > 0) {
             this.state.filamentWeight = weightGrams;
          }
        }

        if (!rawFilename) {
          this._lastRawFilename = null;
          this.state.filamentWeight = 0;
        }

        this.updateState({
          connected: true,
          status: mappedStatus,
          filename: normalizedFilename,
          progress: progress,
          timeElapsed: stats.print_duration || 0,
          timeRemaining: 0,
          jobId: normalizedFilename ? `${rawFilename}-${this.id}` : null,
          plateQuantity: plateQuantity,
          filamentWeight: this.state.filamentWeight
        });
      }
    } catch (err) {
      // Avoid excessive logging
      this.updateState({ connected: false, status: 'OFFLINE' });
    }
  }
}

module.exports = PrinterSession;
