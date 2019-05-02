const path = require('path');
const { app, BrowserWindow, webContents} = require('electron');

import MenuBuilder from './menu';
import configureStore from './../shared/store/configureStore';

require('electron-debug')();

import {startKnowledgeBaseServer, stopKnowledgeBaseServer, closeKnowledgeBaseWindows} from './kb';

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

const store = configureStore(undefined, 'main');
let win;
function createWindow() {
  win = new BrowserWindow({ show: false });
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

  const menuBuilder = new MenuBuilder(win, store);
  menuBuilder.buildMenu(win);

  win.loadURL(`file://${__dirname}/index.html`);

  win.on('closed', function () {
      win = null;
      app.quit();

      // closeKnowledgeBaseWindows();

      // // about box
      // const arr = BrowserWindow.getAllWindows();
      // arr.forEach((bw) => {
      //     bw.close();
      // });

      // will trigger window-all-closed event => app quit
  });
}

app.setAccessibilitySupportEnabled(true);

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
  // TODO persist anything that needs persisting
});
