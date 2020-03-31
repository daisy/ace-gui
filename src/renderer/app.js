import AppContainer from './containers/AppContainer'
import { Provider } from 'react-redux';
import { getInitialStateRenderer } from 'electron-redux';
import React from 'react'
import configureStore from './../shared/store/configureStore';
import {render} from 'react-dom'
import ReactDOM from 'react-dom';

import { ipcRenderer } from 'electron';
import {
  openFile
} from './../shared/actions/app';

import { localizer } from './../shared/l10n/localize';
const { getDefaultLanguage, setCurrentLanguage, getRawResources } = localizer;

const isDev = process && process.env && (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true');
if (isDev) {
  require('devtron').install();

  const axe = require("react-axe");
  ipcRenderer.once("REACT_AXE_A11Y", () => {
    // https://github.com/dequelabs/axe-core/blob/master/doc/API.md#api-name-axeconfigure
    const config = {
        // rules: [
        //     {
        //         id: "skip-link",
        //         enabled: true,
        //     },
        // ],
    };
    axe(React, ReactDOM, 1000, config);
  });
}

const initialState = getInitialStateRenderer();
const store = configureStore(initialState, 'renderer');

const appLocale = navigator.language;
if (isDev) {
    console.log(`>>> CHROMIUM NAVIGATOR LOCALE LANGUAGE (RENDERER PROCESS): ${appLocale}`);
}
const appLocaleSimpleCode = appLocale.split("-")[0];
const storeLang = store.getState().preferences.language; // initial to Electron app.getLocale(), which normally is the same as navigator.language (for example when starting Electron with --lang=fr)
if (isDev) {
    console.log(`>>> STORE LOCALE LANGUAGE (RENDERER PROCESS): ${storeLang}`);
}
const langKeys = Object.keys(getRawResources());
const initialLanguage = storeLang ||
    langKeys.find((l) => l === appLocale) ||
    langKeys.find((l) => l === appLocaleSimpleCode) ||
    getDefaultLanguage(); // en
if (isDev) {
    console.log(`>>> --- INITIAL LOCALE LANGUAGE (RENDERER PROCESS): ${initialLanguage}`);
}

const l10nDoneCallback1 = () => {}; // no need to async/await on this
setCurrentLanguage(initialLanguage, l10nDoneCallback1);
document.documentElement.setAttribute("lang", initialLanguage);

store.subscribe(() => {
  const state = store.getState();

  const prefs = state.preferences;

  if (prefs.language) {
    const l10nDoneCallback2 = () => {}; // no need to async/await on this
    setCurrentLanguage(prefs.language, l10nDoneCallback2);
    document.documentElement.setAttribute("lang", prefs.language);
  }
});

ipcRenderer.on('RUN_ACE', (event, filepath) => {
  store.dispatch(openFile(filepath));
  // store.dispatch(runAce(filepath));
});

render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById('react-root')
);
