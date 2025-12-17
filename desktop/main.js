const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
// const isDev = process.env.BROWSER === 'none' ? true : false; // Rudimentary check, improved via connection
const isDev = !app.isPackaged;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Secure defaults
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  console.log(`Loading: ${startUrl}`);
  mainWindow.loadURL(startUrl).catch(err => console.error("Failed to load URL:", err));

  // Open the DevTools in dev mode
  if (isDev) {
    // Wait a bit for React to load
    setTimeout(() => {
        mainWindow.webContents.openDevTools();
    }, 1000);
  }

  // Create Menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Reports Folder',
          click: async () => {
            // TBD: Where are reports saved? Assuming downloads or specific folder
            // For now, open Downloads
            await shell.openPath(app.getPath('downloads'));
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: () => {
                    dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'About DataLens',
                        message: 'DataLens DPDP Compliance Tool',
                        detail: 'Version 1.0.0\nElectron Shell for DataLens Next.js App'
                    });
                }
            }
        ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => (mainWindow = null));
}

// IPC Handlers
ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

ipcMain.handle('shell:openPath', async (event, path) => {
    return await shell.openPath(path);
});

ipcMain.handle('shell:showItemInFolder', async (event, path) => {
    return shell.showItemInFolder(path);
});

ipcMain.handle('app:saveAndOpenPdf', async (event, base64Data, fileName) => {
    const downloadsPath = app.getPath('downloads');
    const filePath = path.join(downloadsPath, fileName);
    const buffer = Buffer.from(base64Data, 'base64');

    try {
        fs.writeFileSync(filePath, buffer);
        await shell.openPath(filePath);
        return { success: true, path: filePath };
    } catch (e) {
        console.error("Failed to save PDF", e);
        return { success: false, error: e.message };
    }
});

// App Lifecycle
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
