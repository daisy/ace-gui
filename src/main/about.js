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
        copyright: 'Copyright (c) 2026 DAISY Consortium',
        package_json_dir: __dirname,
        open_devtools: isDev,
        win_options: {
          webPreferences: {
            // enableRemoteModule: false,
            allowRunningInsecureContent: false,
            backgroundThrottling: false,
            devTools: isDev,
            nodeIntegration: true, // ==> disables sandbox https://www.electronjs.org/docs/latest/tutorial/sandbox
            sandbox: false,
            contextIsolation: false, // must be false because nodeIntegration, see https://github.com/electron/electron/issues/23506
            nodeIntegrationInWorker: false,
            webSecurity: true,
            webviewTag: false,
          }
        }
    });
  },
};
