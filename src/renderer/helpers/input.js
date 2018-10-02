// helper functions
const electron = require('electron');
const dialog = electron.dialog || electron.remote.dialog;

// function showEpubFileBrowseDialog(onOpenFunc) {
//   let title = "Choose an EPUB file";
//   let buttonLabel = "Check";
//   let properties = ['openFile'];
//   let filters = [{name: 'EPUB', extensions: ['epub']}, {name: 'All Files', extensions: ['*']}];
//   showBrowseDialog(title, buttonLabel, properties, filters, onOpenFunc);
// }

// function showReportFileBrowseDialog(onOpenFunc) {
//   let title = "Choose a file";
//   let buttonLabel = "Open";
//   let properties = ['openFile'];
//   let filters = [{name: 'Ace Report', extensions: ['json']}, {name: 'All Files', extensions: ['*']}];
//   showBrowseDialog(title, buttonLabel, properties, filters, onOpenFunc);
// }

// function  showEpubFolderBrowseDialog(onOpenFunc) {
//   let title = "Choose an EPUB folder";
//   let buttonLabel = "Check";
//   let properties = ['openDirectory'];
//   let filters = [{name: 'All Files', extensions: ['*']}];
//   showBrowseDialog(title, buttonLabel, properties, filters, onOpenFunc);
// }

// function showOutdirFolderBrowseDialog(onOpenFunc) {
//   let title = "Choose a folder";
//   let buttonLabel = "Select";
//   let properties = ['openDirectory', 'createDirectory'];
//   let filters = [{name: 'All Files', extensions: ['*']}];
//   showBrowseDialog(title, buttonLabel, properties, filters, onOpenFunc);
// }

function showEpubFileOrFolderBrowseDialog(processFile) {
  let title = "Choose an EPUB file or folder";
  let buttonLabel = "Check";
  let properties = ['openFile', 'openDirectory'];
  let filters = [{name: 'EPUB', extensions: ['epub']}, {name: 'All Files', extensions: ['*']}];
  showBrowseDialog(title, buttonLabel, properties, filters, processFile);
}

function showBrowseDialog(title, buttonLabel, properties, filters, processFile) {
  dialog.showOpenDialog(
    { title, buttonLabel, properties, filters },
    (filenames) => {
      if (filenames != undefined) {
        processFile(filenames[0]);
      }
    }
  );
}

export {
  showEpubFileOrFolderBrowseDialog,
};

