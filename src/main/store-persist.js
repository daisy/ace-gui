
import configureStore from './../shared/store/configureStore';

import { localizer } from './../shared/l10n/localize';
const { setCurrentLanguage, getRawResources } = localizer;

import { defaultPreferences } from './../shared/default-preferences';

const { app } = require('electron');

const ElectronStore = require('electron-store');
const electronStore = new ElectronStore();

const isDev = process && process.env && (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true');

// called after Electron app.ready
export function initPersistentStore() {
    if (isDev) {
        console.log(`electronStore.path: ${electronStore.path}`);
        // electronStore.openInEditor();
    }

    // const osLocale = app.getLocaleCountryCode(); // e.g. returns GB if en-GB
    const appLocale = app.getLocale();
    if (isDev) {
        // console.log(`>>> ELECTRON OS LOCALE LANGUAGE (MAIN PROCESS): ${osLocale}`);
        console.log(`>>> ELECTRON APP LOCALE LANGUAGE (MAIN PROCESS): ${appLocale}`);
    }
    const storedLocale = electronStore.get('language');
    if (isDev) {
        console.log(`>>> STORED LOCALE LANGUAGE (MAIN PROCESS): ${storedLocale}`);
    }
    const appLocaleSimpleCode = appLocale.split("-")[0];
    const langKeys = Object.keys(getRawResources());
    const initialLanguage = storedLocale ||
        langKeys.find((l) => l === appLocale) ||
        langKeys.find((l) => l === appLocaleSimpleCode) ||
        defaultPreferences.language; // en
    if (isDev) {
        console.log(`>>> --- INITIAL LOCALE LANGUAGE (MAIN PROCESS): ${initialLanguage}`);
    }

    const reportsOrganize = electronStore.get('reports.organize');
    const reportsOverwrite = electronStore.get('reports.overwrite');
    const initialState = {
        preferences: {
            language: initialLanguage,
            reports: {
                "dir": electronStore.get('reports.dir') || defaultPreferences.reports.dir,
                "organize": typeof reportsOrganize === "boolean" ? reportsOrganize : defaultPreferences.reports.organize,
                "overwrite": typeof reportsOverwrite === "boolean" ? reportsOverwrite : defaultPreferences.reports.overwrite,
            }
        }
    };
    const l10nDoneCallback1 = () => {}; // no need to async/await on this
    setCurrentLanguage(initialState.preferences.language, l10nDoneCallback1);

    const store = configureStore(initialState, 'main');

    const storeSubscribers = [];

    store.subscribe(() => {
        const state = store.getState();

        const prefs = state.preferences;

        if (prefs.language) {
            electronStore.set('language', prefs.language);
        } else {
            electronStore.set('language', defaultPreferences.language);
        }
        const l10nDoneCallback2 = () => {}; // no need to async/await on this
        setCurrentLanguage(electronStore.get('language'), l10nDoneCallback2);

        if (prefs.reports) {
            if (prefs.reports.dir) {
                electronStore.set('reports.dir', prefs.reports.dir);
            } else {
                electronStore.set('reports.dir', defaultPreferences.reports.dir);
            }
            if (typeof prefs.reports.overwrite === "boolean") {
                electronStore.set('reports.overwrite', prefs.reports.overwrite);
            } else {
                electronStore.set('reports.overwrite', defaultPreferences.reports.overwrite);
            }
            if (typeof prefs.reports.organize === "boolean") {
                electronStore.set('reports.organize', prefs.reports.organize);
            } else {
                electronStore.set('reports.organize', defaultPreferences.reports.organize);
            }
        }

        storeSubscribers.forEach((storeSubscriber) => {
            storeSubscriber();
        });
    });

    return {
        store,
        storeSubscribe: (cb) => {
            storeSubscribers.push(cb);
        },
        storeUnsubscribe: (cb) => {
            const i = storeSubscribers.indexOf(cb);
            if (i >= 0) {
                storeSubscribers.splice(i, 1);
            }
        }
    };
}
