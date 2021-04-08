
// import { BrowserWindow, ipcRenderer, ipcMain, webContents } from "electron";
// ipcRenderer.send(EVENT_NAME, payload);
// payload can include webview.getWebContentsId()
//
// ipcMain.on(EVENT_NAME, (event, payload) => {
//    event.sender is Electron.WebContents
//    const win = BrowserWindow.fromWebContents(event.sender) || undefined;
//    const webcontent = webContents.fromId(payload.webContentID); // webcontents.id is identical
//});

// main-main process comms
// unused in renderer process, where ipcRenderer is used instead
// (same mechanics as Ace Electron runner)
import EventEmitter from 'events';
class ElectronMockMainRendererEmitter extends EventEmitter {}
const eventEmmitter_ = new ElectronMockMainRendererEmitter();
eventEmmitter_.send = eventEmmitter_.emit;
eventEmmitter_.ace_notElectronIpcMainRenderer = true;
export const eventEmmitter = eventEmmitter_;

export const IPC_EVENT_showItemInFolder = "IPC_EVENT_showItemInFolder";

export const IPC_EVENT_showReportFileBrowseDialog = "IPC_EVENT_showReportFileBrowseDialog";
export const IPC_EVENT_showExportReportDialog = "IPC_EVENT_showExportReportDialog";
export const IPC_EVENT_showFolderBrowseDialog = "IPC_EVENT_showFolderBrowseDialog";
export const IPC_EVENT_showEpubFileOrFolderBrowseDialog = "IPC_EVENT_showEpubFileOrFolderBrowseDialog";
export const IPC_EVENT_showEpubFileBrowseDialog = "IPC_EVENT_showEpubFileBrowseDialog";
export const IPC_EVENT_showEpubFolderBrowseDialog = "IPC_EVENT_showEpubFolderBrowseDialog";
