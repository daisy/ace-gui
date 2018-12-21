const electron = require('electron');
const dialog = electron.dialog || electron.remote.dialog;
const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;
const openAboutWindow = require('about-window').default;
const join = require('path').join;

module.exports = {
  showAbout: callback => {
    return openAboutWindow({
        icon_path: join(__dirname, 'logo.svg'),
        copyright: 'Copyright (c) 2018 DAISY Consortium',
        package_json_dir: __dirname,
        open_devtools: process.env.NODE_ENV !== 'production',
    });
  },
};
