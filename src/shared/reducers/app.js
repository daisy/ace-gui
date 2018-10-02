/* eslint-disable no-param-reassign */
const ace = require('@daisy/ace-core');
const electron = require('electron');
const fs = require('fs');

import {
  SET_READY,
  OPEN_REPORT,
  CLOSE_REPORT,
  ADD_MESSAGE,
} from '../actions/app';

import * as Helpers from '../helpers';

const initialState = {
  epubFilepath: '',
  ready: true,
  report: null,
  reportFilepath: '',
  recents: [],
  messages: []
};

export default function app(state = initialState, action) {
  switch (action.type) {
    case SET_READY: {
      let ready = action.payload;
      return {
        ...state,
          ready
      };
    }
    case OPEN_REPORT: {
      try {
        let report = JSON.parse(fs.readFileSync(action.payload));
        let reportFilepath = action.payload;
        let messages = [...state.messages, `Loaded report ${reportFilepath}`];
        return {
          ...state,
          reportFilepath,
          report,
          messages
        };
      }
      catch(error) {
        let messages = [...state.messages, `ERROR: Could not open ${action.payload}`];
        return {
          ...state,
          messages
        };
      }

    }
    case CLOSE_REPORT: {
      let recents = addToRecents(state.reportFilepath, state.recents);
      let report = null;
      let messages = [...state.messages, `Closed report ${state.reportFilepath}`];
      return {
        ...state,
        recents,
        reportFilepath: '',
        report,
        messages
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

function addToRecents(filepath, recents) {
  return (recents.indexOf(filepath) == -1) ?
    [...recents, filepath] : recents;
}
