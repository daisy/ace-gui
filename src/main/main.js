const { app, BrowserWindow} = require('electron');
import MenuBuilder from './menu';

import {initPersistentStore} from './store-persist';

require('electron-debug')();

const {store, storeSubscribe, storeUnsubscribe} = initPersistentStore();

let win;

function createWindow() {

  win = new BrowserWindow({ show: false });
  win.maximize();
  let sz = win.getSize();
  // open a window that's not quite full screen ... makes sense on mac, anyway
  win.setSize(Math.min(Math.round(sz[0] * .75),1200), Math.min(Math.round(sz[1] * .85), 800));
  // win.setPosition(Math.round(sz[0] * .10), Math.round(sz[1] * .10));
  win.setPosition(Math.round(sz[0]*0.5-win.getSize()[0]*0.5), Math.round(sz[1]*0.5-win.getSize()[1]*0.5));
  win.show();

  const menuBuilder = new MenuBuilder(win, store);
  menuBuilder.buildMenu();

  const cb = () => {
    menuBuilder.storeHasChanged();
  };
  storeSubscribe(cb);
  
  win.loadURL(`file://${__dirname}/index.html`);

  win.on('closed', function () {
      win = null;
      storeUnsubscribe(cb);
  });
}

// Is enabled automatically when screen reader is detected
// app.setAccessibilitySupportEnabled(true);

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  // we could enable this typical macos behavior if we wanted but not sure it makes sense
  /*if (process.platform !== 'darwin') {
      quit();
  }*/
  app.quit();
});

app.on('activate', function () {
  if (win === null) {
      createWindow();
  }
});

app.on('before-quit', function() {
});
