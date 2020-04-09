/* eslint-disable no-param-reassign */
import fs from 'fs-extra';
import path from 'path';

import {
  CLOSE_REPORT,
  ADD_MESSAGE,
  CLEAR_MESSAGES,
  OPEN_REPORT,
  SET_PROCESSING,
} from '../actions/app';

import { localizer } from '../l10n/localize';
const { localize } = localizer;

const initialState = {
  inputPath: null,
  report: null,
  reportPath: null,
  recents: [],
  messages: [],
  processing: {
    export: false,
    ace: false,
  }
};

export default function app(state = initialState, action) {
  state = JSON.parse(JSON.stringify(state));

  switch (action.type) {
    
    case ADD_MESSAGE: {
      let messages = [...state.messages, action.payload];
      return {
        ...state,
        messages
      };
    }
    case CLEAR_MESSAGES: {
      return {
        ...state,
        messages: []
      };
    }
    case CLOSE_REPORT: {
      let recents = state.recents;
      let added = false;
      if (recents && state.reportPath && recents.indexOf(state.reportPath) < 0) {
        recents = addToRecents(state.reportPath, state.recents);
        added = true;
      }
      let messages = []; // state.messages;
      if (added) {
        messages = [
          //...state.messages,
          localize("message.closedreport", {reportPath: state.reportPath, interpolation: { escapeValue: false }})
        ];
      }
      return {
        ...state,
        recents,
        reportPath: null,
        report: null,
        inputPath: null,
        messages,
      };
    }
    case OPEN_REPORT: {
      try {
        let {reportPath, inputPath, epubBaseDir } = action.payload;
        const inpath = inputPath;
        let report = JSON.parse(fs.readFileSync(reportPath));
        if (!inputPath && report['earl:testSubject'] !== undefined && report['earl:testSubject'].url !== undefined) {
          inputPath = path.resolve(reportPath, report['earl:testSubject'].url);
          if (!fs.existsSync(inputPath)) inputPath = null;
        }
        let messages = [
          ...(inpath ? state.messages : []),
          localize("message.loadedreport", {reportPath, interpolation: { escapeValue: false }})
        ];
        return {
          ...state,
          inputPath,
          reportPath,
          epubBaseDir,
          report,
          messages
        };
      }
      catch(error) {
        let messages = [
          ...state.messages,
          `${error.message ? error.message : error}`,
          localize("message.loadfailreport", {p: action.payload.reportPath, interpolation: { escapeValue: false }})
        ];
        return {
          ...state,
          messages
        };
      }

    }
    case SET_PROCESSING: {
      let processing = {...state.processing};
      processing[action.payload.type] = action.payload.value;
      return {
        ...state,
        processing,
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