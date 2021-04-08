// helper functions
const electron = require('electron');

const { localizer } = require('../shared/l10n/localize');
const { localize } = localizer;

const { eventEmmitter, IPC_EVENT_showItemInFolder, IPC_EVENT_showReportFileBrowseDialog, IPC_EVENT_showExportReportDialog, IPC_EVENT_showFolderBrowseDialog, IPC_EVENT_showEpubFileOrFolderBrowseDialog, IPC_EVENT_showEpubFileBrowseDialog, IPC_EVENT_showEpubFolderBrowseDialog } = require('../shared/main-renderer-events');

const showExportReportDialog = async (callback) => {
  const filePath = await showSaveDialog({
    title: localize("dialog.savereport"),
    filters: [{name: localize("dialog.ziparchive"), extensions: ['zip']}],
  });
  if (callback && filePath) {
    callback(filePath);
  }
};

const showFolderBrowseDialog = async (callback) => {
  const filePath = await showOpenDialog({
    title: localize("dialog.choosedir"),
    buttonLabel: localize("dialog.select"),
    properties: ['openDirectory', 'createDirectory'],
    filters: [{name: localize("dialog.allfiles"), extensions: ['*']}],
  });
  if (callback && filePath) {
    callback(filePath);
  }
};

const showEpubFileOrFolderBrowseDialog = async (callback) => {
  const filePath = await showOpenDialog({
    title: localize("dialog.chooseepub"),
    buttonLabel: localize("dialog.check"),
    properties: ['openFile', 'openDirectory'],
    filters: [{name: 'EPUB', extensions: ['epub']}, {name: localize("dialog.allfiles"), extensions: ['*']}],
  });
  if (callback && filePath) {
    callback(filePath);
  }
};

const showEpubFileBrowseDialog = async (callback) => {
  const filePath = await showOpenDialog({
    title: localize("dialog.chooseepubfile"),
    buttonLabel: localize("dialog.check"),
    properties: ['openFile'],
    filters: [{name: 'EPUB', extensions: ['epub']}, {name: localize("dialog.allfiles"), extensions: ['*']}],
  });
  if (callback && filePath) {
    callback(filePath);
  }
};

const showEpubFolderBrowseDialog = async (callback) => {
  const filePath = await showOpenDialog({
    title: localize("dialog.chooseepubdir"),
    buttonLabel: localize("dialog.check"),
    properties: ['openDirectory'],
    filters: [{name: localize("dialog.allfiles"), extensions: ['*']}],
  });
  if (callback && filePath) {
    callback(filePath);
  }
};

const showReportFileBrowseDialog = async (callback) => {
  const filePath = await showOpenDialog({
    title: localize("dialog.choosereport"),
    buttonLabel: localize("dialog.open"),
    properties: ['openFile'],
    filters: [{name: 'JSON', extensions: ['json']}, {name: localize("dialog.allfiles"), extensions: ['*']}],
  });
  if (callback && filePath) {
    callback(filePath);
  }
};

module.exports = {
  setupFileDialogEvents: () => {
    //  event.sender is Electron.WebContents
    //  const win = BrowserWindow.fromWebContents(event.sender) || undefined;
    //  const webcontent = webContents.fromId(payload.webContentID); // webcontents.id is identical

    electron.ipcMain.on(IPC_EVENT_showItemInFolder, (event, payload) => {
      //  event.sender is Electron.WebContents
      //  const win = BrowserWindow.fromWebContents(event.sender) || undefined;
      //  const webcontent = webContents.fromId(payload.webContentID); // webcontents.id is identical
    
      console.log("showItemInFolder", "ipcMain", payload.path);
      electron.shell.showItemInFolder(payload.path);
    });

    // comes from the main process
    eventEmmitter.on(IPC_EVENT_showEpubFolderBrowseDialog, async (payload) => {
      await showEpubFolderBrowseDialog((filePath) => {
        console.log("showEpubFolderBrowseDialog", "eventEmmitter: ", filePath);
        eventEmmitter.send(IPC_EVENT_showEpubFolderBrowseDialog, filePath)
      });
    });
    // comes from the renderer process (ipcRenderer.send())
    electron.ipcMain.on(IPC_EVENT_showEpubFolderBrowseDialog, async (event, payload) => {
      await showEpubFolderBrowseDialog((filePath) => {
        console.log("showEpubFolderBrowseDialog", "ipcMain: ", filePath);
        event.sender.send(IPC_EVENT_showEpubFolderBrowseDialog, filePath)
      });
    });

    // comes from the main process
    eventEmmitter.on(IPC_EVENT_showEpubFileBrowseDialog, async (payload) => {
      await showEpubFileBrowseDialog((filePath) => {
        console.log("showEpubFileBrowseDialog", "eventEmmitter: ", filePath);
        eventEmmitter.send(IPC_EVENT_showEpubFileBrowseDialog, filePath)
      });
    });
    // comes from the renderer process (ipcRenderer.send())
    electron.ipcMain.on(IPC_EVENT_showEpubFileBrowseDialog, async (event, payload) => {
      await showEpubFileBrowseDialog((filePath) => {
        console.log("showEpubFileBrowseDialog", "ipcMain: ", filePath);
        event.sender.send(IPC_EVENT_showEpubFileBrowseDialog, filePath)
      });
    });

    // comes from the main process
    eventEmmitter.on(IPC_EVENT_showEpubFileOrFolderBrowseDialog, async (payload) => {
      await showEpubFileOrFolderBrowseDialog((filePath) => {
        console.log("showEpubFileOrFolderBrowseDialog", "eventEmmitter: ", filePath);
        eventEmmitter.send(IPC_EVENT_showEpubFileOrFolderBrowseDialog, filePath)
      });
    });
    // comes from the renderer process (ipcRenderer.send())
    electron.ipcMain.on(IPC_EVENT_showEpubFileOrFolderBrowseDialog, async (event, payload) => {
      await showEpubFileOrFolderBrowseDialog((filePath) => {
        console.log("showEpubFileOrFolderBrowseDialog", "ipcMain: ", filePath);
        event.sender.send(IPC_EVENT_showEpubFileOrFolderBrowseDialog, filePath)
      });
    });

    // comes from the main process
    eventEmmitter.on(IPC_EVENT_showFolderBrowseDialog, async (payload) => {
      await showFolderBrowseDialog((filePath) => {
        console.log("showFolderBrowseDialog", "eventEmmitter: ", filePath);
        eventEmmitter.send(IPC_EVENT_showFolderBrowseDialog, filePath)
      });
    });
    // comes from the renderer process (ipcRenderer.send())
    electron.ipcMain.on(IPC_EVENT_showFolderBrowseDialog, async (event, payload) => {
      await showFolderBrowseDialog((filePath) => {
        console.log("showFolderBrowseDialog", "ipcMain: ", filePath);
        event.sender.send(IPC_EVENT_showFolderBrowseDialog, filePath)
      });
    });

    // comes from the main process
    eventEmmitter.on(IPC_EVENT_showExportReportDialog, async (payload) => {
      await showExportReportDialog((filePath) => {
        console.log("showExportReportDialog", "eventEmmitter: ", filePath);
        eventEmmitter.send(IPC_EVENT_showExportReportDialog, filePath)
      });
    });
    // comes from the renderer process (ipcRenderer.send())
    electron.ipcMain.on(IPC_EVENT_showExportReportDialog, async (event, payload) => {
      await showExportReportDialog((filePath) => {
        console.log("showExportReportDialog", "ipcMain: ", filePath);
        event.sender.send(IPC_EVENT_showExportReportDialog, filePath)
      });
    });
    
    // comes from the main process
    eventEmmitter.on(IPC_EVENT_showReportFileBrowseDialog, async (payload) => {
      await showReportFileBrowseDialog((filePath) => {
        console.log("showReportFileBrowseDialog", "eventEmmitter: ", filePath);
        eventEmmitter.send(IPC_EVENT_showReportFileBrowseDialog, filePath)
      });
    });
    // comes from the renderer process (ipcRenderer.send())
    electron.ipcMain.on(IPC_EVENT_showReportFileBrowseDialog, async (event, payload) => {
      await showReportFileBrowseDialog((filePath) => {
        console.log("showReportFileBrowseDialog", "ipcMain: ", filePath);
        event.sender.send(IPC_EVENT_showReportFileBrowseDialog, filePath)
      });
    });
  },

  showEpubFolderBrowseDialog,
  showEpubFileBrowseDialog,
  showEpubFileOrFolderBrowseDialog,
  showFolderBrowseDialog,
  showExportReportDialog,
  showReportFileBrowseDialog,
};

async function showOpenDialog(options) {

  const res = await electron.dialog.showOpenDialog(
    electron.BrowserWindow ? electron.BrowserWindow.getFocusedWindow() : undefined,
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

  const res = await electron.dialog.showSaveDialog(
    electron.BrowserWindow ? electron.BrowserWindow.getFocusedWindow() : undefined,
    options
  );
  if (res.canceled || !res.filePath) {
    return undefined;
  }
  return res.filePath;
}
