// helper functions
const electron = require('electron');
const dialog = electron.dialog || electron.remote.dialog;
const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;

module.exports = {
  showExportReportDialog: callback => {
    return showSaveDialog({
      title: "Save Report",
      filters: [{name: 'Zip Archive', extensions: ['zip']}],
    }, callback);
  },
  
  showFolderBrowseDialog: callback => {
    return showOpenDialog({
      title: "Choose a directory",
      buttonLabel: "Select",
      properties: ['openDirectory', 'createDirectory'],
      filters: [{name: 'All Files', extensions: ['*']}],
    }, callback);
  },
  
  showEpubFileOrFolderBrowseDialog: callback => {
    return showOpenDialog({
      title: "Choose an EPUB file or folder",
      buttonLabel: "Check",
      properties: ['openFile', 'openDirectory'],
      filters: [{name: 'EPUB', extensions: ['epub']}, {name: 'All Files', extensions: ['*']}],
    }, callback);
  },
  
  showEpubFileBrowseDialog: callback => {
    return showOpenDialog({
      title: "Choose an EPUB file",
      buttonLabel: "Check",
      properties: ['openFile'],
      filters: [{name: 'EPUB', extensions: ['epub']}, {name: 'All Files', extensions: ['*']}],
    }, callback);
  },
  
  showEpubFolderBrowseDialog: callback => {
    return showOpenDialog({
      title: "Choose an EPUB directory",
      buttonLabel: "Select",
      properties: ['openDirectory'],
      filters: [{name: 'All Files', extensions: ['*']}],
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