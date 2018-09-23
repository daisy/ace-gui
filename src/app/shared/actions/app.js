export const SET_READY = 'SET_READY';
export const OPEN_EPUB = 'OPEN_EPUB';
export const OPEN_REPORT = "OPEN_REPORT";
export const CLOSE_REPORT = "CLOSE_REPORT";
export const TOGGLE_FULLSCREEN = 'TOGGLE_FULLSCREEN';
export const ADD_MESSAGE = "ADD_MESSAGE";

export function setReady(flag) {
  return {
    type: SET_READY,
    payload: flag,
  };
}
export function openEpub(filepath) {
  return {
    type: OPEN_EPUB,
    payload: filepath,
  };
}
export function openReport(filepath) {
  return {
    type: OPEN_REPORT,
    payload: filepath,
  };
}
export function closeReport() {
  return {
    type: CLOSE_REPORT,
    payload: '',
  };
}
export function toggleFullscreen(flag) {
  return {
    type: TOGGLE_FULLSCREEN,
    payload: flag,
  };
}
export function addMessage(message) {
  return {
    type: ADD_MESSAGE,
    payload: message,
  };
}
