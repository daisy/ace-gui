import { app, Menu, shell, dialog, clipboard, webContents, BrowserWindow } from 'electron';
import {
  openReport,
  closeReport,
  exportReport
} from './../shared/actions/app';
import {selectTab, resetInitialReportView} from './../shared/actions/reportView';
import * as FileDialogHelpers from './../shared/helpers/fileDialogs';
import * as AboutBoxHelper from './../shared/helpers/about';

import { localizer } from './../shared/l10n/localize';
const { getCurrentLanguage, localize } = localizer;
import {KnowledgeBase} from './kb';

const isDev = process && process.env && (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true');

export default class MenuBuilder {

  constructor(mainWindow, store) {
    this.mainWindow = mainWindow;
    this.store = store;
    this.stateValues = {
      isReportOpen: false,
      ready: true,

      language: getCurrentLanguage() // this.store.getState().preferences.language
    };
  }

  // store.subscribe(() => { ... });
  // storeHasChanged() is called AFTER the central store.subscribe() in store-persist.js (initialized from main.js)
  // this ensures that app-wide UI language is ready in localizer
  storeHasChanged() {
    let needsRefresh = false;
    let needsRebuild = false;

    const currLanguage = this.stateValues.language;
    const newLanguage = getCurrentLanguage(); // this.store.getState().preferences.language
    if (newLanguage !== currLanguage) {
      this.stateValues.language = newLanguage;
      needsRebuild = true;
    }

    let currIsReportOpen = this.stateValues.isReportOpen;
    let currReady = this.stateValues.ready;
    let newIsReportOpen = this.store.getState().app.report != null;
    let newReady = !this.store.getState().app.processing.ace; // .app.processing[PROCESSING_TYPE.ACE]
    if (currIsReportOpen != newIsReportOpen || currReady != newReady) {
      this.stateValues.ready = newReady;
      this.stateValues.isReportOpen = newIsReportOpen;
      needsRefresh = true;
    }

    if (needsRebuild) {
      this.rebuildMenu(); // calls this.refreshMenuItemsEnabled()
    } else if (needsRefresh) {
      this.refreshMenuItemsEnabled();
    }
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

  runAceInRendererProcess(filepath) {
    this.mainWindow.webContents.send('RUN_ACE', filepath);
  }
  
  buildTemplate() {

    const defaultTemplate = {
      subMenuFile: {
        label: localize('menu.file'),
        submenu: [
          {
            label: localize('menu.checkEpub'),
            id: 'checkEpub',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              setTimeout(async () => {
                if (process.platform == 'darwin') {
                  await FileDialogHelpers.showEpubFileOrFolderBrowseDialog((filepath) => {
                    this.store.dispatch(closeReport());
                    this.store.dispatch(resetInitialReportView());
                    
                    this.runAceInRendererProcess(filepath);
                  });
                } else {
                  await FileDialogHelpers.showEpubFileBrowseDialog((filepath) => {
                    this.store.dispatch(closeReport());
                    this.store.dispatch(resetInitialReportView());

                    this.runAceInRendererProcess(filepath);
                  });
                }
              }, 0);
            }
          },
          {
            label: localize('menu.openReport'),
            id: 'openReport',
            click: () => {
              setTimeout(async () => {
                await FileDialogHelpers.showReportFileBrowseDialog((filepath) => {
                  this.store.dispatch(closeReport());
                  this.store.dispatch(resetInitialReportView());

                  this.store.dispatch(openReport(filepath));
                });
              }, 0);
            }
          },
          {
            type: 'separator'
          },
          {
            label: localize('menu.rerunAce'),
            id: 'rerunAce',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
              const p = this.store.getState().app.inputPath;
              this.store.dispatch(closeReport());
              this.store.dispatch(resetInitialReportView());

              this.runAceInRendererProcess(p);
            }
          },
          {
            type: 'separator'
          },
          {
            label: localize('menu.exportReport'),
            id: 'exportReport',
            accelerator: 'CmdOrCtrl+Shift+E',
            click: () => {
              setTimeout(async () => {
                await FileDialogHelpers.showExportReportDialog((filepath) => {
                  this.store.dispatch(exportReport(filepath));
                });
              }, 0);
            }
          },
          {
            type: 'separator'
          },
          {
            label: localize('menu.closeReport'),
            id: 'closeReport',
            accelerator: 'CmdOrCtrl+Shift+C',
            click: () => {
              this.store.dispatch(closeReport());
              this.store.dispatch(resetInitialReportView());
            }
          },
        ]
      },
      subMenuView: {
        label: localize('menu.view'),
        submenu: [
          {
            label: localize('menu.gotoSummary'),
            id: 'gotoSummary',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => this.store.dispatch(selectTab(0))
          },
          {
            label: localize('menu.gotoViolations'),
            id: 'gotoViolations',
            accelerator: 'CmdOrCtrl+Shift+V',
            click: () => this.store.dispatch(selectTab(1))
          },
          {
            label: localize('menu.gotoMetadata'),
            id: 'gotoMetadata',
            accelerator: 'CmdOrCtrl+Shift+M',
            click: () => this.store.dispatch(selectTab(2))
          },
          {
            label: localize('menu.gotoOutlines'),
            id: 'gotoOutlines',
            accelerator: 'CmdOrCtrl+Shift+O',
            click: () => this.store.dispatch(selectTab(3))
          },
          {
            label: localize('menu.gotoImages'),
            id: 'gotoImages',
            accelerator: 'CmdOrCtrl+Shift+I',
            click: () => this.store.dispatch(selectTab(4))
          },
          {
            type: 'separator'
          },
          {
            label: process.platform == 'darwin' ? localize('menu.showInFinder') : localize('menu.showInExplorer'),
            id: 'showInFinder',
            accelerator: 'CmdOrCtrl+Shift+F',
            click: () => shell.showItemInFolder(this.store.getState().app.reportPath)
          }
        ]
      },
      subMenuEdit: {
        label: localize('menu.edit'),
        submenu: [
            {
                label: localize('menu.undo'),
                accelerator: "CmdOrCtrl+Z",
                selector: "undo:"
            },
            {
                label: localize('menu.redo'),
                accelerator: "Shift+CmdOrCtrl+Z",
                selector: "redo:"
            },
            { type: "separator" },
            {
                label: localize('menu.cut'),
                accelerator: "CmdOrCtrl+X",
                selector: "cut:"
            },
            {
                label: localize('menu.copy'),
                accelerator: "CmdOrCtrl+C",
                selector: "copy:"
            },
            {
                label: localize('menu.paste'),
                accelerator: "CmdOrCtrl+V",
                selector: "paste:"
            },
            {
                label: localize('menu.selectall'),
                accelerator: "CmdOrCtrl+A",
                selector: "selectAll:"
            },
        ],
      },
      subMenuDev: {
        label: localize('menu.dev'),
        submenu: [
          {
            label: localize('menu.reload'),
            id: 'reload',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              const bw = BrowserWindow.getFocusedWindow();
              if (bw) {
                  bw.webContents.reload();
              } else {
                  this.mainWindow.webContents.reload();

                  // const arr = BrowserWindow.getAllWindows();
                  // arr.forEach((bww) => {
                  //     bww.webContents.openDevTools({ mode: "detach" });
                  // });

                  // for (const wc of webContents.getAllWebContents()) {
                  //   // if (wc.hostWebContents &&
                  //   //     wc.hostWebContents.id === this.mainWindow.webContents.id) {
                  //   // }
                  //   wc.openDevTools({ mode: "detach" });
                  // }
              }
            }
          },
          {
            label: localize('menu.toggleDevTools'),
            id: 'toggleDevTools',
            accelerator: 'Alt+CmdOrCtrl+I',
            click: () => {
              // this.mainWindow.toggleDevTools();
              const arr = BrowserWindow.getAllWindows();
              arr.forEach((bww) => {
                  bww.webContents.toggleDevTools();
              });

              // const bw = BrowserWindow.getFocusedWindow();
              // if (bw) {
              //     bw.webContents.openDevTools({ mode: "detach" });
              // } else {
              //     const arr = BrowserWindow.getAllWindows();
              //     arr.forEach((bww) => {
              //         bww.webContents.openDevTools({ mode: "detach" });
              //     });

              //     // for (const wc of webContents.getAllWebContents()) {
              //     //   // if (wc.hostWebContents &&
              //     //   //     wc.hostWebContents.id === this.mainWindow.webContents.id) {
              //     //   // }
              //     //   wc.openDevTools({ mode: "detach" });
              //     // }
              // }
            }
          },
          {
            label: "Inject React Axe a11y checker",
            id: 'reactAxeA11y',
            accelerator: 'Shift+Alt+CmdOrCtrl+A',
            click: () => {
              // this.mainWindow.toggleDevTools();
              const arr = BrowserWindow.getAllWindows();
              arr.forEach((bww) => {
                bww.webContents.openDevTools({ mode: "detach" });
                setTimeout(() => {
                    bww.webContents.send("REACT_AXE_A11Y", {});
                }, 300);
              });
            }
          }
        ]
      },
      subMenuHelp: {
        label: localize('menu.help'),
        role: 'help',
        submenu: [
          {
            label: localize('menu.knowledgeBase'),
            id: 'knowledgeBase',
            submenu: [
              {
                label: localize('menu.knowledgeBaseOffline'),
                click: () => {
                  new KnowledgeBase(this.mainWindow, undefined);
                }
              },
              {
                label: localize('menu.knowledgeBaseOnline'),
                click: () => {
                  shell.openExternal('http://kb.daisy.org/publishing/docs/index.html');
                }
              }
            ]
          },
          {
            label: localize('menu.learnMore'),
            id: 'learnMore',
            click: () => shell.openExternal('http://daisy.github.io/ace')
          },
          {
            label: localize('menu.reportIssue'),
            id: 'reportIssue',
            click: () => shell.openExternal('http://github.com/DAISY/ace-gui/issues')
          },
          {
            label: localize('menu.copyMessageOutput'),
            id: 'copyMessageOutput',
            click: () => {
              let messages = this.store.getState().app.messages;
              let msgstr = messages.join('\n');
              clipboard.writeText(msgstr);
            }
          }
        ]
      },
      subMenuAbout: {
        label: localize('menu.ace'),
        submenu: [
          {
            label: localize('menu.about'),
            id: 'about2',
            click: () => AboutBoxHelper.showAbout(this.mainWindow)
          },
          {
            type: 'separator'
          },
          {
            // label: localize(x'menu.services'),
            id: 'services',
            role: 'services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            // label: localize(x'menu.hideAce'),
            id: 'hideAce',
            // accelerator: 'Command+H',
            role: 'hide'
          },
          {
            // label: localize(x'menu.hideOthers'),
            id: 'hideOthers',
            // accelerator: 'Command+Alt+H',
            role: 'hideothers'
          },
          {
            // label: localize(x'menu.showAll'),
            id: 'showAll',
            role: 'unhide'
          },
          {
            type: 'separator'
          },
          {
            label: localize('menu.quit'),
            id: 'quit2',
            role: 'quit'
          }
        ]
      },
      subMenuWindow: {
        label: localize('menu.window'),
        role: 'window',
        submenu: [
          // {
          //   label: 'Toggle Full Screen',
          //   type: 'checkbox',
          //   accelerator: process.platform === 'darwin'
          //     ? 'Ctrl+Command+F'
          //     : 'F11',
          //   click: () => this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
          // },
          {
            // label: localize(x'menu.togglefullscreen'),
            role: "togglefullscreen",
          },
          {
            // label: localize(x'menu.minimize'),
            id: 'minimize',
            role: 'minimize'
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
            // label: localize(x'menu.bringToFront'),
            id: 'bringToFront',
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
        label: localize('menu.checkEpubFolder'),
        click: () => {
          setTimeout(async () => {
            await FileDialogHelpers.showEpubFolderBrowseDialog(filepath => this.runAceInRendererProcess(filepath));
          }, 0);
        }
      });

      // insert item into Help submenu
      defaultTemplate.subMenuHelp.submenu.push(
        {
          type: 'separator'
        },
        {
          label: localize('menu.about'),
          id: 'about1',
          click: () => AboutBoxHelper.showAbout(this.mainWindow)
        }
      );
    }
    // Add "File > Quit" menu item so Linux distros where the system tray icon is
    // missing will have a way to quit the app.
    if (process.platform === 'linux' || process.platform === 'win32') {
      defaultTemplate.subMenuFile.submenu.push(
        {
            type: 'separator'
        },
        {
        label: localize('menu.quit'),
        id: 'quit1',
        click: () => app.quit()
      });
    }

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
        defaultTemplate.subMenuWindow,
        defaultTemplate.subMenuHelp
      ];

    return isDev ? menuTemplate.concat(defaultTemplate.subMenuDev) : menuTemplate;
  }

  rebuildMenu() {
    const template = this.buildTemplate();
    const menu = Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(menu); // necessary for app-wide menu on MacOS
    // win.setMenu(menu);

    this.refreshMenuItemsEnabled();
    return menu;
  }

  buildMenu(win) {
    return this.rebuildMenu();
  }
}
