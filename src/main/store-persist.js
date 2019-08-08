
import configureStore from './../shared/store/configureStore';

import { localizer } from './../shared/l10n/localize';
const { setCurrentLanguage } = localizer;

import { defaultPreferences } from './../shared/default-preferences';

const ElectronStore = require('electron-store');
const electronStore = new ElectronStore();

const isDev = process && process.env && (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true');

export function initPersistentStore() {
    if (isDev) {
        console.log(`electronStore.path: ${electronStore.path}`);
        // electronStore.openInEditor();
    }

    const reportsOrganize = electronStore.get('reports.organize');
    const reportsOverwrite = electronStore.get('reports.overwrite');
    const initialState = {
        preferences: {
            language: electronStore.get('language') || defaultPreferences.language,
            reports: {
                "dir": electronStore.get('reports.dir') || defaultPreferences.reports.dir,
                "organize": typeof reportsOrganize === "boolean" ? reportsOrganize : defaultPreferences.reports.organize,
                "overwrite": typeof reportsOverwrite === "boolean" ? reportsOverwrite : defaultPreferences.reports.overwrite,
            }
        }
    };
    setCurrentLanguage(initialState.preferences.language);

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
        setCurrentLanguage(electronStore.get('language'));

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
