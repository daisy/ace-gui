const { app, BrowserWindow, Menu, electron, ipcMain, dialog} = require('electron');
const path = require('path');
const url = require('url');
const ace = require('@daisy/ace-core');
const logger = require('@daisy/ace-logger');
const fs = require('fs-extra');
const tmp = require('tmp');

require('electron-debug')();

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Check EPUB...',
        click() { showFileOpenDialog(); }
      },
      {
        label: 'Save Report...',
        enabled: false,
        id: 'save-report',
        click() { saveReport(); }
      },
      {
        label: 'Close Report',
        enabled: false,
        id: 'close-report',
        click() { closeReport(); }
      },
      {
        role: 'quit'
      }
    ]
  },
  {
    role: 'windowMenu'
  },
  {
    role: 'help',
    submenu: [
        {
          label: 'Learn More',
          click () { require('electron').shell.openExternal('http://daisy.github.io/ace') }
        }
      ]
  }
];

let win;
let reportDir;

function createWindow() {
  win = new BrowserWindow({show: false});
  win.maximize();
  let sz = win.getSize();
  // open a window that's approx 75% of full screen ... makes sense on mac, anyway
  win.setSize(Math.round(sz[0] * .65), Math.round(sz[1] * .75));
  win.show();
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  // TODO be platform-savvy about menus

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: "file:",
    slashes: true
  }));
}
app.on('ready', createWindow);

// events from renderer
ipcMain.on('epubFileReceived', (event, arg) => {
  console.log("Received file: " + arg);
  runAce(arg);
});
ipcMain.on('fileBrowseRequest', (event, arg) => {
    showFileOpenDialog();
});

// the user has chosen a file to check; now run ace
function runAce(filepath) {
  // the approach we use here is to store the report in a tmpdir
  // if the user decides to save it, then copy to their directory
  // the other (better) approaches are
  // 1. always save the report in a user-specified dir
  // and/or
  // 2. transform json to html only upon saving (if that xform function were exposed by Ace)
  tmp.setGracefulCleanup();
  reportDir = tmp.dirSync({ unsafeCleanup: false }).name;

  logger.initLogger();
  ace(filepath, {
    cwd: process.cwd(),
    outdir: reportDir,
    tmpdir: false,
    verbose: false,
    silent: false,
    force: true,
    jobId: '',
  })
  .then((jobData) => {
    //dirtyhack(path.join(reportDir, 'report.html'));
    console.log("Ace is done");
    loadReport(path.join(reportDir, 'report.html'));
  })
  .catch((err) => {
    if (err && err.message) {
      console.log(`Error ${err.message}`);
      win.webContents.send("aceError", err.message);
    }
  });
}
function loadReport(filepath) {

  win.loadURL(url.format({
    pathname: filepath,
    protocol: "file:",
    slashes: true
  }));
  enableMenuItem('save-report', true);
  enableMenuItem('close-report', true);
}

function showFileOpenDialog() {
  dialog.showOpenDialog(
    {properties: ['openFile', 'openDirectory'],
    filters: [{name: 'EPUB', extensions: ['epub']}, {name: 'All Files', extensions: ['*']}]},
    (filenames) => {
      // send to the renderer to update the status
      // of course, the renderer just sends the runAce request back to main to actually run it
      // i know. it's just proof of concept at this point. a view framework would be nice.
      if (filenames != undefined) win.webContents.send("requestToRunAce", filenames[0]);
    }
  );
}

function saveReport() {
  // TODO how to save to a directory in the save dialog
  // this dialog always seems to include a save-as filename field
/*  dialog.showSaveDialog({title: "Select a folder", showsTagField: false, message: "Select a folder"},
  (foldername) => {
    fs.copy(reportDir, foldername, function (err) {
      if (err) {
        console.error(err);
      } else {
        console.log("success!");
      }
    });
  });*/
  // TODO this works but is a little weird
  dialog.showOpenDialog(
    {title: "Select a folder", properties: ['openDirectory', 'createDirectory'], buttonLabel: "Save"},
    (filenames) => {
      if (filenames != undefined) {
        fs.copy(reportDir, filenames[0], function (err) {
          if (err) {
            console.error(err);
          } else {
            console.log("Saved report");
          }
        });
      }
    }
  );
}

// just go back to the start screen
function closeReport() {
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: "file:",
    slashes: true
  }));
  enableMenuItem('save-report', false);
  enableMenuItem('close-report', false);
}

function enableMenuItem(id, isEnabled) {
  let menu = Menu.getApplicationMenu();
  let menuItem = menu.getMenuItemById(id);
  menuItem.enabled = isEnabled;
}

// this was an attempt to make the jquery tabs work in electron
// the result of this function they show up but the content appears mangled
// without using this function, jQuery is not recognized at all by the browser window
/*
function dirtyhack(reportpath) {
  const DOMParser = require('xmldom-alpha').DOMParser;
  const XMLSerializer = require('xmldom-alpha').XMLSerializer;

  const content = fs.readFileSync(reportpath).toString();
  const doc = new DOMParser().parseFromString(content, 'application/xhtml');
  const elms = doc.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'script');

  elms[0].setAttribute("onload", "window.$ = window.jQuery = module.exports;");
  const modreport = new XMLSerializer().serializeToString(doc);
  fs.writeFileSync(reportpath, modreport);
}
*/
