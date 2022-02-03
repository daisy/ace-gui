const path = require('path');
const fs = require('fs');
const fsOriginal = require('original-fs');
const url = require('url');

const { BrowserWindow, webContents } = require('electron');
import { app, shell, session, ipcMain, Menu } from 'electron';

import { localizer } from './../shared/l10n/localize';
const { localize } = localizer;

import * as AboutBoxHelper from './about';

// NO_HTTP_ADD
const mime = require('mime-types');
const nodeStream = require('stream');

// NO_HTTP_REMOVE
// import * as express from "express";
// import * as portfinder from "portfinder";
// import * as http from "http";
// import * as https from "https";
// import {generateSelfSignedData} from "./selfsigned";

const isDev = process && process.env && (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true');

const LOG_DEBUG = false;
const LOG_DEBUG_URLS = false;
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

// NO_HTTP_REMOVE
// let expressApp;
// let httpServer;
// let port;
// let ip;
// let proto;
// let rootUrl;

if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} ELECTRON MODULE INSTANCE`);

// NO_HTTP_ADD
const ACE_KB_ELECTRON_HTTP_PROTOCOL = "acekbhttps";
const rootUrl = `${ACE_KB_ELECTRON_HTTP_PROTOCOL}://0.0.0.0`;

// NO_HTTP_ADD
class BufferReadableStream extends nodeStream.Readable {
    constructor(buffer) {
        super();
        this.buffer = buffer;
        this.alreadyRead = 0;
    }
    _read(size) {
        if (this.alreadyRead >= this.buffer.length) {
            this.push(null);
            return;
        }

        let chunk = this.alreadyRead ?
            this.buffer.slice(this.alreadyRead) :
            this.buffer;

        if (size) {
            let l = size;
            if (size > chunk.length) {
                l = chunk.length;
            }

            chunk = chunk.slice(0, l);
        }

        this.alreadyRead += chunk.length;
        this.push(chunk);
    }
}
function bufferToStream(buffer) {
    return new BufferReadableStream(buffer);
}

let _streamProtocolHandler = undefined;
const streamProtocolHandler = async (
    req,
    callback) => {

    if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} streamProtocolHandler req.url: ${req.url}`);
    const u = new URL(req.url);

    if (LOG_DEBUG) {
        Object.keys(req.headers).forEach((header) => {
            const val = req.headers[header];

            console.log(`${KB_LOG_PREFIX} streamProtocolHandler req.header: ${header} => ${val}`);

            // if (val) {
            //     headers[header] = val;
            // }
        });
    }

    let ref = u.origin;
    if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} streamProtocolHandler u.origin: ${ref}`);
    if (req.referrer && req.referrer.trim()) {
        ref = req.referrer;
        if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} streamProtocolHandler req.referrer: ${ref}`);
    }

    const headers = {};

    if (ref && ref !== "null" && !/^https?:\/\/localhost.+/.test(ref) && !/^https?:\/\/127\.0\.0\.1.+/.test(ref)) {
        headers.referer = ref;
    } else {
        headers.referer = `${ACE_KB_ELECTRON_HTTP_PROTOCOL}://0.0.0.0/`;
    }

    // CORS everything!
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS"; // POST, DELETE, PUT, PATCH
    // tslint:disable-next-line:max-line-length
    headers["Access-Control-Allow-Headers"] = "Content-Type, Content-Length, Accept-Ranges, Content-Range, Range, Link, Transfer-Encoding, X-Requested-With, Authorization, Accept, Origin, User-Agent, DNT, Cache-Control, Keep-Alive, If-Modified-Since";
    // tslint:disable-next-line:max-line-length
    headers["Access-Control-Expose-Headers"] = "Content-Type, Content-Length, Accept-Ranges, Content-Range, Range, Link, Transfer-Encoding, X-Requested-With, Authorization, Accept, Origin, User-Agent, DNT, Cache-Control, Keep-Alive, If-Modified-Since";

    if (!_streamProtocolHandler) {
        if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} !? _streamProtocolHandler`);

        const buff = Buffer.from("<html><body><p>Internal Server Error</p><p>!_streamProtocolHandler</p></body></html>");
        headers["Content-Length"] = buff.length.toString();
        headers["Content-Type"] = "text/html";
        callback({
            data: bufferToStream(buff),
            headers,
            statusCode: 500,
        });
        return;
    }
    if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} BEFORE _streamProtocolHandler ${req.url}`);
    await _streamProtocolHandler(req, callback, headers);
    if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} AFTER _streamProtocolHandler ${req.url}`);
};
 
function electronAppReady () {
// app.whenReady().then(async () => {
    if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} Electron app ready`);

    // try {
    //     await clearSessions();
    // } catch (err) {
    //     if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} clearSessions fail?`);
    // }

    // if (session.defaultSession) {
    //     session.defaultSession.protocol.registerStreamProtocol(
    //         ACE_KB_ELECTRON_HTTP_PROTOCOL,
    //         streamProtocolHandler);
    // }
    const sess = session.fromPartition(SESSION_PARTITION, { cache: true });
    if (sess) {
        sess.protocol.registerStreamProtocol(
            ACE_KB_ELECTRON_HTTP_PROTOCOL,
            streamProtocolHandler);

        sess.setPermissionRequestHandler((wc, permission, callback) => {
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} setPermissionRequestHandler ${wc.getURL()} => ${permission}`);
            callback(true);
        });
    }
}

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

    if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} stopKnowledgeBaseServer`);

    // NO_HTTP_REMOVE
    // if (httpServer) {
    //     httpServer.close();
    // }

    // NO_HTTP_ADD
    _streamProtocolHandler = undefined;

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

// const filePathsExpressStaticNotExist = {};
export function startKnowledgeBaseServer(kbRootPath) {

    if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} startKnowledgeBaseServer: ${kbRootPath}`);

    electronAppReady();

    // app.on("certificate-error", (event, webContents, url, error, certificate, callback) => {
    //     if (url.indexOf(`${rootUrl}/`) === 0) {
    //         if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTPS cert error OKAY ${url}`);
    //         callback(true);
    //         return;
    //     }
    //     if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTPS cert error FAIL ${url}`);
    //     callback(false);
    // });

    // const filter = { urls: ["*", "*://*/*"] };

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

    // const setCertificateVerifyProcCB = (request, callback) => {

    //     if (request.hostname === ip) {
    //         if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTPS cert verify OKAY ${request.hostname}`);
    //         callback(0); // OK
    //         return;
    //     }
    //     if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTPS cert verify FALLBACK ${request.hostname}`);
    //     callback(-3); // Chromium
    //     // callback(-2); // Fail
    // };

    // const sess = session.fromPartition(SESSION_PARTITION, { cache: true }); // || session.defaultSession;
    // if (sess) {
    //     // sess.webRequest.onHeadersReceived(filter, onHeadersReceivedCB);
    //     // sess.webRequest.onBeforeSendHeaders(filter, onBeforeSendHeadersCB);
    //     sess.setCertificateVerifyProc(setCertificateVerifyProcCB);
    // }

    // NO_HTTP_REMOVE
    // return new Promise((resolve, reject) => {

        const jsInitPath = "js/init.js";

        // NO_HTTP_REMOVE
        // expressApp = express();
        // // expressApp.enable('strict routing');
        // // expressApp.use("/", (req, res, next) => {
        // //     if (LOG_DEBUG) console.log("HTTP: " + req.url);
        // //     next();
        // // });
        // expressApp.use(`/${jsInitPath}`, (req, res, next) => {

            // res.send(js);
        //     // next();
        // });

        // NO_HTTP_ADD
        _streamProtocolHandler = async (
            req,
            callback,
            headers) => {
            const u = new URL(req.url);

            // equivalent to Express static:

            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} Express static emulate: ${req.url}`);

            if (LOG_DEBUG_URLS) {
                console.log(">>>>>>>>>>- URL 1");
                console.log(req.url);
            }
            const ptn = u.pathname;
            if (LOG_DEBUG_URLS) {
                console.log(">>>>>>>>>>- URL 2");
                console.log(ptn);
            }
            const pn = decodeURI(ptn);
            if (LOG_DEBUG_URLS) {
                console.log(">>>>>>>>>>- URL 3");
                console.log(pn);
            }

            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTP intercept /${jsInitPath}`);

            if (pn === `/${jsInitPath}`) {
                let js = fs.readFileSync(path.join(kbRootPath, jsInitPath), { encoding: "utf8" });

                const toMatch1 = "document.location.host == 'localhost'";
                const toMatch1_ = "document.location.host.match(/^localhost/i)";

                const toMatch2 = "KB.prototype.generateFooter = function () {";
                const link = localize("kbgoonline");
                const online = `
    var zhref = document.location.href.replace('${rootUrl}/', 'http://kb.daisy.org/');
    var zdiv = document.createElement('div');
    zdiv.setAttribute('style','position: fixed; right: 1em; width: auto; background: transparent; margin: 0; padding: 0; padding-top: 0.5em; font-size: 100%; font-weight: bold; font-family: sans-serif; border: 0');

    var za = document.createElement('a');
    za.setAttribute('href',zhref);
    // za.setAttribute('target','_BLANK');
    za.setAttribute('style','color: red; background-color: white; padding: 0.2em;');
    za.appendChild(document.createTextNode('${link}'));

    zdiv.appendChild(za);

    document.querySelector('header').insertAdjacentElement('beforeEnd', zdiv);

    `;
    const online2 = `
    var zhref = '#';
    var zdiv = document.createElement('div');
    zdiv.setAttribute('style','position: fixed; left: 1em; width: auto; background: transparent; margin: 0; padding: 0; padding-top: 0.5em; font-size: 100%; font-weight: bold; font-family: sans-serif; border: 0');

    var za = document.createElement('a');
    za.setAttribute('href',zhref);
    za.setAttribute('style','color: red; background-color: white; padding: 0.2em; font-weight: bold;');
    za.appendChild(document.createTextNode('<<'));

    za.addEventListener("click", (ev) => {
        ev.preventDefault();
        // alert('test');
        window.history.back();
    });

    zdiv.appendChild(za);

    document.querySelector('header').insertAdjacentElement('beforeEnd', zdiv);
    `;
                // js = js.replace("kb.initializePage('ace')", "kb.initializePage('kb')");

                const rx1 = /http[s]?:\/\/(.+):[0-9]+/;
                const rx2 = /http[s]?:\/\//;

                const rx1_ = new RegExp(`${ACE_KB_ELECTRON_HTTP_PROTOCOL}://(0\\.0\\.0\\.0)`);
                const rx2_ = new RegExp(`${ACE_KB_ELECTRON_HTTP_PROTOCOL}://`);

                js = js.replace(toMatch1_, `${toMatch1_} ||
                    document.location.hostname == '${rootUrl.replace(rx1_, "$1")}' ||
                    document.location.host == '${rootUrl.replace(rx2_, "")}' ||

                    document.location.hostname == '${rootUrl.replace(rx1, "$1")}' ||
                    document.location.host == '${rootUrl.replace(rx2, "")}'`
                );

                js = js.replace(toMatch1, `${toMatch1} ||
                    document.location.hostname == '${rootUrl.replace(rx1_, "$1")}' ||
                    document.location.host == '${rootUrl.replace(rx2_, "")}' ||

                    document.location.hostname == '${rootUrl.replace(rx1, "$1")}' ||
                    document.location.host == '${rootUrl.replace(rx2, "")}'`
                );

                js = js.replace(/http[s]?:\/\/kb.daisy.org\//g, `${rootUrl}/`);

                js = js.replace(toMatch2, `${toMatch2}\n\n${online}\n\n${online2}\n\n`);

                const buff = Buffer.from(js);
                headers["Content-Length"] = buff.length.toString();
                headers["Content-Type"] = "text/javascript";
                callback({
                    data: bufferToStream(buff),
                    headers,
                    statusCode: 200,
                });
                return;
            }

            let fileSystemPath = path.join(kbRootPath, pn);
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} --filepath to read: ${fileSystemPath}`);
            if (fs.existsSync(fileSystemPath)) {
                const stats = fs.statSync(fileSystemPath);
                if (stats.isDirectory()) {
                    fileSystemPath = path.join(kbRootPath, pn, "index.html");
                }
            }
            if (!fs.existsSync(fileSystemPath)) {
                // fileSystemPath = pn;
                // if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} --filepath to read (corrected): ${fileSystemPath}`);
                // if (!fs.existsSync(fileSystemPath)) {
                    if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} --FILE DOES NOT EXIST!! ${kbRootPath} + ${req.url} => ${fileSystemPath}`);
                    const html = `<h1><a href="javascript:window.history.back()">&lt;&lt;</a></h1><h2>${pn} (404 missing file?)</h2>`;
                    const buff = Buffer.from(html);
                    headers["Content-Length"] = buff.length.toString();
                    headers["Content-Type"] = "text/html";
                    callback({
                        data: bufferToStream(buff),
                        headers,
                        statusCode: 404,
                    });
                    return;
                // }
            }
            try {
                let mediaType = mime.lookup(fileSystemPath) || "stream/octet";
                const stats = fs.statSync(fileSystemPath);
                headers["Content-Length"] = stats.size;
                headers["Content-Type"] = mediaType;
                if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} --CALLBACK HEADERS ${req.url} ${JSON.stringify(headers)}`);
                const steam = fs.createReadStream(fileSystemPath);
                callback({
                    data: steam,
                    headers,
                    statusCode: 200,
                });
                if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} --POST-CALLBACK ${req.url}`);
            } catch (fsErr) {
                if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} --fsErr ${fsErr}`);

                const buff = Buffer.from(`<html><body><p>Internal Server Error</p><p>fsErr: ${fsErr}</p></body></html>`);
                headers["Content-Length"] = buff.length.toString();
                headers["Content-Type"] = "text/html";
                callback({
                    data: bufferToStream(buff),
                    headers,
                    statusCode: 500,
                });
            }
        };
        httpReady();

        // NO_HTTP_REMOVE
        // if (isDev) { // handle WebInspector JS maps etc.
        //     expressApp.use("/", (req, res, next) => {
        //         // const url = new URL(`https://fake.org${req.url}`);
        //         // const pathname = url.pathname;
        //         const pathname = url.parse(req.url).pathname;

        //         const filePath = path.join(kbRootPath, pathname).replace(/\\/g, "/");
        //         if (filePathsExpressStaticNotExist[filePath]) {
        //             res.status(404).send(filePathsExpressStaticNotExist[filePath]);
        //             return;
        //         }
        //         fsOriginal.exists(filePath, (exists) => {
        //             if (exists) {
        //                 if (fsOriginal.statSync(filePath).isDirectory()) {
        //                     return next();
        //                 }
        //                 fsOriginal.readFile(filePath, undefined, (err, data) => {
        //                     if (err) {
        //                         if (LOG_DEBUG) {
        //                             console.log(`${KB_LOG_PREFIX} HTTP FAIL fsOriginal.exists && ERR ${kbRootPath} + ${req.url} => ${filePath}`, err);
        //                         }
        //                         const html = `<h1><a href="javascript:window.history.back()">&lt;&lt;</a></h1><h2>${pathname} => ${err.toString()}</h2>`;
        //                         filePathsExpressStaticNotExist[filePath] = html;
        //                         res.status(404).send(filePathsExpressStaticNotExist[filePath]);
        //                     } else {
        //                         // if (LOG_DEBUG) {
        //                         //     console.log(`${KB_LOG_PREFIX} HTTP OK fsOriginal.exists ${kbRootPath} + ${req.url} => ${filePath}`);
        //                         // }
        //                         next();
        //                         // res.send(data);
        //                     }
        //                 });
        //             } else {
        //                 fs.exists(filePath, (exists) => {
        //                     if (exists) {
        //                         if (fs.statSync(filePath).isDirectory()) {
        //                             return next();
        //                         }
        //                         fs.readFile(filePath, undefined, (err, data) => {
        //                             if (err) {
        //                                 if (LOG_DEBUG) {
        //                                     console.log(`${KB_LOG_PREFIX} HTTP FAIL !fsOriginal.exists && fs.exists && ERR ${kbRootPath} + ${req.url} => ${filePath}`, err);
        //                                 }
        //                                 const html = `<h1><a href="javascript:window.history.back()">&lt;&lt;</a></h1><h2>${pathname} => ${err.toString()}</h2>`;
        //                                 filePathsExpressStaticNotExist[filePath] = html;
        //                                 res.status(404).send(filePathsExpressStaticNotExist[filePath]);
        //                             } else {
        //                                 if (LOG_DEBUG) {
        //                                     console.log(`${KB_LOG_PREFIX} HTTP OK !fsOriginal.exists && fs.exists ${kbRootPath} + ${req.url} => ${filePath}`);
        //                                 }
        //                                 next();
        //                                 // res.send(data);
        //                             }
        //                         });
        //                     } else {
        //                         if (LOG_DEBUG) {
        //                             console.log(`${KB_LOG_PREFIX} HTTP FAIL !fsOriginal.exists && !fs.exists ${kbRootPath} + ${req.url} => ${filePath}`);
        //                         }
        //                         const html = `<h1><a href="javascript:window.history.back()">&lt;&lt;</a></h1><h2>404: ${pathname}</h2>`;
        //                         filePathsExpressStaticNotExist[filePath] = html;
        //                         res.status(404).send(filePathsExpressStaticNotExist[filePath]);
        //                     }
        //                 });
        //             }
        //         });
        //     });
        // } else {
            // expressApp.use("/", (req, res, next) => {
            //     // const url = new URL(`https://fake.org${req.url}`);
            //     // const pathname = url.pathname;
            //     const pathname = url.parse(req.url).pathname;

            //     const filePath = path.join(kbRootPath, pathname).replace(/\\/g, "/");
            //     if (filePathsExpressStaticNotExist[filePath]) {
            //         res.status(404).send(filePathsExpressStaticNotExist[filePath]);
            //         return;
            //     }
            //     fs.exists(filePath, (exists) => {
            //         if (exists) {
            //             if (fs.statSync(filePath).isDirectory()) {
            //                 return next();
            //             }
            //             fs.readFile(filePath, undefined, (err, data) => {
            //                 if (err) {
            //                     if (LOG_DEBUG) {
            //                         console.log(`${KB_LOG_PREFIX} HTTP FAIL fs.exists && ERR ${kbRootPath} + ${req.url} => ${filePath}`, err);
            //                     }
            //                     const html = `<h1><a href="javascript:window.history.back()">&lt;&lt;</a></h1><h2>${pathname} => ${err.toString()}</h2>`;
            //                     filePathsExpressStaticNotExist[filePath] = html;
            //                     res.status(404).send(filePathsExpressStaticNotExist[filePath]);
            //                 } else {
            //                     if (LOG_DEBUG) {
            //                         console.log(`${KB_LOG_PREFIX} HTTP OK fs.exists ${kbRootPath} + ${req.url} => ${filePath}`);
            //                     }
            //                     next();
            //                     // res.send(data);
            //                 }
            //             });
            //         } else {
            //             if (LOG_DEBUG) {
            //                 console.log(`${KB_LOG_PREFIX} HTTP FAIL !fs.exists ${kbRootPath} + ${req.url} => ${filePath}`);
            //             }
            //             const html = `<h1><a href="javascript:window.history.back()">&lt;&lt;</a></h1><h2>404: ${pathname}</h2>`;
            //             filePathsExpressStaticNotExist[filePath] = html;
            //             res.status(404).send(filePathsExpressStaticNotExist[filePath]);
            //         }
            //     });
            // });
        // }

        // NO_HTTP_REMOVE
        // // https://expressjs.com/en/4x/api.html#express.static
        // const staticOptions = {
        //     dotfiles: "ignore",
        //     etag: true,
        //     // fallthrough: false,
        //     immutable: true,
        //     index: "index.html",
        //     maxAge: "1d",
        //     redirect: true,
        //     // extensions: ["css", "otf"],
        //     // setHeaders: (res, _path, _stat) => {
        //     //     //   res.set('x-timestamp', Date.now())
        //     //     setResponseCORS(res);
        //     // },
        // };
        // if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} HTTP static path ${kbRootPath}`);
        // expressApp.use("/", express.static(kbRootPath, staticOptions));

        // const startHttp = function () {
            
        //     httpServer = expressApp.listen(port, () => {
        //         const p = httpServer.address().port;

        //         port = p;
        //         ip = "127.0.0.1";
        //         proto = "http";
        //         rootUrl = `${proto}://${ip}:${port}`;
        //         if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} URL ${rootUrl}`);

        //         resolve();
        //         httpReady();
        //     });

        //     // generateSelfSignedData().then((certData) => {
        //     //     httpServer = https.createServer({ key: certData.private, cert: certData.cert }, expressApp).listen(port, () => {
        //     //         const p = httpServer.address().port;

        //     //         port = p;
        //     //         ip = "127.0.0.1";
        //     //         proto = "https";
        //     //         rootUrl = `${proto}://${ip}:${port}`;
        //     //         if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} URL ${rootUrl}`);

        //     //         resolve();
        //     //         httpReady();
        //     //     });
        //     // }).catch((err) => {
        //     //     if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} ${err}`);
        //     //     if (LOG_DEBUG) console.log(err);
        //     //     httpServer = expressApp.listen(port, () => {
        //     //         const p = httpServer.address().port;

        //     //         port = p;
        //     //         ip = "127.0.0.1";
        //     //         proto = "http";
        //     //         rootUrl = `${proto}://${ip}:${port}`;
        //     //         if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} URL ${rootUrl}`);

        //     //         resolve();
        //     //         httpReady();
        //     //     });
        //     // });
        // }
        // portfinder.getPortPromise().then((p) => {
        //     port = p;
        //     startHttp();
        // }).catch((err) => {
        //     debug(err);
        //     port = 3000;
        //     startHttp();
        // });

    // NO_HTTP_REMOVE
    // });
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
                enableRemoteModule: false,
                partition: SESSION_PARTITION,
                // nativeWindowOpen: false, // The default of nativeWindowOpen is deprecated and will be changing from false to true in Electron 15. See https://github.com/electron/electron/issues/28511
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

        this.win.webContents.setWindowOpenHandler((obj) => {

            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} new-window ${obj.frameName} ${obj.url}`);

            if (obj.url.indexOf(rootUrl) !== 0) {
                shell.openExternal(obj.url);

                // preventDefault()
                return { action: 'deny' };
            }

            if (obj.url.replace(/\/\/+/g, "/").indexOf("publishing/docs/search") >= 0) {
                shell.openExternal(obj.url.replace(rootUrl, "http://kb.daisy.org"));

                // preventDefault()
                return { action: 'deny' };
            }

            // this.win.loadURL(obj.url);
            return { action: 'allow' };
        });

        this.win.webContents.on("will-navigate", (event, url) => {

            const wcUrl = event.sender.getURL();
            if (LOG_DEBUG) console.log(`${KB_LOG_PREFIX} will-navigate ${wcUrl} => ${url}`);

            if (url.indexOf(rootUrl) !== 0) {
                event.preventDefault();
                shell.openExternal(url);
            }
            if (url.replace(/\/\/+/g, "/").indexOf("publishing/docs/search") >= 0) {
                event.preventDefault();
                shell.openExternal(url.replace(rootUrl, "http://kb.daisy.org"));
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
