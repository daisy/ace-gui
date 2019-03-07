import AppContainer from './containers/AppContainer'
import { Provider } from 'react-redux';
import { getInitialStateRenderer } from 'electron-redux';
import React from 'react'
import configureStore from './../shared/store/configureStore';
import {render} from 'react-dom'

import {DEFAULT_LANGUAGE, setCurrentLanguage} from './../shared/l10n/localize';

const initialState = getInitialStateRenderer();
const store = configureStore(initialState, 'renderer');

const initLanguage = store.getState().preferences.language || DEFAULT_LANGUAGE;
setCurrentLanguage(initLanguage);

store.subscribe(() => {
  const state = store.getState();

  const prefs = state.preferences;

  if (prefs.language) {
    setCurrentLanguage(prefs.language);
  }
});

render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById('react-root')
);
