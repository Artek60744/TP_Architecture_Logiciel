const { app, BrowserWindow, ipcMain, desktopCapturer, nativeImage, BrowserView, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs').promises;

app.whenReady().then(() => {

  // BrowserWindow initiate the rendering of the angular toolbar
  const win = new BrowserWindow({
    width: 1080,
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
    try {
      // Capturer le contenu de la vue web (BrowserView)
      const image = await view.webContents.capturePage();
      
      // Vérifier si l'image a été capturée
      if (!image) {
        throw new Error('Échec de la capture de la page web');
      }

      // Convertir l'image en format PNG puis en data URL
      const pngBuffer = image.toPNG();
      const dataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
      
      return dataUrl;
    } catch (error) {
      console.error('Erreur lors de la capture de la page:', error);
      throw error;
    }
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
