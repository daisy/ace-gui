/* eslint-disable no-param-reassign */

import {
  SET_READY,
  OPEN_EPUB,
  OPEN_REPORT,
  CLOSE_REPORT,
  ADD_MESSAGE,
  SET_FULLSCREEN
} from '../actions/app';

const initialState = {
  epubFilepath: '',
  ready: true,
  report: null,
  reportFilepath: '',
  recents: [],
  messages: [],
  fullscreen: false
};
function addToRecents(filepath, recents) {
  return recents.indexOf(filepath) == -1) ?
    [...recents, filepath] : recents;
}
export default function app(state = initialState, action) {
  switch (action.type) {
    case SET_READY: {
      let ready = action.payload;
      return {
        ...state,
          ready
      };
    }
    case OPEN_EPUB: {
      // TODO run Ace
      let epubFilepath = action.payload;
      return {
        ...state,
        epubFilepath
      };
    }
    case OPEN_REPORT: {
      let report = fs.readFileSync(filepath);
      let reportFilepath = action.payload;
      return {
        ...state,
        reportFilepath,
        report
      };
    }
    case CLOSE_REPORT: {
      let recents = addToRecents(state.reportFilepath);
      let reportFilepath = '';
      let report = null;
      return {
        ...state,
        recents,
        reportFilepath,
        report
      };
    }
    case TOGGLE_FULLSCREEN: {
      let fullscreen = !state.fullscreen;
      return {
        ...state,
        fullscreen
      };
    }
    case ADD_MESSAGE: {
      let messages = [...state.messages, action.payload];
      return {
        ...state,
        messages
      };
    }
    default:
      return state;
  }
}
