import { combineReducers } from 'redux';
import preferences from './preferences';

export default function getRootReducer(scope = 'main') {
  let reducers = {
    preferences,
  };
  
  return combineReducers({ ...reducers });
}
