import App from './components/App'
import { Provider } from 'react-redux';
import { getInitialStateRenderer } from 'electron-redux';
import React from 'react'
import configureStore from './../shared/store/configureStore';
import { remote } from 'electron';
import {render} from 'react-dom'

const initialState = getInitialStateRenderer();
const store = configureStore(initialState, 'renderer');

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('react-root')
);
