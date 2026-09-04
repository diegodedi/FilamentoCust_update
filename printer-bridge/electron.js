import { app, BrowserWindow, Tray, Menu, nativeImage, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow = null;
  let tray = null;
  let isQuitting = false;

  function createWindow() {
    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    win.once('ready-to-show', () => {
      win.show();
      win.focus();
    });

    win.on('close', (event) => {
      if (!isQuitting) {
        event.preventDefault();
        win.hide();
        return false;
      }
    });

    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      win.loadURL('http://localhost:3000');
    } else {
      // Must use loadFile so the origin is file:// which holds the user's previous data!
      win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow = win;
  }

  function startBridgeServer() {
    // Executa o servidor Express (backend) no processo principal do Electron
    import('./server.js').catch(err => {
      console.error('Falha ao iniciar o printer-bridge internamente:', err);
    });
  }

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Alguém tentou abrir uma segunda instância, nós focamos a janela da primeira
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show();
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      try {
        autoUpdater.checkForUpdatesAndNotify();
      } catch (err) {}
    }
  });

  app.whenReady().then(() => {
    startBridgeServer();
    createWindow();

    // Log para ajudar a debugar problemas no atualizador
    autoUpdater.logger = console;
    
    // Inicia verificação de atualizações no GitHub
    try {
      autoUpdater.checkForUpdatesAndNotify();
    } catch (err) {
      console.error('Erro ao iniciar verificação de atualizações:', err);
    }

    // Cria um ícone vazio por padrão se não tiver imagem (apenas para fallback)
    let icon = nativeImage.createEmpty();
    // Você pode substituir createEmpty() por nativeImage.createFromPath(...) se tiver um ícone real.
    
    tray = new Tray(icon);
    tray.setToolTip('Filamento Cust - Monitorando...');
    
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Abrir Aplicativo', 
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { type: 'separator' },
      { 
        label: 'Sair', 
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);
    
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
        try {
          autoUpdater.checkForUpdatesAndNotify();
        } catch (err) {}
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    // Não encerra o app ao fechar todas as janelas, 
    // pois ele deve continuar no System Tray
  });

  // Eventos de atualização
  autoUpdater.on('update-available', (info) => {
    console.log('Atualização encontrada:', info.version);
    dialog.showMessageBox({
      type: 'info',
      title: 'Atualização Encontrada',
      message: `Uma nova versão (${info.version}) foi encontrada!`,
      detail: 'O download está sendo feito em segundo plano. Você será notificado quando estiver pronto para instalar.'
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Reiniciar e Instalar', 'Mais tarde'],
      title: 'Atualização Pronta',
      message: `Uma nova versão (${info.version}) foi baixada.`,
      detail: info.releaseNotes || 'O aplicativo será reiniciado para aplicar a atualização.'
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (message) => {
    console.error('Houve um erro ao atualizar o aplicativo:', message);
    dialog.showErrorBox('Erro na atualização', message == null ? 'unknown' : (message.stack || message).toString());
  });

  app.on('quit', () => {
    // Servidores express morrem junto com o processo
  });
}
