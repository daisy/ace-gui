import path from 'path';

import fs from 'fs-extra';

import ace from '@daisy/ace-core';
import zip from '../helpers/zip';

import epubUtils from '@daisy/epub-utils';
import logger from '@daisy/ace-logger';

import { resetInitialReportView } from './reportView';

import { ipcRenderer } from 'electron';

// const createAxeRunner = require('@daisy/ace-axe-runner-electron').createAxeRunner;
import { createAxeRunner } from '@daisy/ace-axe-runner-electron';
const CONCURRENT_INSTANCES = 4; // same as the Puppeteer Axe runner
const axeRunner = ipcRenderer ? createAxeRunner(ipcRenderer, CONCURRENT_INSTANCES) : undefined;

import { localizer } from '../l10n/localize';
const { setCurrentLanguage, getCurrentLanguage, localize } = localizer;

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
  const isEPUB = /\.epub[3]?$/.test(path.extname(filepath));
  if (isEPUB) {
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

function checkAlreadyProcessing(dispatch, st, inputPath) {
  if (st.app && st.app.processing && st.app.processing[PROCESSING_TYPE.ACE]){ // check already running (for example, "file open..." event)
    const p = st.app.processing[PROCESSING_TYPE.ACE]; // st.app.inputPath;
    dispatch(addMessage(localize("message.runningace", {inputPath: `${p} (... ${inputPath})`, interpolation: { escapeValue: false }})));
    return true;
  }
  return false;
}

export function openFile(filepath) {
  return (dispatch, getState) => {
    let type = checkType(filepath);
    if (type == 1) {
      if (!checkAlreadyProcessing(dispatch, getState(), filepath)) {
        dispatch(closeReport());
        dispatch(resetInitialReportView());

        dispatch(runAce(filepath));
      }
    }
    else if (type == 2) {
      dispatch(closeReport());
      dispatch(resetInitialReportView());

      dispatch(openReport(filepath));
    }
    else if (type == -1) {
      dispatch(addMessage(localize("message.filetypenotsupported", {filepath, interpolation: { escapeValue: false }})));
    }
  }
}

export function runAce(inputPath) {
  return (dispatch, getState) => {
    if (!axeRunner) {
      dispatch(setProcessing(PROCESSING_TYPE.ACE, false))
      dispatch(addMessage("!axeRunner Electron renderer process?"));
      return;
    }

    if (checkAlreadyProcessing(dispatch, getState(), inputPath)) {
      return;
    }

    dispatch(setProcessing(PROCESSING_TYPE.ACE, inputPath));
    dispatch(addMessage(localize("message.runningace", {inputPath, interpolation: { escapeValue: false }})));

    let outdir = prepareOutdir(inputPath, getState().preferences);
    if (outdir.success) {

      const language = getCurrentLanguage();
      if (language) {
        setCurrentLanguage(language);
      }
      logger.initLogger({ verbose: true, silent: false, fileName: "ace-gui.log" });

      function doAce(epubPath) {
        ace(epubPath, {outdir: outdir.value, lang: language, verbose: true, silent: false, initLogger: false}, axeRunner)
        .then((res) => {
          dispatch(addMessage(localize("message.checkcomplete")));
  
          let reportPath = path.join(outdir.value, 'report.json');
          dispatch(openReport(reportPath, inputPath, epubPath));
        })
        .then(() => {
          dispatch(setProcessing(PROCESSING_TYPE.ACE, false));
        })
        .catch(error =>  {// Ace execution error
          dispatch(addMessage(error));
          dispatch(setProcessing(PROCESSING_TYPE.ACE, false))
        });
      }

      const epubBaseDirDEFAULT = path.join(outdir.value, "tmp_unzipped_EPUB");
      let epubBaseDir = inputPath;
      if (fs.statSync(inputPath).isFile()) {

        const epub = new epubUtils.EPUB(inputPath);
        epubBaseDir = epubBaseDirDEFAULT;
        if (!fs.existsSync(epubBaseDir)) {
          fs.ensureDirSync(epubBaseDir);
        }
        epub.extract(epubBaseDir)
        // .then((epb) => {
        //   console.log(JSON.stringify(epb, null, 4));
        //   return epb.parse();
        // })
        .then((epb) => {
          // console.log(JSON.stringify(epb.metadata, null, 4));
          doAce(epubBaseDir);
        })
        .catch((err) => {
          console.log(`Unexpected error: ${(err.message !== undefined) ? err.message : err}`);
          if (err.stack !== undefined) console.log(err.stack);
          dispatch(addMessage(err));
          dispatch(setProcessing(PROCESSING_TYPE.ACE, false))
        });
      } else {
        if (epubBaseDir === epubBaseDirDEFAULT) {
          doAce(epubBaseDir);
        } else {
          // TODO? copy exploded EPUB contents into app-managed folder? (epubBaseDirDEFAULT)
          doAce(epubBaseDir);
        }
      }
    }
    else { // error creating outdir (.value has the error message)
      dispatch(setProcessing(PROCESSING_TYPE.ACE, false))
      dispatch(addMessage(outdir.value));
    }
  }
}
export function openReport(reportPath, inputPath, epubBaseDir) {
  return {
    type: OPEN_REPORT,
    payload: { reportPath, inputPath, epubBaseDir },
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
