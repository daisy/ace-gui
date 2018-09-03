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
  getMenuItem("checkEpub").enabled = true;
  //getMenuItem("saveReport").enabled = false;
  getMenuItem("closeReport").enabled = false;
}
function onReportScreen() {
  getMenuItem("checkEpub").enabled = true;
  //getMenuItem("saveReport").enabled = true;
  getMenuItem("closeReport").enabled = true;
}
function onToggleFullScreen(val) {
  getMenuItem("fullScreen").checked = val;
}
function getMenuItem(id) {
  let menu = Menu.getApplicationMenu();
  return menu.getMenuItemById(id);
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
        /*{
          label: 'Save Report...',
          id: 'saveReport',
          accelerator: 'CmdOrCtrl+S'
        },*/
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
  onToggleFullScreen
};
