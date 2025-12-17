const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
    openPath: (path) => ipcRenderer.invoke('shell:openPath', path),
    showItemInFolder: (path) => ipcRenderer.invoke('shell:showItemInFolder', path),
    saveAndOpenPdf: (base64, fileName) => ipcRenderer.invoke('app:saveAndOpenPdf', base64, fileName),
    platform: process.platform,
});
