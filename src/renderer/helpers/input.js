// helper functions
const electron = require('electron');
const dialog = electron.dialog || electron.remote.dialog;

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
function  showFolderBrowseDialog(open) {
  let title = "Choose a directory";
  let buttonLabel = "Select";
  let properties = ['openDirectory', 'createDirectory'];
  let filters = [{name: 'All Files', extensions: ['*']}];
  showBrowseDialog(title, buttonLabel, properties, filters, open);
}

function showEpubFileOrFolderBrowseDialog(open) {
  let title = "Choose an EPUB file or folder";
  let buttonLabel = "Check";
  let properties = ['openFile', 'openDirectory'];
  let filters = [{name: 'EPUB', extensions: ['epub']}, {name: 'All Files', extensions: ['*']}];
  showBrowseDialog(title, buttonLabel, properties, filters, open);
}

function showBrowseDialog(title, buttonLabel, properties, filters, open) {
  dialog.showOpenDialog(
    { title, buttonLabel, properties, filters },
    (filenames) => {
      if (filenames != undefined) {
        open(filenames[0]);
      }
    }
  );
}

export {
  showFolderBrowseDialog,
  showEpubFileOrFolderBrowseDialog,
};

