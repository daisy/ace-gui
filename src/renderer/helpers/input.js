// helper functions
const electron = require('electron');
const dialog = electron.dialog || electron.remote.dialog;
const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;

// function showEpubFileBrowseDialog(open) {
//   let title = "Choose an EPUB file";
//   let buttonLabel = "Check";
//   let properties = ['openFile'];
//   let filters = [{name: 'EPUB', extensions: ['epub']}, {name: 'All Files', extensions: ['*']}];
//   showBrowseDialog(title, buttonLabel, properties, filters, open);
// }

// function showReportFileBrowseDialog(open) {
//   let title = "Choose a file";
//   let buttonLabel = "Open";
//   let properties = ['openFile'];
//   let filters = [{name: 'Ace Report', extensions: ['json']}, {name: 'All Files', extensions: ['*']}];
//   showBrowseDialog(title, buttonLabel, properties, filters, open);
// }


// function showOutdirFolderBrowseDialog(open) {
  //   let title = "Choose a folder";
  //   let buttonLabel = "Select";
  //   let properties = ['openDirectory', 'createDirectory'];
  //   let filters = [{name: 'All Files', extensions: ['*']}];
  //   showBrowseDialog(title, buttonLabel, properties, filters, open);
  // }

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