const { app, BrowserWindow, electron, ipcMain, dialog, shell, clipboard} = require('electron');
const path = require('path');
const menu = require('./menu');
const fs = require('fs');
const tmp = require('tmp');

const ace = require('@daisy/ace-core');
const PrefsPath = "/userprefs.json";

let win;
let isReportOpen = false;

function createWindow() {
  win = new BrowserWindow({ show: false });
  win.maximize();
  let sz = win.getSize();
  // open a window that's not quite full screen ... makes sense on mac, anyway
  win.setSize(Math.round(sz[0] * .75), Math.round(sz[1] * .85));
  win.setPosition(Math.round(sz[0] * .10), Math.round(sz[1] * .10));
  win.show();

  // bind functions to menu item selections
  menu.init("Ace", {
    "checkEpub": () => { showFileOpenDialog(
      process.platform == 'darwin' ? ['openFile', 'openDirectory'] : ['openFile'],
      [{name: 'EPUB', extensions: ['epub']}, {name: 'All Files', extensions: ['*']}]);
    },
    "openReport": () => {showFileOpenDialog(
      ['openFile'],
      [{name: 'Ace Report', extensions: ['json']}, {name: 'All Files', extensions: ['*']}]);
    },
    "saveReport": () => { saveReport(); },
    "closeReport": () => { closeReport(); },
    "fullScreen": () => { toggleFullScreen(); },
    "learnMore": () => { launchWebpage('http://daisy.github.io/ace'); },
    "reportIssue": () => { launchWebpage('http://github.com/DAISY/ace-gui/issues'); },
    "knowledgeBase": () => {launchWebpage('http://kb.daisy.org/publishing/'); },
    "checkEpubFolder": () => { showFileOpenDialog(
      ['openDirectory'],
      {name: 'All Files', extensions: ['*']});
    },
    "about": () => { showAbout(); },
    "quit": () => { quit(); },
    "gotoSummary": () => { win.webContents.send("goto", 0); },
    "gotoViolations": () => { win.webContents.send("goto", 1); },
    "gotoMetadata": () => { win.webContents.send("goto", 2); },
    "gotoOutlines": () => { win.webContents.send("goto", 3); },
    "gotoImages": () => { win.webContents.send("goto", 4); },
    "showInFinder": () => { showInFinder(); },
    "copyMessages": () => {copyMessages(); }
  });

  menu.onSplashScreen();
  let prefs = JSON.parse(fs.readFileSync(__dirname + PrefsPath));
  if (prefs.outdir == "") prefs.outdir = tmp.dirSync({ unsafeCleanup: true }).name;

  // there are a few ways of sending properties over to react. using a query string is one.
  // https://github.com/electron/electron/issues/6504
  win.loadURL(`file://${__dirname}/index.html?overwrite=${prefs.overwrite}&organize=${prefs.organize}&outdir=${prefs.outdir}`);

  // attempting to detect dev mode
  if (process.defaultApp) win.webContents.openDevTools();

  win.on('closed', function () {
      win = null;
  });
  console.log("win created");
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
  savePreferences();
});

// events from renderer
ipcMain.on('fileReceived', (event, filepath) => {
  processInputFile(filepath);
});

ipcMain.on('browseFileRequest', (event, arg) => {
  showFileOpenDialog(
    process.platform == 'darwin' ? ['openFile', 'openDirectory'] : ['openFile'],
    [{name: 'EPUB', extensions: ['epub']}, {name: 'All Files', extensions: ['*']}]);
});

ipcMain.on('browseFolderRequest', (event, arg) => {
  showFileOpenDialog(
    process.platform == 'darwin' ? ['openFile', 'openDirectory'] : ['openDirectory'],
    [{name: 'All Files', extensions: ['*']}]);
});

ipcMain.on("onOpenReport", (event, arg) => {
  isReportOpen = true;
  menu.onReportScreen();
});

ipcMain.on("onCloseReport", (event, arg) => {
  isReportOpen = false;
  menu.onSplashScreen();
});

function processInputFile(filepath) {
  // crude way to check filetype
  if (path.extname(filepath) == '.epub') {
    runAce(filepath);
  }
  else if (path.extname(filepath) == '.json') {
    win.webContents.send('openReport', filepath);
  }
  else {
    // don't accept any other files, however...
    if (fs.statSync(filepath).isFile()) {
      win.webContents.send('error', `File type not supported ${filepath}`);
    }
    // ...it might be an unpacked EPUB directory; let Ace decide
    else {
      runAce(filepath);
    }
  }
}
// use the standard OS dialog to browse for a file or folder
function showFileOpenDialog(properties, filters) {
  dialog.showOpenDialog(
    { properties: properties,
      filters: filters
    },
    (filenames) => {
      if (filenames != undefined) {
        processInputFile(filenames[0]);
      }
    }
  );
}

function closeReport() {
  win.webContents.send('closeReport');
}

function toggleFullScreen() {
  if (!win || !win.isVisible()) {
    return;
  }

  win.setFullScreen(!win.isFullScreen());
  menu.onToggleFullScreen(win.isFullScreen());
}

function showAbout() {
  dialog.showMessageBox({"message": "Ace Beta", "detail": "DAISY Consortium 2018"});
}

function showInFinder() {
  win.webContents.send('reportFilepathRequest');
  ipcMain.once('reportFilepathRequestReply', (event, filepath) => {
    if (filepath != '') shell.showItemInFolder(filepath);
  });
}

function launchWebpage(url) {
  shell.openExternal(url);
}

// put the messages on the clipboard
function copyMessages() {
  win.webContents.send("messagesRequest");
  ipcMain.once("messagesRequestReply", (event, messages) => {

    let msgstr = messages.join('\n');
    console.log(msgstr);
    clipboard.writeText(msgstr);
  });
}

function quit() {
  app.quit();
}

// run Ace on an EPUB file or folder
function runAce(filepath) {
  win.webContents.send("preferencesRequest");
  ipcMain.once('preferencesRequestReply', (event, prefs) => {

    let outdir = prepareOutdir(filepath, prefs);
    if (outdir == '') return;

    win.webContents.send('processing', filepath);
    menu.onProcessing();

    ace(filepath, {outdir})
    .then(() => win.webContents.send('message', 'Ace check complete'))
    .then(() => win.webContents.send('openReport', outdir+'/report.json'))
    .catch(error => {
      win.webContents.send('error', `${JSON.stringify(error)}`);
      isReportOpen ? menu.onReportScreen() : menu.onSplashScreen();
    });
  });
}

function prepareOutdir(filepath, prefs) {
  let outdir = prefs.outdir;
  if (prefs.organize) {
    outdir = path.join(outdir, path.parse(filepath).name);
  }
  if (!prefs.overwrite) {
    const overrides = ['report.json', 'report.html', 'data', 'js']
      .map(file => path.join(outdir, file))
      .filter(fs.existsSync);
    if (overrides.length > 0) {
      let msg = `Output directory is not empty. Running Ace would overwrite the following files or directories:
      ${overrides.map(file => `  - ${file}`).join('\n')}. Enable the option 'Overwrite' to allow this.`;
      win.webContents.send('error', msg);
      return '';
    }
  }
  return outdir;
}

function savePreferences() {
  win.webContents.send("preferencesRequest");
  ipcMain.once('preferencesRequestReply', (event, prefs) => {
    console.log("Saving preferences");
    let data = JSON.stringify(prefs);
    console.log(data);
    fs.writeFileSync(__dirname + PrefsPath, data);
  });
}