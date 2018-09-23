/* eslint-disable no-param-reassign */
const tmp = require('tmp');

import {
  SET_OUTDIR,
  SET_ORGANIZE,
  SET_OVERWRITE
} from '../actions/preferences';

const initialState = {
  outdir: tmp.dirSync({ unsafeCleanup: true }).name,
  organize: true,
  overwrite: false
};

export default function preferences(state = initialState, action) {
  switch (action.type) {
    case SET_OUTDIR: {
      return {
        ...state,
        outdir: action.payload,
      };
    }
    case SET_ORGANIZE: {
      return {
        ...state,
        organize: action.payload,
      };
    }
    case SET_OVERWRITE: {
      return {
        ...state,
        overwrite: action.payload,
      };
    }
    default:
      return state;
  }
}
