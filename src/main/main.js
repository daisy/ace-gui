const path = require('path');
const fs = require('fs');
const util = require("util");

const { dialog, app, BrowserWindow, ipcMain, Menu, session } = require('electron');

const SESSION_PARTITION = "persist:ace";

import MenuBuilder from './menu';

import {initPersistentStore} from './store-persist';

import {checkLatestVersion} from './versionCheck';

import {setupFileDialogEvents} from './fileDialogs';

import { eventEmmitter } from '../shared/main-renderer-events';

import {
  addMessage,
} from '../shared/actions/common';

import {startKnowledgeBaseServer, stopKnowledgeBaseServer, closeKnowledgeBaseWindows} from './kb';

// const prepareLaunch = require('@daisy/ace-axe-runner-electron/lib/init').prepareLaunch;
import { prepareLaunch } from '@daisy/ace-axe-runner-electron/lib/init';

import { localizer } from './../shared/l10n/localize';
const { localize } = localizer;

const isDev = process && process.env && (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true');

if (isDev) {
  console.log(util.inspect(process.versions, { colors: true, depth: null, compact: false }));

  // this does not seem to work, Electron/Chromium bug?
  // instead, modify package.json "start:dev:main:electron" by appending "--lang=es" (for example) to "electron ."
  // app.commandLine.appendArgument('--lang=fr');
  // app.commandLine.appendSwitch('lang', 'fr');
  // app.commandLine.appendSwitch('lang', 'fr_FR, fr');
}

// see createWindow() in app.on('ready', ...)
let _win;

// see initPersistentStore() in app.on('ready', ...)
let _store;
let _storeSubscribe;
let _storeUnsubscribe;

app.allowRendererProcessReuse = true;

setupFileDialogEvents();

const singleInstanceLock = process.platform === 'darwin' || app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
} else {

function handleStartupFileCheck(filepath) {
  app.whenReady().then(() => {
    async function askCheckEPUB() {
      const st = _store.getState();
      // check already running (for example, "file open..." event)
      if (st && st.app && st.app.processing && st.app.processing.ace){
        const p = st.app.processing.ace; // st.app.inputPath;
        _store.dispatch(addMessage(localize("message.runningace", {inputPath: `${p} (... ${filepath})`, interpolation: { escapeValue: false }})));

        const res = await dialog.showMessageBox({
          _win,
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
        });
        if (res.response === 0) {
          // noop
        }

        return;
      }

      _win.webContents.send('RUN_ACE', filepath);
      // const res = await dialog.showMessageBox({
      //   _win,
      //   type: "question",
      //   buttons: [
      //       localize("versionCheck.yes"),
      //       localize("versionCheck.no"),
      //   ],
      //   defaultId: 0,
      //   cancelId: 1,
      //   title: localize('menu.checkEpub'),
      //   message: localize('menu.checkEpub'),
      //   detail: filepath,
      //   noLink: true,
      //   normalizeAccessKeys: false,
      // });
      // if (res.response === 0) {
      //   // menuBuilder.runAceInRendererProcess(filepath);
      //   _win.webContents.send('RUN_ACE', filepath);
      // }
    }

    function checkWin() {
      if (_win && _store) {
        setTimeout(async () => {
          await askCheckEPUB();
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

function handleArgv(argv) {
  console.log("ARGV:");
  console.log(JSON.stringify(argv));
    if (argv) {
      const args = argv.slice(isDev ? 2 : 1); // TODO: isDev should really be isPackaged (installed app)
      for (let i = 0; i < args.length; i++) {
          if (args[i] && args[i] !== "." && !args[i].startsWith("--") && fs.existsSync(args[i])) {
            handleStartupFileCheck(args[i]);
            break;
          }
      }
    }
}

if (process.platform === 'darwin') {
  app.on('will-finish-launching', () => {
    app.on('open-file', (ev, filepath) => {
      ev.preventDefault();
      if (_win) {
          if (_win.isMinimized()) {
            _win.restore();
          }
          _win.focus();
      }
      handleStartupFileCheck(filepath);
    });
  });
} else {
  app.on('second-instance', (event, argv, workingDirectory) => {
      if (_win) {
          if (_win.isMinimized()) {
            _win.restore();
          }
          _win.focus();
      }
    handleArgv(argv);
  });
}

if (__VSCODE_LAUNCH__ !== "true") {
  handleArgv(process.argv);
}

const CONCURRENT_INSTANCES = 4; // same as the Puppeteer Axe runner
// TODO: ipcMain always here,
// but leaving eventEmmitter as a reminder that
// if the createAxeRunner() counterpart is created from the main process
// instead of renderer process, then the shared eventEmmitter must be used instead!
prepareLaunch(ipcMain ? ipcMain : eventEmmitter, CONCURRENT_INSTANCES);

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

  _win = new BrowserWindow(
    {
      show: false,
      webPreferences: {
          preload: `${__dirname}/preload-bundle.js`,
          allowRunningInsecureContent: false,
          backgroundThrottling: false,
          contextIsolation: false,
          devTools: isDev,
          nodeIntegration: true,
          nodeIntegrationInWorker: false,
          sandbox: false,
          webSecurity: isDev ? false : true,
          webviewTag: false,
          enableRemoteModule: false,
          partition: SESSION_PARTITION
      }
    }
  );
  _win.maximize();
  let sz = _win.getSize();
  const sz0 = sz[0];
  const sz1 = sz[1];
  _win.unmaximize();
  // open a window that's not quite full screen ... makes sense on mac, anyway
  _win.setSize(Math.min(Math.round(sz0 * .75),1200), Math.min(Math.round(sz1 * .85), 800));
  // _win.setPosition(Math.round(sz[0] * .10), Math.round(sz[1] * .10));
  _win.setPosition(Math.round(sz0*0.5-_win.getSize()[0]*0.5), Math.round(sz1*0.5-_win.getSize()[1]*0.5));
  _win.show();

  setTimeout(() => {
    checkLatestVersion(_win);
  }, 1000);

  const menuBuilder = new MenuBuilder(_win, _store);
  menuBuilder.buildMenu(_win);
  
  const cb = () => {
    menuBuilder.storeHasChanged();
  };
  _storeSubscribe(cb);
  
  if (isDev) {

    // require('electron-debug')(); // also see electron-react-devtools
  
    _win.webContents.on("did-finish-load", () => {
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
    });

    _win.openDevTools({ mode: "detach" });

    _win.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element', // NOT LOCALIZED (debug/dev only)
          click: () => {
            _win.inspectElement(x, y);
          }
        }
      ]).popup(_win);
    });
  }

  let rendererUrl = __RENDERER_URL__;
  if (rendererUrl === "file://") {
      // dist/prod mode (without WebPack HMR Hot Module Reload HTTP server)
      rendererUrl += path.normalize(path.join(__dirname, "index.html"));
  } else {
      // dev/debug mode (with WebPack HMR Hot Module Reload HTTP server)
      rendererUrl += "index.html";
  }
  rendererUrl = rendererUrl.replace(/\\/g, "/");

  console.log(rendererUrl);
  _win.loadURL(rendererUrl); // `file://${__dirname}/index.html`

  _win.on('closed', function () {
      
      _storeUnsubscribe(cb);

      _win = null;
      
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

  const sess = session.fromPartition(SESSION_PARTITION, { cache: true }); // || session.defaultSession;
  if (sess) {
    sess.protocol.registerFileProtocol('fileproto', (request, callback) => {
      const p = decodeURIComponent(request.url.substr('fileproto://host/'.length));
      callback({ path: p })
    });
  }

  const {store, storeSubscribe, storeUnsubscribe} = initPersistentStore();
  _store = store;
  _storeSubscribe = storeSubscribe;
  _storeUnsubscribe = storeUnsubscribe;

  // The Electron app is always run from the ./app/main-bundle.js folder which contains a subfolder copy of the KB
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

async function willQuitCallback(evt) {
  evt.preventDefault();
  app.removeListener("will-quit", willQuitCallback);

  console.log("stopKnowledgeBaseServer...");
  try {
    await stopKnowledgeBaseServer();
  } catch (err) {
    console.log(err);
  }
  console.log("stopKnowledgeBaseServer DONE now quitting...");

  app.quit();
}
app.on("will-quit", willQuitCallback);

app.on('window-all-closed', function () {
  // we could enable this typical macos behavior if we wanted but not sure it makes sense
  /*if (process.platform !== 'darwin') {
      quit();
  }*/
  // app.quit();
});

app.on('activate', function () {
  if (_win === null) {
      createWindow();
  }
});

app.on('before-quit', function() {
});

} // singleInstanceLock
