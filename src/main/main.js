const path = require('path');
const fs = require('fs');
const tmp = require('tmp');
const ace = require('@daisy/ace-core');
const { app, BrowserWindow, electron, ipcMain, dialog, shell, clipboard} = require('electron');
import MenuBuilder from './menu';
import configureStore from './../shared/store/configureStore';
import {
  setReady,
  runAce,
  openReport,
  closeReport,
  addMessage
} from './../shared/actions/app';

const store = configureStore(undefined, 'main');
let win;

function createWindow() {
  win = new BrowserWindow({ show: false });
  win.maximize();
  let sz = win.getSize();
  // open a window that's not quite full screen ... makes sense on mac, anyway
  win.setSize(Math.round(sz[0] * .75), Math.round(sz[1] * .85));
  win.setPosition(Math.round(sz[0] * .10), Math.round(sz[1] * .10));
  win.show();

  const menuBuilder = new MenuBuilder(win, store);
  menuBuilder.buildMenu();

  win.loadURL(`file://${__dirname}/index.html`);

  win.on('closed', function () {
      win = null;
  });
}

app.setAccessibilitySupportEnabled(true);

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  // we could enable this typical macos behavior if we wanted but not sure it makes sense
  /*if (process.platform !== 'darwin') {
      quit();
  }*/
  quit();
});

app.on('activate', function () {
  if (win === null) {
      createWindow();
  }
});

app.on('before-quit', function() {
  // TODO persist anything that needs persisting
});
