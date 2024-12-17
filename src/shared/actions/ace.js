import path from 'path';

import fs from 'fs-extra';

import ace from '@daisy/ace-core';

import epubUtils from '@daisy/epub-utils';
import logger from '@daisy/ace-logger';

import { setProcessing, clearMessages, addMessage, checkAlreadyProcessing, openReport, PROCESSING_TYPE } from './common';

import { ipcRenderer } from 'electron';

import { eventEmmitter } from '../main-renderer-events';

// const createAxeRunner = require('@daisy/ace-axe-runner-electron').createAxeRunner;
import { createAxeRunner } from '@daisy/ace-axe-runner-electron';
const CONCURRENT_INSTANCES = 4; // same as the Puppeteer Axe runner

// TODO: ipcRenderer always here,
// but leaving eventEmmitter as a reminder that
// if createAxeRunner() is created from the main process
// instead of renderer process, then the shared eventEmmitter must be used instead!
// (see the prepareLaunch() counterpart)
const axeRunner = createAxeRunner(ipcRenderer ? ipcRenderer : eventEmmitter, CONCURRENT_INSTANCES);

import { localizer } from '../l10n/localize';
const { setCurrentLanguage, getCurrentLanguage, localize } = localizer;

const _tmp_epub_unzip_subfolder = "_unzipped_EPUB_";

export function runAce(inputPath) {
  return (dispatch, getState) => {

    inputPath = fs.existsSync(inputPath) ? fs.realpathSync(inputPath) : inputPath;

    // if (!axeRunner) {
    //   dispatch(setProcessing(PROCESSING_TYPE.ACE, false))
    //   dispatch(addMessage("!axeRunner Electron renderer process?"));
    //   return;
    // }

    if (checkAlreadyProcessing(dispatch, getState(), inputPath)) {
      return;
    }

    dispatch(setProcessing(PROCESSING_TYPE.ACE, inputPath));
    dispatch(clearMessages());
    dispatch(addMessage(localize("message.runningace", {inputPath, interpolation: { escapeValue: false }})));

    let outdir = prepareOutdir(inputPath, getState().preferences);
    if (outdir.success) {

      const l10nDoneCallback = () => {}; // no need to async/await on this
      const language = getCurrentLanguage();
      if (language) {
        setCurrentLanguage(language, l10nDoneCallback);
      }
      logger.initLogger({ verbose: true, silent: false, fileName: "ace-gui.log" });

      function doAce(epubPath) {
        ace(epubPath, {outdir: outdir.value, lang: language, verbose: true, silent: false, initLogger: false, timeout: getState().preferences.timeout || undefined}, axeRunner)
        .then((res) => {
          dispatch(addMessage(localize("message.checkcomplete")));

          let reportPath = path.join(outdir.value, 'report.json');
          dispatch(openReport(reportPath, inputPath, epubPath));
        })
        .then(() => {
          dispatch(setProcessing(PROCESSING_TYPE.ACE, false));
        })
        .catch(error =>  {// Ace execution error

          console.log(`Ace error: ${error.message ? error.message : error}`);
          if (error.stack !== undefined) console.log(error.stack);

          dispatch(addMessage(`${error.message ? error.message : error}`));
          dispatch(setProcessing(PROCESSING_TYPE.ACE, false))
        });
      }

      const epubBaseDirDEFAULT = path.join(outdir.value, _tmp_epub_unzip_subfolder);
      let epubBaseDir = inputPath;
      if (fs.statSync(epubBaseDir).isFile()) {

        const epub = new epubUtils.EPUB(epubBaseDir);
        epubBaseDir = epubBaseDirDEFAULT;
        if (!fs.existsSync(epubBaseDir)) {
          fs.ensureDirSync(epubBaseDir);
        }
        // remote.shell.showItemInFolder(epubBaseDir);
        // (ipcRenderer ? ipcRenderer : eventEmmitter).send(IPC_EVENT_showItemInFolder, {path: epubBaseDir});

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
          console.log(`Unexpected error: ${err.message ? err.message : err}`);
          if (err.stack !== undefined) console.log(err.stack);

          dispatch(addMessage(`${err.message ? err.message : err}`));
          dispatch(setProcessing(PROCESSING_TYPE.ACE, false))
        });
      } else {
        // remote.shell.showItemInFolder(epubBaseDir);
        // (ipcRenderer ? ipcRenderer : eventEmmitter).send(IPC_EVENT_showItemInFolder, {path: epubBaseDir});

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


function prepareOutdir(filepath, prefs) {
  let outdir = prefs.reports.dir;

  console.log(`== PREPARE OUT DIR:`);

  outdir = fs.existsSync(outdir) ? fs.realpathSync(outdir) : outdir;

  const within = filepath.startsWith(outdir);
  const reRunFromUnzipped = within &&
    path.basename(filepath) === _tmp_epub_unzip_subfolder;

  if (reRunFromUnzipped) {
    outdir = path.dirname(filepath);
    console.log(`RE-RUN FROM OUT DIR => ${outdir}`);

    fs.removeSync(path.join(outdir, 'report.json'));
    fs.removeSync(path.join(outdir, 'report.html'));
    fs.removeSync(path.join(outdir, 'data'));
    fs.removeSync(path.join(outdir, 'js'));
  } else {
    if (prefs.reports.organize) {
      outdir = path.join(outdir, path.parse(filepath).name);
      console.log(`SUB OUT DIR => ${outdir}`);
    }
    if (!prefs.reports.overwrite) {
      const overrides = ['report.json', 'report.html', 'data', 'js']
        .map(file => path.join(outdir, file))
        .filter(fs.existsSync);
      if (overrides.length > 0) {
        const val = overrides.map(file => `  - ${file}`).join('\n');
        console.log(`CANNOT OVERRIDE in ${outdir} (${val})`);
        return {success: false, value: localize("message.overwrite", {val, interpolation: { escapeValue: false }})};
      }
    } else {
      if (!within) {
        console.log(`DELETE OUT DIR: ${outdir}`);
        if (fs.existsSync(outdir)) {
          fs.removeSync(outdir);
        }
      } else {
        console.log(`SKIP DELETE OUT DIR: ${outdir}`);
      }
    }
  }

  return {success: true, value: outdir};
}
