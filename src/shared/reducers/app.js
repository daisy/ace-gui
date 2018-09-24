/* eslint-disable no-param-reassign */
const ace = require('@daisy/ace-core');
const electron = require('electron');
const fs = require('fs');

import {
  SET_READY,
  RUN_ACE,
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
    case RUN_ACE: {
      return dispatch => {
        let ready = false;
        dispatch({type: SET_READY, ready});
        let epubFilepath = action.payload;
        let outdir = prepareOutdir(epubFilepath, state.preferences);

        if (outdir.success) {
          ace(epubFilepath, {outdir: outdir.value})
          .then(() => {
            let messages = [...state.messages, 'Ace check complete'];
            let report = JSON.parse(fs.readFileSync(outdir + '/report.json')); // TODO error handling for parsing
            let reportFilepath = outdir + '/report.json';
            ready = true;
            return {
              ...state,
              messages,
              report,
              reportFilepath,
              ready
            };
          })
          .catch(error => { // Ace execution error
            let messages = [...state.messages, error];
            ready = true;
            return {
              ...state,
              messages,
              ready
            };
          })
        }
        else { // error creating outdir (.value has the error message)
          let messages = [...state.messages, outdir.value];
          return {
            ...state,
            messages
          };
        }
      }
    }
    case OPEN_REPORT: {
      // TODO show error
      try {
        let report = JSON.parse(fs.readFileSync(action.payload));
        let reportFilepath = action.payload;
        return {
          ...state,
          reportFilepath,
          report
        };
      }
      catch(error) {
        messages = [...state.messages, `ERROR: Could not open ${action.payload}`];
        return {
          ...state,
          messages
        };
      }

    }
    case CLOSE_REPORT: {
      let recents = addToRecents(state.reportFilepath, state.recents);
      let reportFilepath = '';
      let report = null;
      return {
        ...state,
        recents,
        reportFilepath,
        report
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

function prepareOutdir(filepath, prefs) {
  let outdir = prefs.outdir;
  if (prefs.organize) {
    outdir = path.join(outdir, path.parse(filepath).name);
  }
  if (!prefs.overwrite) {
    const overrides = ['report.json', 'report.html', 'data', 'js']
      .map(file => path.join(outdir, file))
      .filter(fs.existsSync);
    if (overrides.length > 0) {
      let msg = `Output directory is not empty. Running Ace would overwrite the following files or directories:
      ${overrides.map(file => `  - ${file}`).join('\n')}. Enable the option 'Overwrite' to allow this.`;
      return {success: false, value: msg};
    }
  }
  return {success: true, value: outdir};
}
