import { combineReducers } from 'redux';
import app from './preferences';
import preferences from './preferences';
import reportView from './preferences';

export default function getRootReducer(scope = 'main') {
  let reducers = {
    app,
    preferences,
    reportView
  };

  return combineReducers({ ...reducers });
}
