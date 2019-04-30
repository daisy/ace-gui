import { app, Menu, shell, dialog, clipboard } from 'electron';
import {
  runAce,
  openReport,
  closeReport,
  exportReport
} from './../shared/actions/app';
import {selectTab} from './../shared/actions/reportView';
import * as FileDialogHelpers from './../shared/helpers/fileDialogs';
import * as AboutBoxHelper from './../shared/helpers/about';

import { localizer } from './../shared/l10n/localize';
const { getCurrentLanguage, localize } = localizer;

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
    let newReady = !this.store.getState().app.processing.ace;
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

  buildTemplate() {

    const defaultTemplate = {
      subMenuFile: {
        label: localize('menu.file'),
        submenu: [
          {
            label: localize('menu.checkEpub'),
            id: 'checkEpub',
            accelerator: 'CmdOrCtrl+O',
            click: () => process.platform == 'darwin'
              ?FileDialogHelpers.showEpubFileOrFolderBrowseDialog(filepath => this.store.dispatch(runAce(filepath)))
              :FileDialogHelpers.showEpubFileBrowseDialog(filepath => this.store.dispatch(runAce(filepath)))
          },
          {
            label: localize('menu.openReport'),
            id: 'openReport',
            click: () => FileDialogHelpers.showReportFileBrowseDialog(filepath => this.store.dispatch(openReport(filepath)))
          },
          {
            type: 'separator'
          },
          {
            label: localize('menu.rerunAce'),
            id: 'rerunAce',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => this.store.dispatch(runAce(this.store.getState().app.inputPath))
          },
          {
            type: 'separator'
          },
          {
            label: localize('menu.exportReport'),
            id: 'exportReport',
            accelerator: 'CmdOrCtrl+Shift+E',
            click: () => FileDialogHelpers.showExportReportDialog(filepath => this.store.dispatch(exportReport(filepath)))
          },
          {
            type: 'separator'
          },
          {
            label: localize('menu.closeReport'),
            id: 'closeReport',
            accelerator: 'CmdOrCtrl+Shift+C',
            click: () => this.store.dispatch(closeReport())
          },
        ]
      },
      subMenuView: {
        label: localize('menu.view'),
        submenu: [
          {
            label: localize('menu.toggleFullScreen'),
            id: 'toggleFullScreen',
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
      subMenuDev: {
        label: localize('menu.dev'),
        submenu: [
          {
            label: localize('menu.reload'),
            id: 'reload',
            accelerator: 'Command+R',
            click: () => this.mainWindow.webContents.reload()
          },
          {
            label: localize('menu.toggleDevTools'),
            id: 'toggleDevTools',
            accelerator: 'Alt+Command+I',
            click: () => this.mainWindow.toggleDevTools()
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
            click: () => shell.openExternal('http://kb.daisy.org/publishing/')
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
            click: () => AboutBoxHelper.showAbout()
          },
          {
            type: 'separator'
          },
          {
            label: localize('menu.services'),
            id: 'services',
            role: 'services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            label: localize('menu.hideAce'),
            id: 'hideAce',
            accelerator: 'Command+H',
            role: 'hide'
          },
          {
            label: localize('menu.hideOthers'),
            id: 'hideOthers',
            accelerator: 'Command+Alt+H',
            role: 'hideothers'
          },
          {
            label: localize('menu.showAll'),
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
          {
            label: localize('menu.minimize'),
            id: 'minimize',
            role: 'minimize'
          },
          { type: 'separator' },
          {
            label: localize('menu.bringToFront'),
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
        click: () => FileDialogHelpers.showEpubFolderBrowseDialog(filepath => this.store.dispatch(runAce(filepath)))
      });

      // insert item into Help submenu
      defaultTemplate.subMenuHelp.submenu.push(
        {
          type: 'separator'
        },
        {
          label: localize('menu.about'),
          id: 'about1',
          click: () => AboutBoxHelper.showAbout()
        }
      );
    }
    // Add "File > Quit" menu item so Linux distros where the system tray icon is
    // missing will have a way to quit the app.
    if (process.platform === 'linux') {
      // File menu (Linux)
      defaultTemplate.subMenuFile.submenu.push({
        label: localize('menu.quit'),
        id: 'quit1',
        click: () => app.quit()
      });
    }

    let isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

    let menuTemplate = process.platform === 'darwin' ?
      [
        defaultTemplate.subMenuAbout,
        defaultTemplate.subMenuFile,
        defaultTemplate.subMenuView,
        defaultTemplate.subMenuWindow,
        defaultTemplate.subMenuHelp
      ]
      :
      [
        defaultTemplate.subMenuFile,
        defaultTemplate.subMenuView,
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
          label: 'Inspect element', // NOT LOCALIZED (debug/dev only)
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }
      ]).popup(this.mainWindow);
    });
  }

  rebuildMenu() {
    const template = this.buildTemplate();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    this.refreshMenuItemsEnabled();
    return menu;
  }

  buildMenu() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    return this.rebuildMenu();
  }

}
