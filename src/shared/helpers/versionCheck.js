const path = require('path');
const fs = require('fs');

const electron = require('electron');
const dialog = electron.dialog || electron.remote.dialog;

const shell = electron.shell;

const https = require('https');

const semver = require('semver');

const { localizer } = require('../l10n/localize');
const { localize } = localizer;

const JSON_URL = 'https://raw.githubusercontent.com/daisy/ace-gui/master/latest.json';

let PACKAGE_JSON = undefined;

export const checkLatestVersion = (browserWindow) => {
    try {
        if (!PACKAGE_JSON) {
            PACKAGE_JSON = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), { encoding: "utf8" }));
        }
        const req = https.request(JSON_URL, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                const httpOk = res.statusCode >= 200 && res.statusCode <= 299; // assumes HTTP req followed redirects 30x
                if (httpOk && data && data.length) {
                    let jsonInfo = undefined;
                    try {
                        jsonInfo = JSON.parse(data);
                        // local test:
                        // jsonInfo = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "latest.json"), { encoding: "utf8" }));

                        if (jsonInfo.id === 'org.daisy.ace') {
                            console.log(jsonInfo);
                            // const date = Date.parse(jsonInfo.date);
                            // console.log((new Date(date)).toUTCString());
                            
                            if (semver.gt(jsonInfo.version, PACKAGE_JSON.version)) {
                                dialog.showMessageBox({
                                    browserWindow,
                                    type: "question",
                                    buttons: [
                                        localize("versionCheck.yes"),
                                        localize("versionCheck.no"),
                                    ],
                                    defaultId: 0,
                                    cancelId: 1,
                                    title: localize("versionCheck.softwareUpdate"),
                                    message: localize("versionCheck.newVersionAvailable"),
                                    detail: `[${PACKAGE_JSON.version}] ... [${jsonInfo.version}]`,
                                    noLink: true,
                                    normalizeAccessKeys: false,
                                }, (i) => {
                                    if (i === 0) {
                                        shell.openExternal(jsonInfo.url);
                                    }
                                });
                            }
                        }
                    } catch (err) {
                        console.log(err);
                        console.log(data);
                    }
                }
            });
        });
        req.on('error', (error) => {
            console.error(error);
        });
        req.end();
    } catch (err) {
        console.log(err);
    }
};