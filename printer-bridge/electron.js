import electron from 'electron';
const { app, BrowserWindow, Tray, Menu, nativeImage, dialog, shell } = electron;
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
      center: true,
      title: 'Filamento Cust',
      show: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    win.once('ready-to-show', () => {
      win.show();
      win.focus();
    });

    setTimeout(() => {
      if (!win.isDestroyed() && !win.isVisible()) {
        win.show();
        win.focus();
      }
    }, 500);

    // Make external links open in default browser (Chrome), but allow Firebase/Google Auth popups
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (
        url.includes('firebaseapp.com/__/auth/') || 
        url.includes('accounts.google.com') ||
        url.includes('oauth')
      ) {
        return { action: 'allow' };
      }
      shell.openExternal(url);
      return { action: 'deny' };
    });

    win.on('close', (event) => {
      if (!isQuitting) {
        event.preventDefault();
        win.hide();
        return false;
      }
    });

    const isDev = !app.isPackaged;

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
        checkUpdates();
      } catch (err) {}
    }
  });

  app.whenReady().then(() => {
    startBridgeServer();
    createWindow();

    // Configuração do atualizador automático
    autoUpdater.logger = console;
    autoUpdater.autoDownload = false; // Não baixa automaticamente sem confirmação do usuário
    autoUpdater.autoInstallOnAppQuit = false;
    
    // Inicia verificação de atualizações no GitHub
    try {
      checkUpdates(false);
    } catch (err) {
      console.error('Erro ao iniciar verificação de atualizações:', err);
    }

    // Cria um ícone válido 16x16 em base64 PNG para o Tray do Windows não falhar
    let icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVR42mP8z8AARAwMDGoM+DEjI6Mao5rBqIZRA0bBwGQA438GBgYF/8n1x6gBo2AAAK4iEAWz2wJDAAAAAElFTkSuQmCC');
    
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
      {
        label: 'Verificar Atualizações...',
        click: () => {
          checkUpdates(true);
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
          checkUpdates(false);
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

  let isManualCheck = false;
  let isDownloadingUpdate = false;

  // Função helper para verificar atualizações apenas se estiver em produção
  function checkUpdates(manual = false) {
    if (app.isPackaged) {
      try {
        isManualCheck = manual;
        autoUpdater.checkForUpdates();
      } catch (err) {
        console.error('Erro ao chamar checkForUpdates:', err);
      }
    } else {
      console.log('Modo de desenvolvimento: Pulando verificação de atualizações.');
      if (manual) {
        dialog.showMessageBox(mainWindow || undefined, {
          type: 'info',
          title: 'Atualizações (Modo Dev)',
          message: 'Você está no modo de desenvolvimento.',
          detail: 'A verificação e download de atualizações só ocorrem no aplicativo empacotado.'
        });
      }
    }
  }

  // Eventos de atualização
  autoUpdater.on('checking-for-update', () => {
    console.log('Verificando atualizações no GitHub...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Atualização encontrada:', info.version);
    
    let releaseDetails = '';
    if (info.releaseNotes) {
      if (typeof info.releaseNotes === 'string') {
        releaseDetails = info.releaseNotes;
      } else if (Array.isArray(info.releaseNotes)) {
        releaseDetails = info.releaseNotes.map(n => n.note).join('\n');
      }
    }

    const detailText = releaseDetails
      ? `Novidades da versão ${info.version}:\n\n${releaseDetails}\n\nDeseja baixar a atualização agora?`
      : `Uma nova versão (v${info.version}) do Filamento Cust está disponível para download (versão atual: v${app.getVersion()}).\n\nDeseja baixar a atualização agora?`;

    dialog.showMessageBox(mainWindow || undefined, {
      type: 'question',
      buttons: ['Atualizar Agora', 'Lembrar Mais Tarde'],
      defaultId: 0,
      cancelId: 1,
      title: 'Nova Versão Disponível',
      message: `Nova Versão Disponível: v${info.version}`,
      detail: detailText
    }).then((result) => {
      if (result.response === 0) {
        // Usuário confirmou explicitamente o Update
        console.log(`Usuário autorizou o download da versão v${info.version}.`);
        isDownloadingUpdate = true;
        
        dialog.showMessageBox(mainWindow || undefined, {
          type: 'info',
          title: 'Baixando Atualização',
          message: `Iniciando o download da versão v${info.version}...`,
          detail: 'O download está sendo executado em segundo plano. Você será notificado assim que estiver pronto para instalar.'
        });

        autoUpdater.downloadUpdate().catch((err) => {
          isDownloadingUpdate = false;
          console.error('Falha ao baixar atualização:', err);
          dialog.showErrorBox('Erro no Download', `Não foi possível baixar a atualização: ${err.message || err}`);
        });
      } else {
        console.log('Usuário optou por adiar a atualização.');
      }
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Nenhuma atualização disponível no momento.');
    if (isManualCheck) {
      dialog.showMessageBox(mainWindow || undefined, {
        type: 'info',
        title: 'Filamento Cust Atualizado',
        message: 'Você já está usando a versão mais recente!',
        detail: `Versão atual: v${app.getVersion()}`
      });
      isManualCheck = false;
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    isDownloadingUpdate = false;
    console.log('Atualização baixada com sucesso:', info.version);

    const dialogOpts = {
      type: 'info',
      buttons: ['Reiniciar e Instalar Agora', 'Instalar Depois'],
      defaultId: 0,
      cancelId: 1,
      title: 'Atualização Pronta',
      message: `A nova versão (v${info.version}) foi baixada com sucesso!`,
      detail: 'Deseja reiniciar o aplicativo agora para concluir a atualização?'
    };

    dialog.showMessageBox(mainWindow || undefined, dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });

  autoUpdater.on('error', (message) => {
    isDownloadingUpdate = false;
    console.error('Houve um erro ao verificar/atualizar o aplicativo:', message);
    if (message.message && message.message.includes('net::ERR_INTERNET_DISCONNECTED')) {
      console.log('Sem internet para buscar atualizações.');
      return;
    }
    if (isManualCheck) {
      dialog.showErrorBox('Erro na Verificação', message == null ? 'Erro desconhecido' : (message.stack || message).toString());
      isManualCheck = false;
    }
  });

  app.on('quit', () => {
    // Servidores express morrem junto com o processo
  });
}
