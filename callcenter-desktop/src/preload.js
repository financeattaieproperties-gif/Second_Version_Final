const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('callcenterDesktop', {
  getStatus: () => ipcRenderer.invoke('cc:get-status'),
  setServerUrl: (url) => ipcRenderer.invoke('cc:set-server-url', url),
  retry: () => ipcRenderer.invoke('cc:retry'),
  openServerConfig: () => ipcRenderer.invoke('cc:open-server-config'),
  closeConfig: () => ipcRenderer.invoke('cc:close-config'),
});
