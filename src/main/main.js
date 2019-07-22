const path = require('path');
const { app, BrowserWindow, webContents, ipcMain } = require('electron');

import MenuBuilder from './menu';

import {initPersistentStore} from './store-persist';

import {checkLatestVersion} from '../shared/helpers/versionCheck';

require('electron-debug')();

const {store, storeSubscribe, storeUnsubscribe} = initPersistentStore();

import {startKnowledgeBaseServer, stopKnowledgeBaseServer, closeKnowledgeBaseWindows} from './kb';

// const prepareLaunch = require('@daisy/ace-axe-runner-electron/lib/init').prepareLaunch;
import { prepareLaunch } from '@daisy/ace-axe-runner-electron/lib/init';
const CONCURRENT_INSTANCES = 4; // same as the Puppeteer Axe runner
prepareLaunch(ipcMain, CONCURRENT_INSTANCES);

function openAllDevTools() {
  for (const wc of webContents.getAllWebContents()) {
      // if (wc.hostWebContents &&
      //     wc.hostWebContents.id === mainWin.webContents.id) {
      // }
      wc.openDevTools({ mode: "detach" });
  }
}

function openTopLevelDevTools() {
  const bw = BrowserWindow.getFocusedWindow();
  if (bw) {
      bw.webContents.openDevTools({ mode: "detach" });
  } else {
      const arr = BrowserWindow.getAllWindows();
      arr.forEach((bww) => {
          bww.webContents.openDevTools({ mode: "detach" });
      });
  }
}

let win;
function createWindow() {

  win = new BrowserWindow(
    {
      show: false,
      webPreferences: {
          allowRunningInsecureContent: false,
          contextIsolation: false,
          nodeIntegration: true,
          nodeIntegrationInWorker: false,
          sandbox: false,
          webSecurity: true,
          webviewTag: false,
      }
    }
  );
  win.maximize();
  let sz = win.getSize();
  const sz0 = sz[0];
  const sz1 = sz[1];
  win.unmaximize();
  // open a window that's not quite full screen ... makes sense on mac, anyway
  win.setSize(Math.min(Math.round(sz0 * .75),1200), Math.min(Math.round(sz1 * .85), 800));
  // win.setPosition(Math.round(sz[0] * .10), Math.round(sz[1] * .10));
  win.setPosition(Math.round(sz0*0.5-win.getSize()[0]*0.5), Math.round(sz1*0.5-win.getSize()[1]*0.5));
  win.show();

  setTimeout(() => {
    checkLatestVersion(win);
  }, 1000);

  const menuBuilder = new MenuBuilder(win, store);
  menuBuilder.buildMenu(win);

  const cb = () => {
    menuBuilder.storeHasChanged();
  };
  storeSubscribe(cb);
  
  win.loadURL(`file://${__dirname}/index.html`);

  win.on('closed', function () {
      
      storeUnsubscribe(cb);

      win = null;
      
      // closeKnowledgeBaseWindows();

      // // about box
      // const arr = BrowserWindow.getAllWindows();
      // arr.forEach((bw) => {
      //     bw.close();
      // });

      // the above triggers window-all-closed event => app quit

      app.quit();
  });
}

// Is enabled automatically when screen reader is detected
// app.setAccessibilitySupportEnabled(true);

app.on('ready', () => {
  let isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
  const kbRootPath = isDev ? path.join(process.cwd(), "kb") : path.join(__dirname, "kb");
  startKnowledgeBaseServer(kbRootPath).then(() => {
    createWindow();
  }).catch((err) => {
    console.log(err);
    createWindow();
  });
});
app.on('quit', () => {
  stopKnowledgeBaseServer();
});

app.on('window-all-closed', function () {
  // we could enable this typical macos behavior if we wanted but not sure it makes sense
  /*if (process.platform !== 'darwin') {
      quit();
  }*/
  // app.quit();
});

app.on('activate', function () {
  if (win === null) {
      createWindow();
  }
});

app.on('before-quit', function() {
});
