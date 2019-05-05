import path from 'path';
import fs from 'fs';
import ace from '@daisy/ace-core';
import zip from '../helpers/zip';

import {axeRunner} from '../axe-runner';

import { localizer } from '../l10n/localize';
const { getCurrentLanguage, localize } = localizer;

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
      dispatch(addMessage(localize("message.filetypenotsupported", {filepath, interpolation: { escapeValue: false }})));
    }
  }
}

export function runAce(inputPath) {
  return (dispatch, getState) => {
    dispatch(setProcessing(PROCESSING_TYPE.ACE, true));
    dispatch(addMessage(localize("message.runningace", {inputPath, interpolation: { escapeValue: false }})));
    let outdir = prepareOutdir(inputPath, getState().preferences);

    if (outdir.success) {
      const language = getCurrentLanguage();
      
      ace(inputPath, {outdir: outdir.value, lang: language, verbose: true, silent: false, initLogger: false}, axeRunner)
      .then(() => {
        dispatch(addMessage(localize("message.checkcomplete")));
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
    dispatch(addMessage(localize("message.savingreport", {outfile, interpolation: { escapeValue: false }})));
    zip(path.dirname(reportPath), outfile)
    .then(() => {
      dispatch(addMessage(localize("message.savedreport", {outfile, interpolation: { escapeValue: false }})));
      dispatch(setProcessing(PROCESSING_TYPE.EXPORT, false));
    })
    .catch(error => {
      dispatch(addMessage(error));
      dispatch(addMessage(localize("message.failsavereport", {outfile, interpolation: { escapeValue: false }})));
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
      const val = overrides.map(file => `  - ${file}`).join('\n');
      return {success: false, value: localize("message.overwrite", {val, interpolation: { escapeValue: false }})};
    }
  }
  return {success: true, value: outdir};
}
