const path = require('path');
const fs = require('fs');

const { dialog, app, BrowserWindow, webContents, ipcMain, Menu } = require('electron');

import MenuBuilder from './menu';

import {initPersistentStore} from './store-persist';

import {checkLatestVersion} from '../shared/helpers/versionCheck';

const {store, storeSubscribe, storeUnsubscribe} = initPersistentStore();

import {
  PROCESSING_TYPE,
  addMessage,
} from '../shared/actions/app';

import {startKnowledgeBaseServer, stopKnowledgeBaseServer, closeKnowledgeBaseWindows} from './kb';

// const prepareLaunch = require('@daisy/ace-axe-runner-electron/lib/init').prepareLaunch;
import { prepareLaunch } from '@daisy/ace-axe-runner-electron/lib/init';

import { localizer } from './../shared/l10n/localize';
const { localize } = localizer;

const isDev = process && process.env && (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true');

let win;

const singleInstanceLock = process.platform !== 'darwin' && app.requestSingleInstanceLock()
if (!singleInstanceLock) {
  app.quit();
} else {

function handleStartupFileCheck(filepath) {
  app.whenReady().then(() => {
    function askCheckEPUB() {
      if (store.getState() && store.getState().app && store.getState().app.processing && store.getState().app.processing[PROCESSING_TYPE.ACE]){ // check already running (for example, "file open..." event)
        const p = store.getState().app.processing[PROCESSING_TYPE.ACE]; // store.getState().app.inputPath;
        store.dispatch(addMessage(localize("message.runningace", {inputPath: `${p} (... ${filepath})`, interpolation: { escapeValue: false }})));

        dialog.showMessageBox({
          win,
          type: "warning",
          buttons: [
              localize("versionCheck.yes")
          ],
          defaultId: 0,
          cancelId: 0,
          title: localize('menu.checkEpub'),
          message: localize('message.runningace'),
          detail: `${p} (... ${filepath})`,
          noLink: true,
          normalizeAccessKeys: false,
        }, (i) => {
        });

        return;
      }

      dialog.showMessageBox({
        win,
        type: "question",
        buttons: [
            localize("versionCheck.yes"),
            localize("versionCheck.no"),
        ],
        defaultId: 0,
        cancelId: 1,
        title: localize('menu.checkEpub'),
        message: localize('menu.checkEpub'),
        detail: filepath,
        noLink: true,
        normalizeAccessKeys: false,
      }, (i) => {
          if (i === 0) {
            // menuBuilder.runAceInRendererProcess(filepath);
            win.webContents.send('RUN_ACE', filepath);
          }
      });
    }

    function checkWin() {
      if (win) {
        setTimeout(() => {
          askCheckEPUB();
        }, 200);
      } else {
        setTimeout(() => {
          checkWin();
        }, 600);
      }
    }
    checkWin();
  });
}

if (process.platform === 'darwin') {
  app.on('will-finish-launching', () => {
    app.on('open-file', (ev, filepath) => {
      ev.preventDefault();
      handleStartupFileCheck(filepath);
    });
  });
} else {
  function handleArgv(argv) {
      if (argv) {
        const args = argv.slice(1);
        if (args[0]) {
            if (fs.existsSync(args[0])) {
              handleStartupFileCheck(args[0]);
            }
        }
      }
  }

  app.on('second-instance', (event, argv, workingDirectory) => {
      if (win) {
          if (win.isMinimized()) {
            win.restore();
          }
          win.focus();
      }
    handleArgv(argv);
  });

  handleArgv(process.argv);
}

const CONCURRENT_INSTANCES = 4; // same as the Puppeteer Axe runner
prepareLaunch(ipcMain, CONCURRENT_INSTANCES);

// function openAllDevTools() {
//   for (const wc of webContents.getAllWebContents()) {
//       // if (wc.hostWebContents &&
//       //     wc.hostWebContents.id === mainWin.webContents.id) {
//       // }
//       wc.openDevTools({ mode: "detach" });
//   }
// }

// function openTopLevelDevTools() {
//   const bw = BrowserWindow.getFocusedWindow();
//   if (bw) {
//       bw.webContents.openDevTools({ mode: "detach" });
//   } else {
//       const arr = BrowserWindow.getAllWindows();
//       arr.forEach((bww) => {
//           bww.webContents.openDevTools({ mode: "detach" });
//       });
//   }
// }

function createWindow() {

  win = new BrowserWindow(
    {
      show: false,
      webPreferences: {
          allowRunningInsecureContent: false,
          contextIsolation: false,
          devTools: isDev,
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
  
  if (isDev) {

    // require('electron-debug')(); // also see electron-react-devtools
  
    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS,
      REDUX_DEVTOOLS, // also see redux-devtools-extension
    } = require("electron-devtools-installer");
  
    [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS].forEach((extension) => {
      installExtension(extension)
          .then((name) => console.log("Added Extension: ", name))
          .catch((err) => console.log("An error occurred: ", err));
    });
    
    win.openDevTools();

    win.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element', // NOT LOCALIZED (debug/dev only)
          click: () => {
            win.inspectElement(x, y);
          }
        }
      ]).popup(win);
    });
  }

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
  // The Electron app is always run from the ./app/main.js folder which contains a subfolder copy of the KB
  // ... so this is not needed (and __dirname works in ASAR and non-ASAR mode)
  // const isNotPackaged = process && process.env && process.env.ACE_IS_NOT_PACKAGED === 'true';
  // const kbRootPath = isNotPackaged ? path.join(process.cwd(), "kb") : path.join(__dirname, "kb");
  const kbRootPath = path.join(__dirname, "kb");

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

} // singleInstanceLock
