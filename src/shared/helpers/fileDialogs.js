// helper functions
const electron = require('electron');
const dialog = electron.dialog || electron.remote.dialog;
const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;

const { localizer } = require('../l10n/localize');
const { localize } = localizer;

module.exports = {
  showExportReportDialog: callback => {
    return showSaveDialog({
      title: localize("dialog.savereport"),
      filters: [{name: localize("dialog.ziparchive"), extensions: ['zip']}],
    }, callback);
  },

  showFolderBrowseDialog: callback => {
    return showOpenDialog({
      title: localize("dialog.choosedir"),
      buttonLabel: localize("dialog.select"),
      properties: ['openDirectory', 'createDirectory'],
      filters: [{name: localize("dialog.allfiles"), extensions: ['*']}],
    }, callback);
  },

  showEpubFileOrFolderBrowseDialog: callback => {
    return showOpenDialog({
      title: localize("dialog.chooseepub"),
      buttonLabel: localize("dialog.check"),
      properties: ['openFile', 'openDirectory'],
      filters: [{name: 'EPUB', extensions: ['epub']}, {name: localize("dialog.allfiles"), extensions: ['*']}],
    }, callback);
  },

  showEpubFileBrowseDialog: callback => {
    return showOpenDialog({
      title: localize("dialog.chooseepubfile"),
      buttonLabel: localize("dialog.check"),
      properties: ['openFile'],
      filters: [{name: 'EPUB', extensions: ['epub']}, {name: localize("dialog.allfiles"), extensions: ['*']}],
    }, callback);
  },

  showEpubFolderBrowseDialog: callback => {
    return showOpenDialog({
      title: localize("dialog.chooseepubdir"),
      buttonLabel: localize("dialog.check"),
      properties: ['openDirectory'],
      filters: [{name: localize("dialog.allfiles"), extensions: ['*']}],
    }, callback);
  },

  showReportFileBrowseDialog: callback => {
    return showOpenDialog({
      title: localize("dialog.choosereport"),
      buttonLabel: localize("dialog.open"),
      properties: ['openFile'],
      filters: [{name: 'JSON', extensions: ['json']}, {name: localize("dialog.allfiles"), extensions: ['*']}],
    }, callback);
  },
};

function showOpenDialog(options, callback) {
  return dialog.showOpenDialog(
    BrowserWindow.getFocusedWindow(),
    options,
    (callback===undefined) ? undefined: (filenames) => {
      if (filenames != undefined) {
        callback(filenames[0]);
      }
    }
  );
}

function showSaveDialog(options, callback) {
  return dialog.showSaveDialog(
    BrowserWindow.getFocusedWindow(),
    options,
    (callback===undefined) ? undefined: (filename) => {
      if (filename != undefined) {
        callback(filename);
      }
    }
  );
}
