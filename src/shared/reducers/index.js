import { combineReducers } from 'redux';
import app from './app';
import modal from './modal';
import preferences from './preferences';
import reportView from './reportView';

export default function getRootReducer(scope = 'main') {
  return combineReducers({
    app,
    modal,
    preferences,
    reportView
  });
}
