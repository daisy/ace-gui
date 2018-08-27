const { app, BrowserWindow, electron, ipcMain, dialog, shell} = require('electron');
const path = require('path');
const menu = require('./menu');

//const ace = require('@daisy/ace-core');

let win;


function createWindow() {

  win = new BrowserWindow({ show: false });
  win.maximize();
  let sz = win.getSize();
  // open a window that's not quite full screen ... makes sense on mac, anyway
  win.setSize(Math.round(sz[0] * .75), Math.round(sz[1] * .85));
  win.setPosition(Math.round(sz[0] * .10), Math.round(sz[1] * .10));
  win.show();

  // bind functions to menu item selections
  // note that you can combine file open vs folder open on mac
  // else we show a separate menu item
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
    "quit": () => { quit(); }
  });

  win.loadURL('file://' + process.cwd() + '/app/index.html');
  win.webContents.openDevTools();


  win.on('closed', function () {
      win = null;
  });
  console.log("win created");
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  // we could enable this typical macos behavior if we wanted but not sure it makes sense
  /*if (process.platform !== 'darwin') {
      app.quit();
  }*/
  app.quit();
});

app.on('activate', function () {
  if (win === null) {
      createWindow();
  }
});

// events from renderer
ipcMain.on('epubFileReceived', (event, filepath, settings) => {
  runAce(filepath, settings);
});

// arbitrary restriction, just open files (not dirs) on win/linux
// otherwise we'd need a separate 'click to browse dir' item
// since you can't have a dialog support both file and dir unless you're on mac
// TODO test this
ipcMain.on('browseFileRequest', (event, arg) => {
  showFileOpenDialog(
    process.platform == 'darwin' ? ['openFile', 'openDirectory'] : ['openFile'],
    [{name: 'EPUB', extensions: ['epub']}, {name: 'All Files', extensions: ['*']}]);
});

// this event fires whenever react renders Main
// it's a little brute force to un/enable menu items each time
// so .. TODO set up report add/close events
// this could also help with adding a list of reports to a submenu at runtime
// although electron doesn't have great ways of doing that
ipcMain.on("onAppRender", (event, arg) => {
  // arg is the number of open reports
  arg == 0 ? menu.onSplashScreen() : menu.onReportScreen();

});
// use the standard OS dialog to browse for a file or folder
function showFileOpenDialog(properties, filters) {
  dialog.showOpenDialog(
    { properties: properties,
      filters: filters
    },
    (filenames) => {
      if (filenames != undefined) {
        win.webContents.send('fileSelected', filenames[0]);
      }
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
  // TODO use the 'open file' dialog instead -- this works but is a little weird
  dialog.showOpenDialog(
    {title: "Select a folder", properties: ['openDirectory', 'createDirectory'], buttonLabel: "Save"},
    (filenames) => {
      if (filenames != undefined) {
        // TODO obvs
        win.webContents.send('newMessage', "Pretending to save something");
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
  dialog.showMessageBox({"message": "Ace vNext", "detail": "DAISY Consortium 2018"});
}


function launchWebpage(url) {
  shell.openExternal(url);
}

function quit() {
  app.quit();
}

// run Ace on an EPUB file or folder
function runAce(filepath, preferences) {
  let msg = `Pretending to run Ace on ${filepath}`;
  win.webContents.send('newMessage', msg);
  console.log(msg);
  console.log(`Saving report? ${preferences.save}`);
  console.log(`Subdirs? ${preferences.organize}`);
  console.log(`Overwrite? ${preferences.overwrite}`);
  console.log(`Outdir ${preferences.outdir}`);
}
