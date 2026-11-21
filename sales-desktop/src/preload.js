const { contextBridge, ipcRenderer } = require('electron');

const desktopBridge = {
  getStatus: () => ipcRenderer.invoke('cc:get-status'),
  setServerUrl: (url) => ipcRenderer.invoke('cc:set-server-url', url),
  testConnection: (url) => ipcRenderer.invoke('cc:test-connection', url),
  retry: () => ipcRenderer.invoke('cc:retry'),
  openServerConfig: () => ipcRenderer.invoke('cc:open-server-config'),
  closeConfig: () => ipcRenderer.invoke('cc:close-config'),
};

contextBridge.exposeInMainWorld('salesDesktop', desktopBridge);
contextBridge.exposeInMainWorld('callcenterDesktop', desktopBridge);
contextBridge.exposeInMainWorld('attaieDesktop', desktopBridge);
