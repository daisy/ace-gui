'use strict';

const path = require('path');
const fs = require('fs');
const url = require('url');

import { app, session, BrowserWindow, webContents, ipcMain } from 'electron';

import * as express from "express";
import * as portfinder from "portfinder";
// import * as http from "http";
import * as https from "https";

import { generateSelfSignedData } from "./selfsigned";

const logger = require('@daisy/ace-logger');
logger.initLogger({ verbose: true, silent: false });

let isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
const showWindow = true;

const LOG_DEBUG = true;
const AXE_LOG_PREFIX = "[AXE]";

const SESSION_PARTITION = "persist:axe";

const HTTP_QUERY_PARAM = "AXE_RUNNER";

let expressApp;
let httpServer;
let port;
let ip;
let proto;
let rootUrl;

let browserWindow = undefined;

const jsCache = {};

export function axeRunnerInitEvents() {

    app.on("certificate-error", (event, webContents, u, error, certificate, callback) => {
        if (u.indexOf(`${rootUrl}/`) === 0) {
            if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} HTTPS cert error OKAY ${u}`);
            callback(true);
            return;
        }
        if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} HTTPS cert error FAIL ${u}`);
        callback(false);
    });

    const filter = { urls: ["*", "*://*/*"] };

    // const onHeadersReceivedCB = (details, callback) => {
    //     if (!details.url) {
    //         callback({});
    //         return;
    //     }

    //     if (details.url.indexOf(`${rootUrl}/`) === 0) {
    //         if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} CSP ${details.url}`);
    //         callback({
    //             // responseHeaders: {
    //             //     ...details.responseHeaders,
    //             //     "Content-Security-Policy":
    //             //         [`default-src 'self' 'unsafe-inline' 'unsafe-eval' data: http: https: ${rootUrl}`],
    //             // },
    //         });
    //     } else {
    //         if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} !CSP ${details.url}`);
    //         callback({});
    //     }
    // };

    const setCertificateVerifyProcCB = (request, callback) => {

        if (request.hostname === ip) {
            if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} HTTPS cert verify OKAY ${request.hostname}`);
            callback(0); // OK
            return;
        }
        if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} HTTPS cert verify FALLBACK ${request.hostname}`);
        callback(-3); // Chromium
        // callback(-2); // Fail
    };

    const sess = session.fromPartition(SESSION_PARTITION, { cache: true }); // || session.defaultSession;

    if (sess) {
        // sess.webRequest.onHeadersReceived(filter, onHeadersReceivedCB);
        // sess.webRequest.onBeforeSendHeaders(filter, onBeforeSendHeadersCB);
        sess.setCertificateVerifyProc(setCertificateVerifyProcCB);
    }

    ipcMain.on('AXE_RUNNER_CLOSE', (event, arg) => {

        if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} axeRunner closing ...`);

        if (browserWindow) {
            browserWindow.close();
            browserWindow = undefined;
        }

        if (httpServer) {
            httpServer.close();
            httpServer = undefined;
        }

        const sess = session.fromPartition(SESSION_PARTITION, { cache: true }); // || session.defaultSession;
        if (sess) {
            sess.clearCache(() => {
                if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} session cache cleared`);
            });

            sess.clearStorageData({
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
                    "localstorage",
                    "shadercache",
                    "websql",
                    "serviceworkers",
                ],
            }, () => {
                if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} session storage cleared`);
            });
        }

        return Promise.resolve();
        // return new Promise((resolve, reject) => {
        // });
    });

    ipcMain.on('AXE_RUNNER_RUN', (event, arg) => {

        const basedir = arg.basedir;
        const u = arg.url;
        const scripts = arg.scripts;

        if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} axeRunner running ... ${basedir} ${u}`);

        function doRun() {

            const p = decodeURI(url.parse(u).pathname);
            const httpUrl = rootUrl + p.replace(basedir, "");

            let replySent = false;

            browserWindow.webContents.once("dom-ready", () => {
                if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} axeRunner DOM READY ${httpUrl}`);

                const js = `
new Promise((resolve, reject) => {
    window.daisy.ace.run((err, res) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(res);
    });
}).then(res => res).catch(err => { throw err; });
`;
                browserWindow.webContents.executeJavaScript(js, true)
                    .then((ok) => {
                        if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} axeRunner done.`);
                        replySent = true;
                        event.sender.send("AXE_RUNNER_RUN_", {
                            ok
                        });
                    })
                    .catch((err) => {
                        if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} axeRunner fail!`);
                        replySent = true;
                        event.sender.send("AXE_RUNNER_RUN_", {
                            err
                        });
                    });
            });

            if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} axeRunner LOAD URL ... ${httpUrl}`);
            browserWindow.loadURL(`${httpUrl}?${HTTP_QUERY_PARAM}=1`);

            setTimeout(() => {
                if (replySent) {
                    return;
                }
                replySent = true;

                if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} axeRunner timeout!`);
                event.sender.send("AXE_RUNNER_RUN_", {
                    err: "Timeout :("
                });
            }, 3000);
        }

        if (!httpServer) { // lazy init
            startAxeServer(basedir, scripts).then(() => {
                if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} server started`);

                browserWindow = new BrowserWindow({
                    show: showWindow,
                    webPreferences: {
                        devTools: isDev && showWindow,
                        title: "Axe Electron runner",
                        allowRunningInsecureContent: false,
                        contextIsolation: false,
                        nodeIntegration: false,
                        nodeIntegrationInWorker: false,
                        sandbox: false,
                        webSecurity: true,
                        webviewTag: false,
                        partition: SESSION_PARTITION
                    },
                });

                browserWindow.maximize();
                let sz = browserWindow.getSize();
                const sz0 = sz[0];
                const sz1 = sz[1];
                browserWindow.unmaximize();
                browserWindow.setSize(Math.min(Math.round(sz0 * .75), 1200), Math.min(Math.round(sz1 * .85), 800));
                // browserWindow.setPosition(Math.round(sz[0] * .10), Math.round(sz[1] * .10));
                browserWindow.setPosition(Math.round(sz0 * 0.5 - browserWindow.getSize()[0] * 0.5), Math.round(sz1 * 0.5 - browserWindow.getSize()[1] * 0.5));
                if (showWindow) {
                    browserWindow.show();
                }

                browserWindow.webContents.setAudioMuted(true);

                doRun();
            }).catch((err) => {
                console.log(err);
                event.sender.send("AXE_RUNNER_RUN_", {
                    err: err,
                });
            });
        } else {
            doRun();
        }
    });
}

export function startAxeServer(epubRootPath, scripts) {

    return new Promise((resolve, reject) => {

        let scriptsMarkup = "";
        scripts.forEach((scriptPath) => {
            const filename = path.basename(scriptPath);
            scriptsMarkup += `<script data-ace="" src="/${HTTP_QUERY_PARAM}/${filename}"> </script>`;
        });

        expressApp = express();
        // expressApp.enable('strict routing');

        // expressApp.use("/", (req, res, next) => {
        //     if (LOG_DEBUG) console.log("HTTP: " + req.url);
        //     next();
        // });

        expressApp.use("/", (req, res, next) => {

            for (const scriptPath of scripts) {
                const filename = path.basename(scriptPath);
                if (req.url.endsWith(`${HTTP_QUERY_PARAM}/${filename}`)) {
                    let js = jsCache[scriptPath];
                    if (!js) {
                        if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} HTTP loading ${scriptPath}`);
                        js = fs.readFileSync(scriptPath, { encoding: "utf8" });
                        jsCache[scriptPath] = js;
                    }
                    res.send(js);
                    return;
                }
            }

            if (req.query[HTTP_QUERY_PARAM]) {
                if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} HTTP intercept ${req.url}`);

                let html = fs.readFileSync(path.join(epubRootPath, url.parse(req.url).pathname), { encoding: "utf8" });

                if (html.match(/<\/head>/)) {
                    html = html.replace(/<\/head>/, `${scriptsMarkup}</head>`);
                } else if (html.match(/<\/body>/)) {
                    if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} HTML no </head>? (using </body>) ${req.url}`);
                    html = html.replace(/<\/body>/, `${scriptsMarkup}</body>`);
                } else {
                    if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} HTML neither </head> nor </body>?! ${req.url}`);
                }

                res.send(html);
                return;
            }

            next();
        });

        // https://expressjs.com/en/4x/api.html#express.static
        const staticOptions = {
            dotfiles: "ignore",
            etag: true,
            // fallthrough: false,
            immutable: true,
            // index: "index.html",
            maxAge: "1d",
            redirect: false,
            // extensions: ["css", "otf"],
            // setHeaders: (res, _path, _stat) => {
            //     //   res.set('x-timestamp', Date.now())
            //     setResponseCORS(res);
            // },
        };
        if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} HTTP static path ${epubRootPath}`);
        expressApp.use("/", express.static(epubRootPath, staticOptions));

        const startHttp = function () {
            generateSelfSignedData().then((certData) => {
                httpServer = https.createServer({ key: certData.private, cert: certData.cert }, expressApp).listen(port, () => {
                    const p = httpServer.address().port;

                    port = p;
                    ip = "127.0.0.1";
                    proto = "https";
                    rootUrl = `${proto}://${ip}:${port}`;
                    if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} URL ${rootUrl}`);

                    resolve();
                });
            }).catch((err) => {
                if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} ${err}`);
                if (LOG_DEBUG) console.log(err);
                httpServer = expressApp.listen(port, () => {
                    const p = httpServer.address().port;

                    port = p;
                    ip = "127.0.0.1";
                    proto = "http";
                    rootUrl = `${proto}://${ip}:${port}`;
                    if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} URL ${rootUrl}`);

                    resolve();
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
