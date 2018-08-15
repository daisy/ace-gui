const { app, BrowserWindow, electron, ipcMain } = require('electron');
const path = require('path');
//const ace = require('@daisy/ace-core');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({ width: 1360, height: 800 });
  mainWindow.loadURL('file://' + process.cwd() + '/app/renderer/public/index.html');
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
      mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
      app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
      createWindow();
  }
});

ipcMain.on('rendererProcessEvent', (event, arg) => {
  console.log(`Received event in main process: ${arg}`);
  mainWindow.webContents.send('mainProcessEvent', 'Message from main');
});
