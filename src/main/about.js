const join = require("path").join;
const electron_1 = require("electron");
const fs_1 = require("fs");
const path = require("path");

// import {checkLatestVersion} from './versionCheck';
const checkLatestVersion = require("./versionCheck").checkLatestVersion;

const isDev =
  process &&
  process.env &&
  (process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true");

function encodeURIComponent_RFC3986(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
    return "%" + c.charCodeAt(0).toString(16);
  });
}

function loadPackageJson(pkg_path) {
  try {
    return JSON.parse(fs_1.readFileSync(pkg_path, { encoding: "utf8" }));
  } catch (e) {
    // console.log(pkg_path);
    // console.log(e);
    return null;
  }
}
function detectPackageJson(specified_dir, app) {
  if (specified_dir) {
    const pkg = loadPackageJson(path.join(specified_dir, "package.json"));
    if (pkg !== null) {
      return pkg;
    } else {
      const pkg = loadPackageJson(
        path.join(specified_dir, "..", "package.json"),
      );
      if (pkg !== null) {
        return pkg;
      } else {
        console.log(
          "about-window: package.json is not found in specified directory path: " +
            specified_dir,
        );
      }
    }
  }
  const app_name = app.name || app.getName();
  for (const mod_path of module.paths) {
    if (!path.isAbsolute(mod_path)) {
      continue;
    }
    const p = path.join(mod_path, "..", "package.json");
    try {
      const stats = (0, fs_1.statSync)(p);
      if (stats.isFile()) {
        const pkg = loadPackageJson(p);
        if (pkg !== null && pkg.productName === app_name) {
          return pkg;
        }
      }
    } catch (e) {}
  }
  return null;
}
function injectInfoFromPackageJson(info, app) {
  const pkg = detectPackageJson(info.package_json_dir, app);
  if (pkg === null) {
    return info;
  }
  if (!info.product_name) {
    info.product_name = pkg.productName || pkg.build.productName;
  }
  if (!info.description) {
    info.description = pkg.description;
  }
  if (!info.license && pkg.license) {
    const l = pkg.license;
    info.license = typeof l === "string" ? l : l.type;
  }
  if (!info.homepage) {
    info.homepage = pkg.homepage;
  }
  if (!info.bug_report_url && typeof pkg.bugs === "object") {
    info.bug_report_url = pkg.bugs.url;
  }
  if (info.use_inner_html === undefined) {
    info.use_inner_html = false;
  }
  if (info.use_version_info === undefined) {
    info.use_version_info = true;
  }
  return info;
}
function normalizeParam(info_or_img_path) {
  if (!info_or_img_path) {
    throw new Error(
      "First parameter of openAboutWindow() must not be empty. Please see the document: https://github.com/rhysd/electron-about-window/blob/master/README.md",
    );
  }
  if (typeof info_or_img_path === "string") {
    return { icon_path: info_or_img_path };
  } else {
    const info = info_or_img_path;
    if (!info.icon_path) {
      throw new Error(
        "First parameter of openAboutWindow() must have key 'icon_path'. Please see the document: https://github.com/rhysd/electron-about-window/blob/master/README.md",
      );
    }
    return Object.assign({}, info);
  }
}
function openAboutWindow(info_or_img_path) {
  let window = null;
  let info = normalizeParam(info_or_img_path);
  const ipc =
    electron_1.ipcMain !== null && electron_1.ipcMain !== void 0
      ? electron_1.ipcMain
      : info.ipcMain;
  const app =
    electron_1.app !== null && electron_1.app !== void 0
      ? electron_1.app
      : info.app;
  const BrowserWindow =
    electron_1.BrowserWindow !== null && electron_1.BrowserWindow !== void 0
      ? electron_1.BrowserWindow
      : info.BrowserWindow;
  if (!app || !BrowserWindow || !ipc) {
    throw new Error(
      "openAboutWindow() is called on non-main process. Set 'app', 'BrowserWindow' and 'ipcMain' properties in the 'info' argument of the function call",
    );
  }
  if (window !== null) {
    window.focus();
    return window;
  }
  // let base_path = info.about_page_dir;
  // if (base_path === undefined || base_path === null || !base_path.length) {
  //     base_path = path.join(__dirname, '..');
  // }
  // const index_html = 'file://' + path.join(base_path, 'about.html');
  const options = Object.assign(
    {
      width: 400,
      height: 400,
      useContentSize: true,
      titleBarStyle: "hidden-inset",
      show: !info.adjust_window_size,
      icon: info.icon_path,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    },
    info.win_options || {},
  );
  window = new BrowserWindow(options);
  const on_win_adjust_req = (_, width, height, show_close_button) => {
    if (height > 0 && width > 0) {
      if (show_close_button) {
        window.setContentSize(width, height + 40);
      } else {
        window.setContentSize(width, height + 52);
      }
    }
  };
  const on_win_close_req = () => {
    window.close();
  };
  ipc.on("about-window:adjust-window-size", on_win_adjust_req);
  ipc.on("about-window:close-window", on_win_close_req);
  window.once("closed", () => {
    window = null;
    ipc.removeListener("about-window:adjust-window-size", on_win_adjust_req);
    ipc.removeListener("about-window:close-window", on_win_close_req);
  });

  window.webContents.on("will-navigate", (e, url) => {
    e.preventDefault();
    electron_1.shell.openExternal(url);
  });
  window.webContents.on("new-window", (e, url) => {
    e.preventDefault();
    electron_1.shell.openExternal(url);
  });

  info = injectInfoFromPackageJson(info, app);

  // console.log("BEFORE DOM READY: ", JSON.stringify(info, null, 4));

  window.webContents.once("dom-ready", () => {
    const win_title = info.win_options ? info.win_options.title : null;

    // delete info.win_options;
    // info = JSON.parse(JSON.stringify(info));

    JSON.stringify(win_title, null, 4);
    info.win_options = {
      title: win_title,
    };

    const app_name = info.product_name || app.name || app.getName();
    const version = app.getVersion();

    // console.log("about-window:info SENDING");
    // console.log(
    //   info.product_name,
    //   app.name,
    //   app.getName(),
    //   app_name,
    //   version,
    //   JSON.stringify(info, null, 4),
    //   JSON.stringify(info.win_options, null, 4),
    // );

    window.webContents.send(
      "about-window:info",
      JSON.parse(JSON.stringify(info)),
      app_name,
      version,
    );
    if (info.open_devtools) {
      // if (process.versions.electron >= "1.4") {
      window.webContents.openDevTools({ mode: "detach" });
      // } else {
      //   window.webContents.openDevTools();
      // }
    }
  });
  window.once("ready-to-show", () => {
    window.show();
  });
  window.setMenu(null);

  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1, user-scalable=yes">
          <title>Daisy Ace</title>
          <style type="text/css">
              /*<![CDATA[*/
          body,
          html {
            width: 100%;
            height: 100%;
            -webkit-user-select: none;
            user-select: none;
            -webkit-app-region: drag;
          }

          body {
            margin: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #333;
            background-color: #eee;
            font-size: 12px;
            font-family: 'Helvetica', 'Arial', 'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', 'メイリオ', Meiryo, 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif;
          }

          .logo {
            width: 200px;
            -webkit-user-select: none;
            user-select: none;
          }

          .title,
          .copyright,
          .description {
            margin: 0.2em;
          }

          .clickable {
            cursor: pointer;
          }

          .description {
            margin-bottom: 1em;
            text-align: center;
          }

          .versions {
            border-collapse: collapse;
            margin-top: 1em;
          }

          .copyright,
          .versions {
            color: #999;
          }

          .buttons {
            margin-bottom: 1em;
            text-align: center;
          }

          .buttons button {
            margin-top: 1em;
            width: 100px;
            height: 24px;
          }

          .link {
            cursor: pointer;
            color: #80a0c2;
          }

          .bug-report-link {
            position: absolute;
            right: 0.5em;
            bottom: 0.5em;
          }

          .clickable,
          .bug-report-link,
          .buttons button {
            -webkit-app-region: no-drag;
          }
          /*]]>*/
          </style>
        </head>
        <body>
          <div class="logo">
            <img id="app-icon" alt="App icon" height="200">
          </div>
          <h2 class="title"></h2>
          <h3 class="description"></h3>
          <div class="copyright"></div>
          <table class="versions"></table>
          <div class="buttons"></div>
          <footer class="footer">
            <div class="link bug-report-link"></div>
          </footer>

          <!-- https://github.com/electron/electron/issues/2863 -->
          <script>var exports = exports || {};</script>

          <script type="text/javascript">
          //<![CDATA[
const electron_1 = require('electron');

electron_1.ipcRenderer.on('about-window:info', function (_, info, app_name, version) {

//console.log(app_name, version, JSON.stringify(info, null, 4), JSON.stringify(info.win_options, null, 4));

    function open_home() { electron_1.shell.openExternal(info.homepage); }
    const content = info.use_inner_html ? 'innerHTML' : 'innerText';
    document.title = info.win_options.title || \`\${app_name}\`;
    const title_elem = document.querySelector('.title');
    title_elem.innerText = \`\${app_name} \${version}\`;
    if (info.homepage) {
        title_elem.addEventListener('click', open_home);
        title_elem.classList.add('clickable');
        const logo_elem = document.querySelector('.logo');
        logo_elem.addEventListener('click', open_home);
        logo_elem.classList.add('clickable');
    }
    const copyright_elem = document.querySelector('.copyright');
    if (info.copyright) {
        copyright_elem[content] = info.copyright;
    }
    else if (info.license) {
        copyright_elem[content] = \`LICENSE \${info.license}\`;
    }
    const icon_elem = document.getElementById('app-icon');
    icon_elem.src = info.icon_path;
    if (info.description) {
        const desc_elem = document.querySelector('.description');
        desc_elem[content] = info.description;
    }
    if (info.bug_report_url) {
        const bug_report = document.querySelector('.bug-report-link');
        bug_report.innerText = info.bug_link_text || 'Report an issue';
        bug_report.addEventListener('click', e => {
            e.preventDefault();
            electron_1.shell.openExternal(info.bug_report_url);
        });
    }
    if (info.css_path) {
        const css_paths = !Array.isArray(info.css_path) ? [info.css_path] : info.css_path;
        for (const css_path of css_paths) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = css_path;
            document.head.appendChild(link);
        }
    }
    if (info.adjust_window_size) {
        const height = document.body.scrollHeight;
        const width = document.body.scrollWidth;
        electron_1.ipcRenderer.send('about-window:adjust-window-size', height, width, !!info.show_close_button);
    }
    if (!!info.use_version_info) {
        const versions = document.querySelector('.versions');
        const version_info = Array.isArray(info.use_version_info)
            ? info.use_version_info
            : ['electron', 'chrome', 'node', 'v8'].map(e => [e, process.versions[e]]);
        for (const [name, value] of version_info) {
            const tr = document.createElement('tr');
            const name_td = document.createElement('td');
            name_td.innerText = name;
            tr.appendChild(name_td);
            const version_td = document.createElement('td');
            version_td.innerText = ' : ' + value;
            tr.appendChild(version_td);
            versions.appendChild(tr);
        }
    }
    if (info.show_close_button) {
        const buttons = document.querySelector('.buttons');
        const close_button = document.createElement('button');
        close_button.innerText = info.show_close_button;
        close_button.addEventListener('click', e => {
            e.preventDefault();
            electron_1.ipcRenderer.send('about-window:close-window');
        });
        buttons.appendChild(close_button);
        close_button.focus();
    }
});

    //]]>
          </script>
        </body>
      </html>
      `;
  const index_html = `data:text/html;charset=utf-8,${encodeURIComponent_RFC3986(html)}`;

  window.loadURL(index_html);

  return window;
}

module.exports = {
  showAbout: (browserWindow) => {
    setTimeout(() => {
      checkLatestVersion(browserWindow);
    }, 500);

    return openAboutWindow({
      icon_path:
        "filexx://0.0.0.0/" + encodeURIComponent_RFC3986(join(__dirname, "logo.svg")),
      copyright: "Copyright (c) 2026 DAISY Consortium",
      package_json_dir: __dirname,
      open_devtools: isDev,
      win_options: {
        webPreferences: {
          // enableRemoteModule: false,
          allowRunningInsecureContent: false,
          backgroundThrottling: false,
          devTools: isDev,
          nodeIntegration: true, // ==> disables sandbox https://www.electronjs.org/docs/latest/tutorial/sandbox
          sandbox: false,
          contextIsolation: false, // must be false because nodeIntegration, see https://github.com/electron/electron/issues/23506
          nodeIntegrationInWorker: false,
          webSecurity: true,
          webviewTag: false,
          partition: "persist:about",
        },
      },
    });
  },
};
