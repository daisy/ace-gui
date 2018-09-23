/* eslint-disable no-param-reassign */

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
      let epubFilepath = action.payload;
      let outdir = prepareOutdir(epubFilepath, state.preferences);
      let messages = state.app.messages;
      let report = state.app.report;
      if (outdir.success) {
        let aceReport = await runAce(epubFilepath, outdir.value); // TODO something like this maybe
        messages = [...messages, 'Ace check complete']; // TODO might have been an error
        if (aceReport) report = aceReport;
      }
      else {
        messages = [...messages, outdir.value];
      }

      return {
        ...state,
        epubFilepath,
        messages,
        report
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
      let recents = addToRecents(state.app.reportFilepath, state.app.recents);
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
      let messages = [...state.app.messages, action.payload];
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
  return recents.indexOf(filepath) == -1) ?
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

function runAce(filepath, outdir) {
  ace(filepath, {outdir})
  .catch(error => {
    // TODO
    console.log("OH NO");
  });
}
