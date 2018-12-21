import path from 'path';
import fs from 'fs';
import ace from '@daisy/ace-core';
import zip from '../helpers/zip';

export const ADD_MESSAGE = "ADD_MESSAGE";
export const CLOSE_REPORT = "CLOSE_REPORT";
export const EXPORT_REPORT = "EXPORT_REPORT";
export const OPEN_REPORT = "OPEN_REPORT";
export const SET_PROCESSING = 'SET_PROCESSING';
export const PROCESSING_TYPE = {
  ACE: 'ace',
  EXPORT: 'export',
}

function checkType(filepath) {
  // crude way to check filetype
  if (path.extname(filepath) == '.epub') {
    return 1;
  }
  else if (path.extname(filepath) == '.json') {
    return 2;
  }
  else {
    // don't accept any other files, however...
    if (fs.statSync(filepath).isFile()) {
      return -1;
    }
    // ...it might be an unpacked EPUB directory; let Ace decide
    else {
      return 1;
    }
  }
}

export function setProcessing(type, value) {
  return {
    type: SET_PROCESSING,
    payload: {type: type, value: value},
  };
}

export function openFile(filepath) {
  return dispatch => {
    let type = checkType(filepath);
    if (type == 1) {
      dispatch(runAce(filepath));
    }
    else if (type == 2) {
      dispatch(openReport(filepath));
    }
    else if (type == -1) {
      dispatch(addMessage(`ERROR: File type of ${filepath} not supported`));
    }
  }
}

export function runAce(inputPath) {
  return (dispatch, getState) => {
    dispatch(setProcessing(PROCESSING_TYPE.ACE, true));
    dispatch(addMessage(`Running Ace on ${inputPath}`));
    let outdir = prepareOutdir(inputPath, getState().preferences);

    if (outdir.success) {
      ace(inputPath, {outdir: outdir.value})
      .then(() => {
        dispatch(addMessage('Ace check complete'));
        let reportPath = outdir.value + '/report.json';
        dispatch(openReport(reportPath, inputPath));
      })
      .then(() => {
        dispatch(setProcessing(PROCESSING_TYPE.ACE, false));
      })
      .catch(error =>  {// Ace execution error
        dispatch(addMessage(error));
        dispatch(setProcessing(PROCESSING_TYPE.ACE, false))
      });
    }
    else { // error creating outdir (.value has the error message)
      dispatch(setProcessing(PROCESSING_TYPE.ACE, false))
      dispatch(addMessage(outdir.value));
    }
  }
}
export function openReport(reportPath, inputPath) {
  return {
    type: OPEN_REPORT,
    payload: { reportPath, inputPath },
  };
}

export function closeReport() {
  return {
    type: CLOSE_REPORT,
  };
}

export function exportReport(outfile) {
  return (dispatch, getState) => {
    let {app: { reportPath }} = getState();
    // TODO add defensive statements:
    // - ensure reportPath exists
    // - ensure outdir exists
    // - ensure outdir is overwriteable
    dispatch(setProcessing(PROCESSING_TYPE.EXPORT, true));
    dispatch(addMessage(`Saving report to ${outfile}…`));
    zip(path.dirname(reportPath), outfile)
    .then(() => {
      dispatch(addMessage(`Saved report to ${outfile}…`));
      dispatch(setProcessing(PROCESSING_TYPE.EXPORT, false));
    })
    .catch(error => {
      dispatch(addMessage(error));
      dispatch(addMessage(`ERROR: couldn't save report to ${outfile}`));
      dispatch(setProcessing(PROCESSING_TYPE.EXPORT, false));
    });
  };
}

export function addMessage(message) {
  return {
    type: ADD_MESSAGE,
    payload: message,
  };
}

function prepareOutdir(filepath, prefs) {
  let outdir = prefs.reports.dir;
  if (prefs.reports.organize) {
    outdir = path.join(outdir, path.parse(filepath).name);
  }
  if (!prefs.reports.overwrite) {
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
