const path = require('path');
const fs = require('fs');
const { BrowserWindow, webContents } = require('electron');
import { app, shell, session } from 'electron';

import * as express from "express";
import * as portfinder from "portfinder";
// import * as http from "http";
import * as https from "https";

import * as selfsigned from "selfsigned";
import * as uuid from "uuid";

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
export function stopKnowledgeBaseServer() {
    closeKnowledgeBaseWindows();

    if (httpServer) {
        httpServer.close();
    }

    const sess = session.fromPartition(SESSION_PARTITION, { cache: true }) || session.defaultSession;
    if (sess) {
        sess.clearCache(() => {
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} session cache cleared`);
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
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} session storage cleared`);
        });
    }
}
export function startKnowledgeBaseServer(kbRootPath) {

    app.on("certificate-error", (event, webContents, url, error, certificate, callback) => {
        if (url.match(/http[s]?:\/\/127\.0\.0\.1:[0-9]+\//)) {
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTPS cert error OKAY ${url}`);
            callback(true);
            return;
        }
        if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTPS cert error FAIL ${url}`);
        callback(false);
    });

    const filter = { urls: ["*", "*://*/*"] };

    const onHeadersReceivedCB = (details, callback) => {
        if (!details.url) {
            callback({});
            return;
        }

        if (details.url.match(/http[s]?:\/\/127\.0\.0\.1:[0-9]+\//)) {
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} CSP ${details.url}`);
            callback({
                // responseHeaders: {
                //     ...details.responseHeaders,
                //     "Content-Security-Policy":
                //         [`default-src 'self' 'unsafe-inline' 'unsafe-eval' data: http: https: http://127.0.0.1:8000`],
                // },
            });
        } else {
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} !CSP ${details.url}`);
            callback({});
        }
    };

    const setCertificateVerifyProcCB = (request, callback) => {

        if (request.hostname === "127.0.0.1") {
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTPS cert verify OKAY ${request.hostname}`);
            callback(0); // OK
            return;
        }
        if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTPS cert verify FALLBACK ${request.hostname}`);
        callback(-3); // Chromium
        // callback(-2); // Fail
    };

    const sess = session.fromPartition(SESSION_PARTITION, { cache: true }) || session.defaultSession;

    if (sess) {
        sess.webRequest.onHeadersReceived(filter, onHeadersReceivedCB);
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
            const link = "GO ONLINE";
            const online = `
var zhref = document.location.href.replace('https://127.0.0.1:${port}/', 'http://kb.daisy.org/');
var zdiv = document.createElement('div');
zdiv.setAttribute('style','position: fixed; right: 1em; width: auto; background: transparent; margin: 0; padding: 0; padding-top: 0.5em; font-size: 100%; font-weight: bold; font-family: sans-serif; border: 0');

var za = document.createElement('a');
za.setAttribute('href',zhref);
za.setAttribute('target','_BLANK');
za.appendChild(document.createTextNode('${link}'));

zdiv.appendChild(za);

document.querySelector('header').insertAdjacentElement('beforeEnd', zdiv);
`;
            // js = js.replace("kb.initializePage('ace')", "kb.initializePage('kb')");
            js = js.replace(toMatch1, `${toMatch1} || document.location.hostname == '127.0.0.1' || document.location.host == '127.0.0.1:${port}'`);
            js = js.replace(/http:\/\/kb.daisy.org\//g, "https://127.0.0.1/");
            js = js.replace(toMatch2, `${toMatch2}\n\n${online}\n\n`);
            res.send(js);
            // next();
        });
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

                    if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTPS port ${p}`);

                    port = p;
                    resolve(`https://127.0.0.1:${p}`);
                });
            }).catch((err) => {
                if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} ${err}`);
                if (LOG_DEBUG) console.log(err);
                httpServer = expressApp.listen(port, () => {
                    const p = httpServer.address().port;

                    if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTP port ${p}`);

                    port = p;
                    resolve(`http://127.0.0.1:${p}`);
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

export class KnowledgeBase {

    win = null;

    constructor(mainWin, rootUrl) {
        this.mainWin = mainWin;
        this.rootUrl = rootUrl;
        this.launch();
    }

    launch() {
        this.win = new BrowserWindow({
            show: false,
            webPreferences: {
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
        wins.push(this.win);

        this.win.maximize();
        let sz = this.win.getSize();
        // open a window that's not quite full screen ... makes sense on mac, anyway
        this.win.setSize(Math.min(Math.round(sz[0] * .75), 1200), Math.min(Math.round(sz[1] * .85), 800));
        // win.setPosition(Math.round(sz[0] * .10), Math.round(sz[1] * .10));
        this.win.setPosition(Math.round(sz[0] * 0.4 - this.win.getSize()[0] * 0.4), Math.round(sz[1] * 0.4 - this.win.getSize()[1] * 0.4));
        this.win.show();

        this.win.webContents.on("new-window", (event, url) => {

            const wcUrl = event.sender.getURL();
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} new-window ${wcUrl} => ${url}`);

            if (url.indexOf(this.rootUrl) !== 0) {
                event.preventDefault();
                shell.openExternal(url);
            }
        });

        this.win.webContents.on("will-navigate", (event, url) => {

            const wcUrl = event.sender.getURL();
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} will-navigate ${wcUrl} => ${url}`);

            if (url.indexOf(this.rootUrl) !== 0) {
                event.preventDefault();
                shell.openExternal(url);
            }
        });

        // http://kb.daisy.org/publishing/docs/index.html
        this.win.loadURL(`${this.rootUrl}/publishing/docs/index.html`);

        this.win.on('closed', function () {
            const i = wins.indexOf(this.win);
            if (i >= 0) {
                wins.splice(i, 1);
            }
            this.win = null;
        });
    }
}

function generateSelfSignedData() {
    return new Promise((resolve, reject) => {
        const opts = {
            algorithm: "sha256",
            // clientCertificate: true,
            // clientCertificateCN: "KB insecure client",
            days: 30,
            extensions: [{
                altNames: [{
                    type: 2, // DNSName
                    value: "localhost",
                }],
                name: "subjectAltName",
            }],
        };
        const rand = uuid.v4();
        const attributes = [{ name: "commonName", value: "KB insecure server " + rand }];

        selfsigned.generate(attributes, opts, (err, keys) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(keys);
        });
    });
}
