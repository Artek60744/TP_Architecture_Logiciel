const { app, BrowserWindow, ipcMain, desktopCapturer, nativeImage, BrowserView, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs').promises;

app.whenReady().then(() => {

  // BrowserWindow initiate the rendering of the angular toolbar
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (app.isPackaged){
    win.loadFile('dist/browser-template/browser/index.html');
  }else{
    win.loadURL('http://localhost:4200')
  }


  // Create a BrowserView to render the secondary web content
  const view = new BrowserView();
  // Attach the BrowserView to the main window
  win.setBrowserView(view);

  // Always fit the web rendering with the electron windows
  function fitViewToWin() {
    const winBounds = win.getBounds(); // Récupère les dimensions de la fenêtre
    view.setBounds({ 
      x: 0,
       y: 80,
        width: winBounds.width,
         height: winBounds.height
    });
  }

    win.webContents.openDevTools({ mode: 'detach' });

  // Register events handling from the toolbar
  ipcMain.on('toogle-dev-tool', () => {
    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    } else {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  ipcMain.on('go-back', () => {
    // Prefer the newer navigationHistory API when available
    if (view.webContents.navigationHistory && typeof view.webContents.navigationHistory.canGoBack === 'function') {
      if (view.webContents.navigationHistory.canGoBack()) {
        view.webContents.navigationHistory.goBack();
      }
      return;
    }
    // Fallback for older Electron versions
    if (view.webContents.canGoBack && view.webContents.canGoBack()) {
      view.webContents.goBack();
    }
  });

  ipcMain.handle('can-go-back', () => {
    if (view.webContents.navigationHistory && typeof view.webContents.navigationHistory.canGoBack === 'function') {
      return view.webContents.navigationHistory.canGoBack();
    }
    return !!(view.webContents.canGoBack && view.webContents.canGoBack());
  });

  ipcMain.on('go-forward', () => {
    if (view.webContents.navigationHistory && typeof view.webContents.navigationHistory.canGoForward === 'function') {
      if (view.webContents.navigationHistory.canGoForward()) {
        view.webContents.navigationHistory.goForward();
      }
      return;
    }
    // Fallback for older Electron versions
    if (view.webContents.canGoForward && view.webContents.canGoForward()) {
      view.webContents.goForward();
    }
  });

  ipcMain.handle('can-go-forward', () => {
    if (view.webContents.navigationHistory && typeof view.webContents.navigationHistory.canGoForward === 'function') {
      return view.webContents.navigationHistory.canGoForward();
    }
    return !!(view.webContents.canGoForward && view.webContents.canGoForward());
  });

  ipcMain.on('refresh', () => {
    view.webContents.reload();
  });

  ipcMain.handle('go-to-page', (event, url) => {
    return view.webContents.loadURL(url);
  });


  ipcMain.handle('current-url', () => {
    return view.webContents.getURL();
  });

  // Gestion de l'événement de navigation vers l'accueil
  ipcMain.on('navigate-home', (event) => {
    view.webContents.loadURL('https://amiens.unilasalle.fr');
  });

  //Register events handling from the main windows
  win.once('ready-to-show', () => {
    fitViewToWin();
    view.webContents.loadURL('https://amiens.unilasalle.fr');
  });

  win.on('resize', () => {
    fitViewToWin();
  });


  // Listen for navigation events to sync the address bar
  view.webContents.on('did-start-navigation', (event, url, isInPlace, isMainFrame) => {
    if (isMainFrame) {
      // Send the new URL to the renderer process to update the address bar
      win.webContents.send('navigation-started', url);
    }
  });

  ipcMain.handle('capture-screen', async () => {
    // Obtenir les sources d'écran (screen, window)
    const sources = await desktopCapturer.getSources({ types: ['screen', 'window'], thumbnailSize: { width: 1920, height: 1080 }});
    // Pour simplifier, tu peux retourner la première source (ou ouvrir un UI de sélection)
    const src = sources[0];
    if (!src) throw new Error('Aucune source trouvée');
    // src.thumbnail est un NativeImage
    const pngBuffer = src.thumbnail.toPNG();
    // Convertir en data URL
    const dataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
    return dataUrl;
  });

  // Save a data URL to disk using a save dialog
  ipcMain.handle('save-screenshot', async (event, dataUrl) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save screenshot',
        defaultPath: `screenshot-${timestamp}.png`,
        filters: [
          { name: 'PNG Image', extensions: ['png'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      if (canceled || !filePath) return { saved: false };
      const base64 = (typeof dataUrl === 'string' && dataUrl.includes(',')) ? dataUrl.split(',')[1] : dataUrl;
      const buffer = Buffer.from(base64, 'base64');
      await fs.writeFile(filePath, buffer);
      return { saved: true, path: filePath };
    } catch (err) {
      console.error('Error saving screenshot:', err);
      return { saved: false, error: String(err) };
    }
  });

})
