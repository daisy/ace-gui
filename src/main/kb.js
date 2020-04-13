const path = require('path');
const fs = require('fs');
const fsOriginal = require('original-fs');
const url = require('url');
const { BrowserWindow, webContents } = require('electron');
import { app, shell, session, ipcMain, Menu } from 'electron';

import { localizer } from './../shared/l10n/localize';
const { localize } = localizer;

import * as AboutBoxHelper from './../shared/helpers/about';

import * as express from "express";
import * as portfinder from "portfinder";
// import * as http from "http";
import * as https from "https";

import {generateSelfSignedData} from "./selfsigned";

const isDev = process && process.env && (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true');

const LOG_DEBUG = false;
const KB_LOG_PREFIX = "[KB]";

const SESSION_PARTITION = "persist:kb";

const wins = [];
export function closeKnowledgeBaseWindows() {
    if (!wins.length) {
        return;
    }
    for (var i = (wins.length - 1); i >= 0; i--) {
        wins[i].close();
    }
}

let expressApp;
let httpServer;
let port;
let ip;
let proto;
let rootUrl;

function httpReady() {
    ipcMain.on('KB_URL', (event, arg) => {
        const regexp = /http[s]?:\/\/kb.daisy.org\//;
        if (!arg.match(regexp)) {
            shell.openExternal(arg);
            return;
        }
        if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} link ${arg}`);
        const offlineUrl = arg.replace(regexp, `${rootUrl}/`);
        const urlPath = offlineUrl.replace(rootUrl, "");
        if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} urlPath ${urlPath}`);
        new KnowledgeBase(undefined, urlPath);
    });
}

export async function stopKnowledgeBaseServer() {
    // closeKnowledgeBaseWindows();

    if (httpServer) {
        httpServer.close();
    }

    const sess = session.fromPartition(SESSION_PARTITION, { cache: true }); // || session.defaultSession;
    if (sess) {
        try {
            await sess.clearCache();
        } catch (err) {
          console.log(err);
        }
        if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} session cache cleared`);

        try {
            await sess.clearStorageData({
                origin: "*",
                quotas: [
                    "temporary",
                    "persistent",
                    "syncable",
                ],
                storages: [
                    "appcache",
                    "cookies",
                    "filesystem",
                    "indexdb",
                    // "localstorage", BLOCKS!?
                    "shadercache",
                    "websql",
                    "serviceworkers",
                ],
            });
        } catch (err) {
          console.log(err);
        }
        if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} session storage cleared`);
    }
}

const filePathsExpressStaticNotExist = {};
export function startKnowledgeBaseServer(kbRootPath) {

    app.on("certificate-error", (event, webContents, url, error, certificate, callback) => {
        if (url.indexOf(`${rootUrl}/`) === 0) {
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTPS cert error OKAY ${url}`);
            callback(true);
            return;
        }
        if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTPS cert error FAIL ${url}`);
        callback(false);
    });

    const filter = { urls: ["*", "*://*/*"] };

    // const onHeadersReceivedCB = (details, callback) => {
    //     if (!details.url) {
    //         callback({});
    //         return;
    //     }

    //     if (details.url.indexOf(`${rootUrl}/`) === 0) {
    //         if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} CSP ${details.url}`);
    //         callback({
    //             // responseHeaders: {
    //             //     ...details.responseHeaders,
    //             //     "Content-Security-Policy":
    //             //         [`default-src 'self' 'unsafe-inline' 'unsafe-eval' data: http: https: ${rootUrl}`],
    //             // },
    //         });
    //     } else {
    //         if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} !CSP ${details.url}`);
    //         callback({});
    //     }
    // };

    const setCertificateVerifyProcCB = (request, callback) => {

        if (request.hostname === ip) {
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTPS cert verify OKAY ${request.hostname}`);
            callback(0); // OK
            return;
        }
        if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTPS cert verify FALLBACK ${request.hostname}`);
        callback(-3); // Chromium
        // callback(-2); // Fail
    };

    const sess = session.fromPartition(SESSION_PARTITION, { cache: true }); // || session.defaultSession;

    if (sess) {
        // sess.webRequest.onHeadersReceived(filter, onHeadersReceivedCB);
        // sess.webRequest.onBeforeSendHeaders(filter, onBeforeSendHeadersCB);
        sess.setCertificateVerifyProc(setCertificateVerifyProcCB);
    }

    return new Promise((resolve, reject) => {
        expressApp = express();
        // expressApp.enable('strict routing');

        // expressApp.use("/", (req, res, next) => {
        //     if (LOG_DEBUG) console.log("HTTP: " + req.url);
        //     next();
        // });

        const jsInitPath = "js/init.js";
        expressApp.use(`/${jsInitPath}`, (req, res, next) => {

            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTP intercept /${jsInitPath}`);

            let js = fs.readFileSync(path.join(kbRootPath, jsInitPath), { encoding: "utf8" });

            const toMatch1 = "document.location.host == 'localhost'";
            const toMatch2 = "KB.prototype.generateFooter = function () {";
            const link = localize("kbgoonline");
            const online = `
var zhref = document.location.href.replace('${rootUrl}/', 'http://kb.daisy.org/');
var zdiv = document.createElement('div');
zdiv.setAttribute('style','position: fixed; right: 1em; width: auto; background: transparent; margin: 0; padding: 0; padding-top: 0.5em; font-size: 100%; font-weight: bold; font-family: sans-serif; border: 0');

var za = document.createElement('a');
za.setAttribute('href',zhref);
za.setAttribute('target','_BLANK');
za.setAttribute('style','color: red; background-color: white; padding: 0.2em;');
za.appendChild(document.createTextNode('${link}'));

zdiv.appendChild(za);

document.querySelector('header').insertAdjacentElement('beforeEnd', zdiv);
`;
            // js = js.replace("kb.initializePage('ace')", "kb.initializePage('kb')");
            js = js.replace(toMatch1, `${toMatch1} || document.location.hostname == '${rootUrl.replace(/http[s]?:\/\/(.+):[0-9]+/, "$1")}' || document.location.host == '${rootUrl.replace(/http[s]?:\/\//, "")}'`);
            js = js.replace(/http[s]?:\/\/kb.daisy.org\//g, `${rootUrl}/`);
            js = js.replace(toMatch2, `${toMatch2}\n\n${online}\n\n`);
            res.send(js);
            // next();
        });

        if (isDev) { // handle WebInspector JS maps etc.
            expressApp.use("/", (req, res, next) => {
                // const url = new URL(`https://fake.org${req.url}`);
                // const pathname = url.pathname;
                const pathname = url.parse(req.url).pathname;

                const filePath = path.join(kbRootPath, pathname);
                if (filePathsExpressStaticNotExist[filePath]) {
                    res.status(404).send(filePathsExpressStaticNotExist[filePath]);
                    return;
                }
                fsOriginal.exists(filePath, (exists) => {
                    if (exists) {
                        fsOriginal.readFile(filePath, undefined, (err, data) => {
                            if (err) {
                                if (LOG_DEBUG) {
                                    console.log(`${KB_LOG_PREFIX} HTTP FAIL fsOriginal.exists && ERR ${kbRootPath} + ${req.url} => ${filePath}`, err);
                                }
                                filePathsExpressStaticNotExist[filePath] = err.toString();
                                res.status(404).send(filePathsExpressStaticNotExist[filePath]);
                            } else {
                                // if (LOG_DEBUG) {
                                //     console.log(`${KB_LOG_PREFIX} HTTP OK fsOriginal.exists ${kbRootPath} + ${req.url} => ${filePath}`);
                                // }
                                next();
                                // res.send(data);
                            }
                        });
                    } else {
                        fs.exists(filePath, (exists) => {
                            if (exists) {
                                fs.readFile(filePath, undefined, (err, data) => {
                                    if (err) {
                                        if (LOG_DEBUG) {
                                            console.log(`${KB_LOG_PREFIX} HTTP FAIL !fsOriginal.exists && fs.exists && ERR ${kbRootPath} + ${req.url} => ${filePath}`, err);
                                        }
                                        filePathsExpressStaticNotExist[filePath] = err.toString();
                                        res.status(404).send(filePathsExpressStaticNotExist[filePath]);
                                    } else {
                                        if (LOG_DEBUG) {
                                            console.log(`${KB_LOG_PREFIX} HTTP OK !fsOriginal.exists && fs.exists ${kbRootPath} + ${req.url} => ${filePath}`);
                                        }
                                        next();
                                        // res.send(data);
                                    }
                                });
                            } else {
                                if (LOG_DEBUG) {
                                    console.log(`${KB_LOG_PREFIX} HTTP FAIL !fsOriginal.exists && !fs.exists ${kbRootPath} + ${req.url} => ${filePath}`);
                                }
                                res.status(404).end();
                            }
                        });
                    }
                });
            });
        }

        // https://expressjs.com/en/4x/api.html#express.static
        const staticOptions = {
            dotfiles: "ignore",
            etag: true,
            // fallthrough: false,
            immutable: true,
            index: "index.html",
            maxAge: "1d",
            redirect: true,
            // extensions: ["css", "otf"],
            // setHeaders: (res, _path, _stat) => {
            //     //   res.set('x-timestamp', Date.now())
            //     setResponseCORS(res);
            // },
        };
        if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTP static path ${kbRootPath}`);
        expressApp.use("/", express.static(kbRootPath, staticOptions));

        const startHttp = function () {
            generateSelfSignedData().then((certData) => {
                httpServer = https.createServer({ key: certData.private, cert: certData.cert }, expressApp).listen(port, () => {
                    const p = httpServer.address().port;

                    port = p;
                    ip = "127.0.0.1";
                    proto = "https";
                    rootUrl = `${proto}://${ip}:${port}`;
                    if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} URL ${rootUrl}`);

                    resolve();
                    httpReady();
                });
            }).catch((err) => {
                if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} ${err}`);
                if (LOG_DEBUG) console.log(err);
                httpServer = expressApp.listen(port, () => {
                    const p = httpServer.address().port;

                    port = p;
                    ip = "127.0.0.1";
                    proto = "http";
                    rootUrl = `${proto}://${ip}:${port}`;
                    if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} URL ${rootUrl}`);

                    resolve();
                    httpReady();
                });
            });
        }

        portfinder.getPortPromise().then((p) => {
            port = p;
            startHttp();
        }).catch((err) => {
            debug(err);
            port = 3000;
            startHttp();
        });
    });
}

function buildMenuTemplate(win) {

    const defaultTemplate = {
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
                            win.webContents.reload();

                            // const arr = BrowserWindow.getAllWindows();
                            // arr.forEach((bww) => {
                            //     bww.webContents.openDevTools({ mode: "detach" });
                            // });

                            // for (const wc of webContents.getAllWebContents()) {
                            //   // if (wc.hostWebContents &&
                            //   //     wc.hostWebContents.id === win.webContents.id) {
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
                        // win.toggleDevTools();
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
                        //     //   //     wc.hostWebContents.id === win.webContents.id) {
                        //     //   // }
                        //     //   wc.openDevTools({ mode: "detach" });
                        //     // }
                        // }
                    }
                }
            ]
        },
        subMenuHelp: {
            label: localize('menu.help'),
            role: 'help',
            submenu: [
                {
                    label: localize('menu.learnMore'),
                    id: 'learnMore',
                    click: () => shell.openExternal('http://daisy.github.io/ace')
                },
                {
                    label: localize('menu.reportIssue'),
                    id: 'reportIssue',
                    click: () => shell.openExternal('http://github.com/DAISY/ace-gui/issues')
                }
            ]
        },
        subMenuAbout: {
            label: localize('menu.ace'),
            submenu: [
                {
                    label: localize('menu.about'),
                    id: 'about2',
                    click: () => AboutBoxHelper.showAbout(win)
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
                //   click: () => win.setFullScreen(!win.isFullScreen())
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

        // insert item into Help submenu
        defaultTemplate.subMenuHelp.submenu.push(
            {
                type: 'separator'
            },
            {
                label: localize('menu.about'),
                id: 'about1',
                click: () => AboutBoxHelper.showAbout(win)
            }
        );
    }

    let menuTemplate = process.platform === 'darwin' ?
        [
            defaultTemplate.subMenuAbout,
            defaultTemplate.subMenuWindow,
            defaultTemplate.subMenuEdit,
            defaultTemplate.subMenuHelp
        ]
        :
        [
            defaultTemplate.subMenuWindow,
            defaultTemplate.subMenuEdit,
            defaultTemplate.subMenuHelp
        ];

    return isDev ? menuTemplate.concat(defaultTemplate.subMenuDev) : menuTemplate;
}

const WIN_OFFSET = 60;
let winOffset = 0;

export class KnowledgeBase {

    constructor(mainWin, urlPath) {
        this.win = null;
        this.mainWin = mainWin;
        this.urlPath = urlPath;
        this.launch();
    }

    launch() {
        this.win = new BrowserWindow({
            show: false,
            webPreferences: {
                allowRunningInsecureContent: false,
                contextIsolation: false,
                devTools: isDev,
                nodeIntegration: false,
                nodeIntegrationInWorker: false,
                sandbox: false,
                webSecurity: true,
                webviewTag: false,
                partition: SESSION_PARTITION
            },
        });
        wins.push(this.win);

        const template = buildMenuTemplate(this.win);
        this.win.setMenu(Menu.buildFromTemplate(template));

        // this.win.maximize();
        // let sz = this.win.getSize();
        // // open a window that's not quite full screen ... makes sense on mac, anyway
        // this.win.setSize(Math.min(Math.round(sz[0] * .75), 1200), Math.min(Math.round(sz[1] * .85), 800));
        // // win.setPosition(Math.round(sz[0] * .10), Math.round(sz[1] * .10));
        // this.win.setPosition(Math.round(sz[0] * 0.4 - this.win.getSize()[0] * 0.4), Math.round(sz[1] * 0.4 - this.win.getSize()[1] * 0.4));

        this.win.setSize(1024, 768);
        winOffset += WIN_OFFSET;
        if (winOffset > 300) {
            winOffset = WIN_OFFSET;
        }
        this.win.setPosition(winOffset, winOffset);

        this.win.show();

        this.win.webContents.on("new-window", (event, url) => {

            const wcUrl = event.sender.getURL();
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} new-window ${wcUrl} => ${url}`);

            event.preventDefault();

            if (url.indexOf(rootUrl) !== 0) {
                shell.openExternal(url);
                return;
            }

            this.win.loadURL(url);
        });

        this.win.webContents.on("will-navigate", (event, url) => {

            const wcUrl = event.sender.getURL();
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} will-navigate ${wcUrl} => ${url}`);

            if (url.indexOf(rootUrl) !== 0) {
                event.preventDefault();
                shell.openExternal(url);
            }
        });

        // http://kb.daisy.org/publishing/docs/index.html
        if (this.urlPath) {
            this.win.loadURL(`${rootUrl}${this.urlPath}`);
        } else {
            this.win.loadURL(`${rootUrl}/publishing/docs/index.html`);
        }

        this.win.on('closed', function () {
            const i = wins.indexOf(this.win);
            if (i >= 0) {
                wins.splice(i, 1);
            }
            this.win = null;
        });
    }
}
