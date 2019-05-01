import { app, Menu, shell, dialog, clipboard, webContents, BrowserWindow } from 'electron';
import {
  runAce,
  openReport,
  closeReport,
  exportReport
} from './../shared/actions/app';
import {selectTab} from './../shared/actions/reportView';
import * as FileDialogHelpers from './../shared/helpers/fileDialogs';
import * as AboutBoxHelper from './../shared/helpers/about';
import {KnowledgeBase} from './kb';

export default class MenuBuilder {

  constructor(mainWindow, store, kburl) {
    this.mainWindow = mainWindow;
    this.store = store;
    this.kburl = kburl;
    this.stateValues = {
      isReportOpen: false,
      ready: true
    };

    // listen for when a report is open
    this.store.subscribe(() => {
      let currIsReportOpen = this.stateValues.isReportOpen;
      let currReady = this.stateValues.ready;
      let newIsReportOpen = this.store.getState().app.report != null;
      let newReady = !this.store.getState().app.processing.ace;
      if (currIsReportOpen != newIsReportOpen || currReady != newReady) {
        this.stateValues = {
          isReportOpen: newIsReportOpen,
          ready: newReady
        };
        this.refreshMenuItemsEnabled();
      }
    })
  }
  refreshMenuItemsEnabled() {
    let {isReportOpen, ready} = this.stateValues;
    this.setMenuItemsEnabled(["checkEpub", "openReport"], ready);
    this.setMenuItemsEnabled(["rerunAce", "exportReport", "closeReport", "gotoSummary",
      "gotoViolations", "gotoMetadata", "gotoOutlines", "gotoImages", "showInFinder"],
      isReportOpen);
  }
  getMenuItem(id) {
    let menu = Menu.getApplicationMenu();
    return menu.getMenuItemById(id);
  }
  // set many menu items at once
  setMenuItemsEnabled(ids, enabled) {
    for (let idx=0; idx < ids.length; idx+=1) {
      if (this.getMenuItem(ids[idx])) {
        this.getMenuItem(ids[idx]).enabled = enabled;
      }
    }
  }

  buildTemplate() {

    const defaultTemplate = {
      subMenuFile: {
        label: 'File',
        submenu: [
          {
            label: 'Check EPUB...',
            id: 'checkEpub',
            accelerator: 'CmdOrCtrl+O',
            click: () => process.platform == 'darwin'
              ?FileDialogHelpers.showEpubFileOrFolderBrowseDialog(filepath => this.store.dispatch(runAce(filepath)))
              :FileDialogHelpers.showEpubFileBrowseDialog(filepath => this.store.dispatch(runAce(filepath)))
          },
          {
            label: 'Open Report...',
            id: 'openReport',
            click: () => FileDialogHelpers.showReportFileBrowseDialog(filepath => this.store.dispatch(openReport(filepath)))
          },
          {
            type: 'separator'
          },
          {
            label: 'Rerun Ace',
            id: 'rerunAce',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => this.store.dispatch(runAce(this.store.getState().app.inputPath))
          },
          {
            type: 'separator'
          },
          {
            label: 'Export Report',
            id: 'exportReport',
            accelerator: 'CmdOrCtrl+Shift+E',
            click: () => FileDialogHelpers.showExportReportDialog(filepath => this.store.dispatch(exportReport(filepath)))
          },
          {
            type: 'separator'
          },
          {
            label: 'Close Report',
            id: 'closeReport',
            accelerator: 'CmdOrCtrl+Shift+C',
            click: () => this.store.dispatch(closeReport())
          },
        ]
      },
      subMenuView: {
        label: 'View',
        submenu: [
          {
            label: 'Toggle Full Screen',
            type: 'checkbox',
            accelerator: process.platform === 'darwin'
              ? 'Ctrl+Command+F'
              : 'F11',
            click: () => this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
          },
          {
            type: 'separator'
          },
          {
            label: 'Go to Summary',
            id: 'gotoSummary',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => this.store.dispatch(selectTab(0))
          },
          {
            label: 'Go to Violations',
            id: 'gotoViolations',
            accelerator: 'CmdOrCtrl+Shift+V',
            click: () => this.store.dispatch(selectTab(1))
          },
          {
            label: 'Go to Metadata',
            id: 'gotoMetadata',
            accelerator: 'CmdOrCtrl+Shift+M',
            click: () => this.store.dispatch(selectTab(2))
          },
          {
            label: 'Go to Outlines',
            id: 'gotoOutlines',
            accelerator: 'CmdOrCtrl+Shift+O',
            click: () => this.store.dispatch(selectTab(3))
          },
          {
            label: 'Go to Images',
            id: 'gotoImages',
            accelerator: 'CmdOrCtrl+Shift+I',
            click: () => this.store.dispatch(selectTab(4))
          },
          {
            type: 'separator'
          },
          {
            label: process.platform == 'darwin' ? 'Show in Finder' : 'Show in Explorer',
            id: 'showInFinder',
            accelerator: 'CmdOrCtrl+Shift+F',
            click: () => shell.showItemInFolder(this.store.getState().app.reportPath)
          }
        ]
      },
      subMenuEdit: {
        label: 'Edit',
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
        ],
      },
      subMenuDev: {
        label: 'Dev',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'Command+R',
            click: () => this.mainWindow.webContents.reload()
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: 'Alt+Command+I',
            click: () => {
              // this.mainWindow.toggleDevTools();

              const bw = BrowserWindow.getFocusedWindow();
              if (bw) {
                  bw.webContents.openDevTools({ mode: "detach" });
              } else {
                  const arr = BrowserWindow.getAllWindows();
                  arr.forEach((bww) => {
                      bww.webContents.openDevTools({ mode: "detach" });
                  });

                  // for (const wc of webContents.getAllWebContents()) {
                  //   // if (wc.hostWebContents &&
                  //   //     wc.hostWebContents.id === this.mainWindow.webContents.id) {
                  //   // }
                  //   wc.openDevTools({ mode: "detach" });
                  // }
              }
            }
          }
        ]
      },
      subMenuHelp: {
        label: 'Help',
        role: 'help',
        submenu: [
          {
            label: 'Knowledge Base',
            submenu: [
              {
                label: 'Local (offline)',
                click: () => {
                  new KnowledgeBase(this.mainWindow, this.kburl);
                }
              },
              {
                label: 'Web (online)',
                click: () => {
                  shell.openExternal('http://kb.daisy.org/publishing/docs/index.html');
                }
              }
            ]
          },
          {
            label: 'Learn more',
            click: () => shell.openExternal('http://daisy.github.io/ace')
          },
          {
            label: 'Report an Issue',
            click: () => shell.openExternal('http://github.com/DAISY/ace-gui/issues')
          },
          {
            label: 'Copy Message Output',
            click: () => {
              let messages = this.store.getState().app.messages;
              let msgstr = messages.join('\n');
              clipboard.writeText(msgstr);
            }
          }
        ]
      },
      subMenuAbout: {
        label: 'Ace',
        submenu: [
          {
            label: 'About Ace',
            id: 'about',
            click: () => AboutBoxHelper.showAbout()
          },
          {
            type: 'separator'
          },
          {
            label: 'Services',
            role: 'services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            label: 'Hide Ace',
            accelerator: 'Command+H',
            role: 'hide'
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Alt+H',
            role: 'hideothers'
          },
          {
            label: 'Show All',
            role: 'unhide'
          },
          {
            type: 'separator'
          },
          {
            role: 'quit'
          }
        ]
      },
      subMenuWindow: {
        label: 'Window',
        role: 'window',
        submenu: [
          {
              role: "togglefullscreen",
          },
          {
              role: "minimize",
          },
          {
              role: "close",
          },
          // {
          //   label: 'Minimize',
          //   role: 'minimize'
          // },
          { type: 'separator' },
          {
            label: 'Bring All to Front',
            role: 'front'
          }
        ]
      }
    };


    // On Windows and Linux, open dialogs do not support selecting both files and
    // folders and files, so add an extra menu item so there is one for each type.
    if (process.platform === 'linux' || process.platform === 'win32') {
      // insert item into File submenu
      defaultTemplate.subMenuFile.submenu.unshift({
        label: 'Check EPUB Folder ... ',
        click: () => FileDialogHelpers.showEpubFolderBrowseDialog(filepath => this.store.dispatch(runAce(filepath)))
      });

      // insert item into Help submenu
      defaultTemplate.subMenuHelp.submenu.push(
        {
          type: 'separator'
        },
        {
          label: 'About Ace',
          id: 'about',
          click: () => AboutBoxHelper.showAbout()
        }
      );
    }
    // Add "File > Quit" menu item so Linux distros where the system tray icon is
    // missing will have a way to quit the app.
    if (process.platform === 'linux') {
      // File menu (Linux)
      defaultTemplate.subMenuFile.submenu.push({
        label: 'Quit',
        click: () => app.quit()
      });
    }

    let isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

    let menuTemplate = process.platform === 'darwin' ?
      [
        defaultTemplate.subMenuAbout,
        defaultTemplate.subMenuFile,
        defaultTemplate.subMenuView,
        defaultTemplate.subMenuEdit,
        defaultTemplate.subMenuWindow,
        defaultTemplate.subMenuHelp
      ]
      :
      [
        defaultTemplate.subMenuFile,
        defaultTemplate.subMenuView,
        defaultTemplate.subMenuEdit,
        defaultTemplate.subMenuHelp
      ];

    return isDev ? menuTemplate.concat(defaultTemplate.subMenuDev) : menuTemplate;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }
      ]).popup(this.mainWindow);
    });
  }

  buildMenu() {
    let isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
    if (isDev) {
      this.setupDevelopmentEnvironment();
    }

    const template = this.buildTemplate();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    this.refreshMenuItemsEnabled();
    return menu;
  }

}
