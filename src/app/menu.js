const {electron, Menu, app} = require('electron');

// entry point to create the menu
function init (appName, callbacks) {
  var menuTemplate = getMenuTemplate(appName);
  attachCallbacks(callbacks, menuTemplate);
  var menu = Menu.buildFromTemplate(menuTemplate);

  Menu.setApplicationMenu(menu);
}

// enable or disable icons based on application state
function onSplashScreen() {
  setMenuItemsEnabled(["checkEpub", "openReport"], true);
  setMenuItemsEnabled(["closeReport", "gotoSummary", "gotoViolations",
  "gotoMetadata", "gotoOutlines", "gotoImages", "showInFinder"], false);
}
function onReportScreen() {
  setMenuItemsEnabled(["checkEpub", "openReport"], true);
  setMenuItemsEnabled(["closeReport", "gotoSummary", "gotoViolations",
  "gotoMetadata", "gotoOutlines", "gotoImages", "showInFinder"], true);
}
function onToggleFullScreen(val) {
  getMenuItem("fullScreen").checked = val;
}
function onProcessing() {
  setMenuItemsEnabled(["checkEpub", "openReport"], false);
  setMenuItemsEnabled(["closeReport", "gotoSummary", "gotoViolations",
  "gotoMetadata", "gotoOutlines", "gotoImages", "showInFinder"], false);
}
function getMenuItem(id) {
  let menu = Menu.getApplicationMenu();
  return menu.getMenuItemById(id);
}
// set many menu items at once
function setMenuItemsEnabled(ids, enabled) {
  //console.log(`Setting menu items enabled=${enabled}`);
  for (id of ids) {
    if (getMenuItem(id)) {
      //console.log(`\t-${id}`);
      getMenuItem(id).enabled = enabled;
    }
  }
}

function getMenuTemplate(appName) {
  // the menu will apparently look correct in production mode
  // https://stackoverflow.com/questions/41551110/unable-to-override-app-name-on-mac-os-electron-menu
  // devs will see "Electron" instead of the app name (e.g. it says 'About Electron')
  // need to test this though

  // sets up cross-platform structure (lowest common denominator) for File, View, Help menus
  var template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Check EPUB...',
          id: 'checkEpub',
          accelerator: 'CmdOrCtrl+O'
        },
        {
          label: 'Open Report...',
          id: 'openReport',
        },
        {
          label: 'Close Report',
          id: 'closeReport',
          accelerator: 'CmdOrCtrl+Shift+C'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Full Screen',
          type: 'checkbox',
          id: 'fullScreen',
          accelerator: process.platform === 'darwin'
            ? 'Ctrl+Command+F'
            : 'F11'
        },
        {
          type: 'separator'
        },
        {
          label: 'Go to Summary',
          id: 'gotoSummary',
          accelerator: 'CmdOrCtrl+Shift+S'
        },
        {
          label: 'Go to Violations',
          id: 'gotoViolations',
          accelerator: 'CmdOrCtrl+Shift+V'
        },
        {
          label: 'Go to Metadata',
          id: 'gotoMetadata',
          accelerator: 'CmdOrCtrl+Shift+M'
        },
        {
          label: 'Go to Outlines',
          id: 'gotoOutlines',
          accelerator: 'CmdOrCtrl+Shift+O'
        },
        {
          label: 'Go to Images',
          id: 'gotoImages',
          accelerator: 'CmdOrCtrl+Shift+I'
        },
        {
          type: 'separator'
        },
        {
          label: process.platform == 'darwin' ? 'Show in Finder' : 'Show in Explorer',
          id: 'showInFinder',
          accelerator: 'CmdOrCtrl+Shift+F'
        }
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Knowledge Base',
          id: 'knowledgeBase'
        },
        {
          label: 'Learn more',
          id: 'learnMore'
        },
        {
          label: 'Report an Issue...',
          id: 'reportIssue'
        },
        {
          label: 'Copy Messages',
          id: 'copyMessages'
        }
      ]
    }
  ];

  // customize for Darwin by adding App and Window menus
  // the order will be: AppName, File, View, Window, Help
  if (process.platform === 'darwin') {
    // App menu
    template.unshift({
      label: appName,
      submenu: [
        {
          label: 'About ' + appName,
          id: 'about'
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
          label: 'Hide ' + appName,
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
    });

    // Window menu
    template.splice(3, 0, {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          type: 'separator'
        },
        {
          label: 'Bring All to Front',
          role: 'front'
        }
      ]
    });
  }

  // On Windows and Linux, open dialogs do not support selecting both files and
  // folders and files, so add an extra menu item so there is one for each type.
  if (process.platform === 'linux' || process.platform === 'win32') {
    // insert item into File submenu
    template[0].submenu.unshift({
      label: 'Check EPUB Folder ... ',
      id: 'checkEpubFolder'
    });

    // insert item into Help submenu
    template[2].submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'About ' + appName,
        id: 'about'
      }
    );
  }
  // Add "File > Quit" menu item so Linux distros where the system tray icon is
  // missing will have a way to quit the app.
  if (process.platform === 'linux') {
    // File menu (Linux)
    template[0].submenu.push({
      label: 'Quit',
      id: 'quit'
    });
  }

  return template;
}

// add callbacks to the menu items, formatted like {MenuId: function, ...}:
function attachCallbacks(callbacks, menuTemplate) {

  for (let item of menuTemplate) {
    if ("id" in item) {
      if (item['id'] in callbacks) {
        item.click = callbacks[item['id']];
      }
    }

    for (var key in item) {
      if (item[key] instanceof Array) {
        attachCallbacks(callbacks, item[key]);
      }
    }
  }
}

// export some functions to control the menu (e.g. check/uncheck/enable items in response to application state changes)
module.exports = {
  init,
  onSplashScreen,
  onReportScreen,
  onToggleFullScreen,
  onProcessing
};
