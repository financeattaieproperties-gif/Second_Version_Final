const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  ipcMain,
  nativeImage,
  shell,
} = require('electron');
const fs = require('fs');
const path = require('path');

const DEFAULT_URL = 'https://attaieproperties.com/callcenter/';
const userDataDir = app.getPath('userData');
const stateFile = path.join(userDataDir, 'window-state.json');
const configFile = path.join(userDataDir, 'config.json');

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let configWindow = null;
let tray = null;
let lastLoadError = '';

function normalizeServerUrl(input) {
  const raw = String(input || '').trim();
  if (!/^https?:\/\/[a-z0-9.-]+(?::\d+)?(?:\/.*)?$/i.test(raw)) {
    throw new Error('Enter a valid https:// or http:// Call Center URL.');
  }
  const parsed = new URL(raw);
  if (!parsed.pathname || parsed.pathname === '/') {
    parsed.pathname = '/callcenter/';
  } else if (!parsed.pathname.endsWith('/')) {
    parsed.pathname += '/';
  }
  return parsed.toString();
}

function loadConfig() {
  try {
    if (fs.existsSync(configFile)) {
      const parsed = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      if (parsed && parsed.serverUrl) {
        return { serverUrl: normalizeServerUrl(parsed.serverUrl) };
      }
    }
  } catch {
    // fallback to default
  }
  return { serverUrl: DEFAULT_URL };
}

function saveConfig(cfg) {
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.writeFileSync(configFile, JSON.stringify(cfg, null, 2));
}

function loadWindowState() {
  try {
    if (fs.existsSync(stateFile)) {
      return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    }
  } catch {
    // ignore
  }
  return { width: 1280, height: 820, maximized: false };
}

function saveWindowState(win) {
  try {
    const bounds = win.getBounds();
    fs.mkdirSync(userDataDir, { recursive: true });
    fs.writeFileSync(
      stateFile,
      JSON.stringify({ ...bounds, maximized: win.isMaximized() }),
    );
  } catch {
    // ignore
  }
}

function isAllowedInAppUrl(targetUrl, configuredUrl) {
  try {
    const u = new URL(targetUrl);
    if (u.protocol === 'file:') return true;
    const cfgHost = new URL(configuredUrl).hostname;
    if (u.hostname === cfgHost) return true;
    if (
      u.hostname.endsWith('.attaieproperties.com') ||
      u.hostname === 'attaieproperties.com' ||
      u.hostname.endsWith('.attaieproperties.af') ||
      u.hostname === 'attaieproperties.af'
    ) {
      return true;
    }
    if (
      u.hostname === 'accounts.google.com' ||
      u.hostname.endsWith('.firebaseapp.com') ||
      u.hostname.endsWith('.googleapis.com')
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function loadWorkspace() {
  if (!mainWindow) return;
  lastLoadError = '';
  const { serverUrl } = loadConfig();
  mainWindow.loadURL(serverUrl).catch(() => {
    // Handled by did-fail-load
  });
}

function openServerConfigModal() {
  if (configWindow) {
    configWindow.focus();
    return;
  }
  configWindow = new BrowserWindow({
    width: 460,
    height: 360,
    resizable: false,
    minimizable: false,
    maximizable: false,
    parent: mainWindow || undefined,
    modal: Boolean(mainWindow),
    title: 'Call Center Server Settings',
    backgroundColor: '#F7F8FA',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  configWindow.setMenuBarVisibility(false);
  configWindow.loadFile(path.join(__dirname, 'server-config.html'));
  configWindow.on('closed', () => {
    configWindow = null;
  });
}

function createTray(win) {
  const iconPath = path.join(__dirname, '..', 'resources', 'icon.png');
  const icon = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    : nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('Attaie Call Center');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Show / Hide',
        click: () => {
          if (win.isVisible()) win.hide();
          else {
            win.show();
            win.focus();
          }
        },
      },
      {
        label: 'Reload Workspace',
        click: () => loadWorkspace(),
      },
      {
        label: 'Switch Server URL…',
        click: () => openServerConfigModal(),
      },
      { type: 'separator' },
      { label: 'Quit Attaie Call Center', click: () => app.quit() },
    ]),
  );
  tray.on('double-click', () => {
    win.show();
    win.focus();
  });
}

function buildAppMenu() {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'Workspace',
        submenu: [
          {
            label: 'Reload Call Center',
            accelerator: 'CmdOrCtrl+R',
            click: () => loadWorkspace(),
          },
          {
            label: 'Switch Server URL…',
            click: () => openServerConfigModal(),
          },
          { type: 'separator' },
          { role: 'quit', label: 'Exit' },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
    ]),
  );
}

function registerIpc() {
  ipcMain.handle('cc:get-status', () => ({
    serverUrl: loadConfig().serverUrl,
    lastError: lastLoadError,
    version: app.getVersion(),
  }));

  ipcMain.handle('cc:set-server-url', (_event, url) => {
    const normalized = normalizeServerUrl(url);
    saveConfig({ serverUrl: normalized });
    if (configWindow) configWindow.close();
    loadWorkspace();
    return normalized;
  });

  ipcMain.handle('cc:retry', () => {
    loadWorkspace();
  });

  ipcMain.handle('cc:open-server-config', () => {
    openServerConfigModal();
  });

  ipcMain.handle('cc:close-config', () => {
    if (configWindow) configWindow.close();
  });
}

function createWindow() {
  const state = loadWindowState();
  const iconPath = path.join(__dirname, '..', 'resources', 'icon.png');

  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 960,
    minHeight: 640,
    show: false,
    title: 'Attaie Call Center Workspace',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#F7F8FA',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (state.maximized) mainWindow.maximize();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on(
    'did-fail-load',
    (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (!isMainFrame || errorCode === -3) return;
      lastLoadError = `${errorDescription || 'Connection failed'} (${errorCode}) · ${validatedURL}`;
      mainWindow.loadFile(path.join(__dirname, 'offline.html'));
    },
  );

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const { serverUrl } = loadConfig();
    if (
      url.startsWith('https://accounts.google.com') ||
      url.includes('.firebaseapp.com')
    ) {
      return { action: 'allow' };
    }
    if (isAllowedInAppUrl(url, serverUrl)) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const { serverUrl } = loadConfig();
    if (!isAllowedInAppUrl(url, serverUrl)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('close', () => saveWindowState(mainWindow));
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createTray(mainWindow);
  buildAppMenu();
  loadWorkspace();
}

app.whenReady().then(() => {
  registerIpc();
  createWindow();
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
