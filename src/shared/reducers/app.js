/* eslint-disable no-param-reassign */
import fs from 'fs-extra';
import path from 'path';

import {
  CLOSE_REPORT,
  ADD_MESSAGE,
  OPEN_REPORT,
  SET_PROCESSING,
  PROCESSING_TYPE,
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
  switch (action.type) {
    case ADD_MESSAGE: {
      let messages = [...state.messages, action.payload];
      return {
        ...state,
        messages
      };
    }
    case CLOSE_REPORT: {
      let recents = addToRecents(state.reportPath, state.recents);
      let messages = [...state.messages, localize("message.closedreport", {reportPath: state.reportPath, interpolation: { escapeValue: false }})];
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
        let {reportPath, inputPath } = action.payload;
        let report = JSON.parse(fs.readFileSync(reportPath));
        if (inputPath === undefined && report['earl:testSubject'] !== undefined && report['earl:testSubject'].url !== undefined) {
          inputPath = path.resolve(reportPath, report['earl:testSubject'].url);
          if (!fs.existsSync(inputPath)) inputPath = null;
        }
        let messages = [...state.messages, localize("message.loadedreport", {reportPath, interpolation: { escapeValue: false }})];
        return {
          ...state,
          inputPath,
          reportPath,
          report,
          messages
        };
      }
      catch(error) {
        let messages = [...state.messages, error, localize("message.loadfailreport", {p: action.payload.reportPath, interpolation: { escapeValue: false }})];
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