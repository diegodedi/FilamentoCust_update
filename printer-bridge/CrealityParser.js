class CrealityParser {
  static parse(message) {
    // A typical Creality Box/Hi message over WS
    // Example format: {"mc": "...", "data": {"print_status": 1, "filename": "Sans.gcode", "print_progress": 45, ...}}
    // It can vary, we try to deduce the standard state
    
    let status = 'IDLE';
    let filename = '';
    let progress = 0;
    let timeElapsed = 0;
    let timeRemaining = 0;
    let jobId = '';

    // Adjust based on real Creality Hi JSON payload structure
    // If we have 'print' or 'status' fields
    const data = message.data || message;
    
    // Status mapping (approximated for generic creality web)
    // 0: IDLE, 1: PRINTING, 2: PAUSED, 3: COMPLETED, 4: ERROR, etc
    // or string states
    const rawStatus = typeof data.state === 'string' ? data.state.toLowerCase() : 
                      typeof data.print_status !== 'undefined' ? data.print_status : null;

    if (rawStatus === 'printing' || rawStatus === 1) status = 'PRINTING';
    else if (rawStatus === 'paused' || rawStatus === 2) status = 'PAUSED';
    else if (rawStatus === 'complete' || rawStatus === 3) status = 'COMPLETED';
    else if (rawStatus === 'cancelled' || rawStatus === 'stop' || rawStatus === 4) status = 'CANCELLED';
    else if (rawStatus === 'error' || rawStatus === 5) status = 'ERROR';
    else status = 'IDLE';

    filename = data.filename || data.print_file || data.name || '';
    progress = data.progress || data.print_progress || 0;
    if (progress > 1) progress = progress / 100; // normalize to 0-1 if it was 0-100
    
    timeElapsed = data.print_duration || data.elapsed_time || data.time_printed || 0;
    timeRemaining = data.time_remaining || data.time_left || 0;
    if (timeRemaining === 0 && progress > 0 && timeElapsed > 0) {
      timeRemaining = (timeElapsed / progress) - timeElapsed;
    }

    // Normalize filename
    let normalizedFilename = '';
    if (filename) {
      normalizedFilename = filename.replace(/\.(gcode|3mf|gco)$/i, '').trim();
    }

    jobId = filename ? `${filename}-${data.start_time || '0'}` : '';

    return {
      status,
      filename: normalizedFilename,
      progress,
      timeElapsed,
      timeRemaining,
      jobId
    };
  }
}

module.exports = CrealityParser;
