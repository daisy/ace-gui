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

const LOG_DEBUG = true;
const AXE_LOG_PREFIX = "[AXE]";

const SESSION_PARTITION = "persist:axe";

let expressApp;
let httpServer;
let port;
let ip;
let proto;
let rootUrl;

let browserWindow = undefined;

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

    const onHeadersReceivedCB = (details, callback) => {
        if (!details.url) {
            callback({});
            return;
        }

        if (details.url.indexOf(`${rootUrl}/`) === 0) {
            if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} CSP ${details.url}`);
            callback({
                // responseHeaders: {
                //     ...details.responseHeaders,
                //     "Content-Security-Policy":
                //         [`default-src 'self' 'unsafe-inline' 'unsafe-eval' data: http: https: ${rootUrl}`],
                // },
            });
        } else {
            if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} !CSP ${details.url}`);
            callback({});
        }
    };

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
        sess.webRequest.onHeadersReceived(filter, onHeadersReceivedCB);
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

        if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} axeRunner running ...`);

        const basedir = arg.basedir;
        const u = arg.url;
        const scripts = arg.scripts;

        console.log("----- AXE RUN");
        console.log(basedir);
        console.log(u);
        console.log(JSON.stringify(scripts));

        function doRun() {

            // const page = await _browser.newPage();
            // await page.goto(url);
            // await utils.addScripts(scripts, page);

            // const results = await page.evaluate(() => new Promise((resolve, reject) => {
            //     /* eslint-disable */
            //     window.daisy.ace.run((err, res) => {
            //     if (err) {
            //         return reject(err);
            //     }
            //     return resolve(res);
            //     });
            //     /* eslint-enable */
            // }));
            // await page.close();
            // return results;

            const p = decodeURI(url.parse(u).pathname);
            const httpUrl = rootUrl + p.replace(basedir, "");

            if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} axeRunner ${httpUrl}`);
            browserWindow.loadURL(httpUrl);

            setTimeout(() => {
                if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} axeRunner finished run.`);

                event.sender.send("AXE_RUNNER_RUN_", {
                    errzz: "DANIEL",
                    ok: []
                });
            }, 1000);
        }

        if (!httpServer) { // lazy init
            startAxeServer(basedir, scripts).then(() => {
                if (LOG_DEBUG) console.log(`${AXE_LOG_PREFIX} server started`);

                browserWindow = new BrowserWindow({
                    show: true,
                    webPreferences: {
                        title: "Axe Electron runner",
                        allowRunningInsecureContent: false,
                        contextIsolation: false,
                        // devTools: true,
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
                browserWindow.show();

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

        expressApp = express();
        // expressApp.enable('strict routing');

        // expressApp.use("/", (req, res, next) => {
        //     if (LOG_DEBUG) console.log("HTTP: " + req.url);
        //     next();
        // });

        scripts.forEach((scriptPath) => {
            const filename = path.basename(scriptPath);
        });

//         const jsInitPath = "js/init.js";
//         expressApp.use(`/${jsInitPath}`, (req, res, next) => {

//             if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTP intercept /${jsInitPath}`);

//             let js = fs.readFileSync(path.join(kbRootPath, jsInitPath), { encoding: "utf8" });

//             const toMatch1 = "document.location.host == 'localhost'";
//             const toMatch2 = "KB.prototype.generateFooter = function () {";
//             const link = "GO ONLINE";
//             const online = `
// var zhref = document.location.href.replace('${rootUrl}/', 'http://kb.daisy.org/');
// var zdiv = document.createElement('div');
// zdiv.setAttribute('style','position: fixed; right: 1em; width: auto; background: transparent; margin: 0; padding: 0; padding-top: 0.5em; font-size: 100%; font-weight: bold; font-family: sans-serif; border: 0');

// var za = document.createElement('a');
// za.setAttribute('href',zhref);
// za.setAttribute('target','_BLANK');
// za.setAttribute('style','color: red;');
// za.appendChild(document.createTextNode('${link}'));

// zdiv.appendChild(za);

// document.querySelector('header').insertAdjacentElement('beforeEnd', zdiv);
// `;
//             // js = js.replace("kb.initializePage('ace')", "kb.initializePage('kb')");
//             js = js.replace(toMatch1, `${toMatch1} || document.location.hostname == '${rootUrl.replace(/http[s]?:\/\/(.+):[0-9]+/, "$1")}' || document.location.host == '${rootUrl.replace(/http[s]?:\/\//, "")}'`);
//             js = js.replace(/http[s]?:\/\/kb.daisy.org\//g, `${rootUrl}/`);
//             js = js.replace(toMatch2, `${toMatch2}\n\n${online}\n\n`);
//             res.send(js);
//             // next();
//         });

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
