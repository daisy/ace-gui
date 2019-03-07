/* eslint-disable no-param-reassign */
const tmp = require('tmp');

import {
  SAVE_PREFS,
} from '../actions/preferences';

const initialState = {
  language: null,
  reports: {
    dir: tmp.dirSync({ unsafeCleanup: true }).name,
    organize: true,
    overwrite: true,
  }
};

export default function preferences(state = initialState, action) {
  switch (action.type) {
    case SAVE_PREFS: {
      return {
        ...state,
        ...action.payload,
      };
    }
    default:
      return state;
  }
}
