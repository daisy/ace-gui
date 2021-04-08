const electron = require('electron');

const https = require('https');

const semver = require('semver');

const { localizer } = require('../shared/l10n/localize');
const { localize } = localizer;

const JSON_URL = 'https://raw.githubusercontent.com/daisy/ace-gui/master/latest.json';

export const checkLatestVersion = (browserWindow) => {
    try {
        const req = https.request(JSON_URL, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', async () => {
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
                            
                            if (semver.gt(jsonInfo.version, __APP_VERSION__)) {

                                const res = await electron.dialog.showMessageBox({
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
                                    detail: `[${__APP_VERSION__}] ... [${jsonInfo.version}]`,
                                    noLink: true,
                                    normalizeAccessKeys: false,
                                });
                                if (res.response === 0) {
                                    electron.shell.openExternal(jsonInfo.url);
                                }
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