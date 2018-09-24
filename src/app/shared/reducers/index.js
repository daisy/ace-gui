import { combineReducers } from 'redux';
import app from './app';
import preferences from './preferences';
import reportView from './reportView';

export default function getRootReducer(scope = 'main') {
  let reducers = {
    app,
    preferences,
    reportView
  };

  return combineReducers({ ...reducers });
}
