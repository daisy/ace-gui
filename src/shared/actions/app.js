import path from 'path';

import fs from 'fs-extra';

import zip from '../helpers/zip';

import { resetInitialReportView } from './reportView';

import { ipcRenderer } from 'electron';

import { eventEmmitter, IPC_EVENT_showItemInFolder } from '../main-renderer-events';

import { closeReport, setProcessing, addMessage, PROCESSING_TYPE, checkAlreadyProcessing, openReport } from './common';

import { runAce } from './ace';

import { localizer } from '../l10n/localize';
const { setCurrentLanguage, getCurrentLanguage, localize } = localizer;

const _tmp_epub_unzip_subfolder = "_unzipped_EPUB_";

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

export function openFile(filepath) {
  console.log("openFile ACTION: ", filepath);
  return (dispatch, getState) => {
    let type = checkType(filepath);
    if (type == 1) {
      if (!checkAlreadyProcessing(dispatch, getState(), filepath)) {
        dispatch(closeReport());
        dispatch(resetInitialReportView());

        dispatch(setProcessing(PROCESSING_TYPE.ACE, 1));
        setTimeout(() => {
          dispatch(runAce(filepath));
        }, 500);
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

export function zipEpub() {
  return (dispatch, getState) => {

    let {app: { inputPath, reportPath, epubBaseDir }} = getState();
    
    const parentDir = path.dirname(epubBaseDir);
    let epubFileName = path.basename(epubBaseDir);
    if (epubFileName === _tmp_epub_unzip_subfolder) {
      epubFileName = path.basename(parentDir);
    }
    const epubZipPath = `${path.join(parentDir, epubFileName)}.epub`;

    dispatch(setProcessing(PROCESSING_TYPE.ZIPEPUB, true));
    dispatch(addMessage(`${localize("metadata.save")} (EPUB ${localize("dialog.ziparchive")}): ${epubBaseDir} => ${epubFileName}.epub`));
    
    let previousProgressFile = null;
    let previousProgressPercent = -1;
    let previousTimeDispatch = -1;
    zip((progressPercent, progressFile) => {

      const differentFile = previousProgressFile !== progressFile;
      const differentPercent = previousProgressPercent !== progressPercent;
      if (previousTimeDispatch === -1 ||
        differentFile ||
        differentPercent) {

        previousProgressFile = progressFile;
        previousProgressPercent = progressPercent;

        let doDispatch = false;
        if (previousTimeDispatch === -1) {
          doDispatch = true;
        } else {
          const diff = performance.now() - previousTimeDispatch;
          doDispatch = diff > 400;
        }
        if (doDispatch) {
          previousTimeDispatch = performance.now();
          console.log(progressPercent);
          console.log(progressFile);
          dispatch(setProcessing(PROCESSING_TYPE.ZIPEPUB, { progressFile, progressPercent }));
        }
      }
      
    }, epubBaseDir, epubZipPath,
      null,
      [
        new RegExp(`^\\.DS_Store`),
        new RegExp(`^__MACOSX[/\\\\]`),
      ]
    )
    .then(() => {
      // remote.shell.showItemInFolder(epubZipPath);
      (ipcRenderer ? ipcRenderer : eventEmmitter).send(IPC_EVENT_showItemInFolder, {path: epubZipPath});
      
      dispatch(addMessage(`${localize("dialog.open")} [${epubFileName}.epub]`));
      dispatch(setProcessing(PROCESSING_TYPE.ZIPEPUB, false));
    })
    .catch(error => {
      // remote.shell.showItemInFolder(epubBaseDir);
      (ipcRenderer ? ipcRenderer : eventEmmitter).send(IPC_EVENT_showItemInFolder, {path: epubBaseDir});

      dispatch(addMessage(`${error.message ? error.message : error}`));
      dispatch(addMessage(`!!! EPUB ${localize("dialog.ziparchive")}: ${epubBaseDir} -- ${epubZipPath}`));
      dispatch(setProcessing(PROCESSING_TYPE.ZIPEPUB, false));
    });
  }
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
    const dirToZip = path.dirname(reportPath);
    zip(null, dirToZip, outfile,
      // see prepareOutdir() overrides:
      [
        new RegExp(`^report\\.json`),
        new RegExp(`^report\\.html`),
        new RegExp(`^data[/\\\\]`),
        new RegExp(`^js[/\\\\]`),
        new RegExp(`^report-html-files[/\\\\]`),
      ]
    )
    .then(() => {
      // remote.shell.showItemInFolder(outfile);
      (ipcRenderer ? ipcRenderer : eventEmmitter).send(IPC_EVENT_showItemInFolder, {path: outfile});

      dispatch(addMessage(localize("message.savedreport", {outfile, interpolation: { escapeValue: false }})));
      dispatch(setProcessing(PROCESSING_TYPE.EXPORT, false));
    })
    .catch(error => {
      // remote.shell.showItemInFolder(dirToZip);
      (ipcRenderer ? ipcRenderer : eventEmmitter).send(IPC_EVENT_showItemInFolder, {path: dirToZip});

      dispatch(addMessage(`${error.message ? error.message : error}`));
      dispatch(addMessage(localize("message.failsavereport", {outfile, interpolation: { escapeValue: false }})));
      dispatch(setProcessing(PROCESSING_TYPE.EXPORT, false));
    });
  };
}
