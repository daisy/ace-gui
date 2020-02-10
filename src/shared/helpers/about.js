const electron = require('electron');
const dialog = electron.dialog || electron.remote.dialog;
const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;
const openAboutWindow = require('about-window').default;
const join = require('path').join;

// import {checkLatestVersion} from './versionCheck';
const checkLatestVersion = require('./versionCheck').checkLatestVersion;

const isDev = process && process.env && (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true');

module.exports = {
  showAbout: (browserWindow) => {
    setTimeout(() => {
      checkLatestVersion(browserWindow);
    }, 500);

    return openAboutWindow({
        icon_path: join(__dirname, 'logo.svg'),
        copyright: 'Copyright (c) 2020 DAISY Consortium',
        package_json_dir: __dirname,
        open_devtools: isDev,
        win_options: {
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
    });
  },
};
