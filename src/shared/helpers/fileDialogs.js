// helper functions
const electron = require('electron');
const dialog = electron.dialog || electron.remote.dialog;
const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;

const { localizer } = require('../l10n/localize');
const { localize } = localizer;

module.exports = {
  showExportReportDialog: async (callback) => {
    const filePath = await showSaveDialog({
      title: localize("dialog.savereport"),
      filters: [{name: localize("dialog.ziparchive"), extensions: ['zip']}],
    });
    if (callback && filePath) {
      callback(filePath);
    }
  },

  showFolderBrowseDialog: async (callback) => {
    const filePath = await showOpenDialog({
      title: localize("dialog.choosedir"),
      buttonLabel: localize("dialog.select"),
      properties: ['openDirectory', 'createDirectory'],
      filters: [{name: localize("dialog.allfiles"), extensions: ['*']}],
    });
    if (callback && filePath) {
      callback(filePath);
    }
  },

  showEpubFileOrFolderBrowseDialog: async (callback) => {
    const filePath = await showOpenDialog({
      title: localize("dialog.chooseepub"),
      buttonLabel: localize("dialog.check"),
      properties: ['openFile', 'openDirectory'],
      filters: [{name: 'EPUB', extensions: ['epub']}, {name: localize("dialog.allfiles"), extensions: ['*']}],
    });
    if (callback && filePath) {
      callback(filePath);
    }
  },

  showEpubFileBrowseDialog: async (callback) => {
    const filePath = await showOpenDialog({
      title: localize("dialog.chooseepubfile"),
      buttonLabel: localize("dialog.check"),
      properties: ['openFile'],
      filters: [{name: 'EPUB', extensions: ['epub']}, {name: localize("dialog.allfiles"), extensions: ['*']}],
    });
    if (callback && filePath) {
      callback(filePath);
    }
  },

  showEpubFolderBrowseDialog: async (callback) => {
    const filePath = await showOpenDialog({
      title: localize("dialog.chooseepubdir"),
      buttonLabel: localize("dialog.check"),
      properties: ['openDirectory'],
      filters: [{name: localize("dialog.allfiles"), extensions: ['*']}],
    });
    if (callback && filePath) {
      callback(filePath);
    }
  },

  showReportFileBrowseDialog: async (callback) => {
    const filePath = await showOpenDialog({
      title: localize("dialog.choosereport"),
      buttonLabel: localize("dialog.open"),
      properties: ['openFile'],
      filters: [{name: 'JSON', extensions: ['json']}, {name: localize("dialog.allfiles"), extensions: ['*']}],
    });
    if (callback && filePath) {
      callback(filePath);
    }
  },
};

async function showOpenDialog(options) {
  const res = await dialog.showOpenDialog(
    BrowserWindow.getFocusedWindow(),
    options
  );
  if (res.canceled || !res.filePaths || !res.filePaths.length) {
      return undefined;
  }
  const filePath = res.filePaths[0];
  if (filePath) {
    return filePath;
  } else {
    return undefined;
  }
}

async function showSaveDialog(options) {
  const res = await dialog.showSaveDialog(
    BrowserWindow.getFocusedWindow(),
    options
  );
  if (res.canceled || !res.filePath) {
    return undefined;
  }
  return res.filePath;
}
