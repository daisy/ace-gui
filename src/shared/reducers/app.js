/* eslint-disable no-param-reassign */
import fs from 'fs';
import path from 'path';

import {
  SET_READY,
  OPEN_REPORT,
  CLOSE_REPORT,
  ADD_MESSAGE,
} from '../actions/app';

import * as Helpers from '../helpers';

const initialState = {
  inputPath: null,
  ready: true,
  report: null,
  reportPath: null,
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
        let {reportPath, inputPath } = action.payload;
        let report = JSON.parse(fs.readFileSync(reportPath));
        if (inputPath === undefined && report['earl:testSubject'] !== undefined && report['earl:testSubject'].url !== undefined) {
          inputPath = path.resolve(reportPath, report['earl:testSubject'].url);
          if (!fs.existsSync(inputPath)) inputPath = null;
        }
        let messages = [...state.messages, `Loaded report ${reportPath}`];
        return {
          ...state,
          inputPath,
          reportPath,
          report,
          messages
        };
      }
      catch(error) {
        let messages = [...state.messages, error, `ERROR: Could not open ${action.payload}`];
        return {
          ...state,
          messages
        };
      }

    }
    case CLOSE_REPORT: {
      let recents = addToRecents(state.reportPath, state.recents);
      let messages = [...state.messages, `Closed report ${state.reportPath}`];
      return {
        ...state,
        recents,
        reportPath: null,
        report: null,
        inputPath: null,
        messages,
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
