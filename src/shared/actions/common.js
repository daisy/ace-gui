import { localizer } from '../l10n/localize';
const { setCurrentLanguage, getCurrentLanguage, localize } = localizer;

export const PROCESSING_TYPE = {
  ACE: 'ace',
  EXPORT: 'export',
  ZIPEPUB: 'zipepub',
}

export const SET_PROCESSING = 'SET_PROCESSING';
export function setProcessing(type, value) {
  return {
    type: SET_PROCESSING,
    payload: {type: type, value: value},
  };
}

export const ADD_MESSAGE = "ADD_MESSAGE";
export function addMessage(message) {
  return {
    type: ADD_MESSAGE,
    payload: message,
  };
}

export const CLEAR_MESSAGES = "CLEAR_MESSAGES";
export function clearMessages() {
  return {
    type: CLEAR_MESSAGES,
  };
}

export const OPEN_REPORT = "OPEN_REPORT";
export function openReport(reportPath, inputPath, epubBaseDir) {
  return {
    type: OPEN_REPORT,
    payload: { reportPath, inputPath, epubBaseDir },
  };
}

export const CLOSE_REPORT = "CLOSE_REPORT";
export function closeReport() {
  return {
    type: CLOSE_REPORT,
  };
}

export function checkAlreadyProcessing(dispatch, st, inputPath) {
  // check already running (for example, "file open..." event)
  if (st.app && st.app.processing && st.app.processing.ace
    && st.app.processing.ace !== 1 // see openFile() below, setProcessing(PROCESSING_TYPE.ACE, 1) for ASAP spinner (Ace core load EPUB can take a long time, blocking UI)
    ) {
    const p = st.app.processing.ace; // st.app.inputPath;
    dispatch(addMessage(localize("message.runningace", {inputPath: `${p} (... ${inputPath})`, interpolation: { escapeValue: false }})));
    return true;
  }
  return false;
}
