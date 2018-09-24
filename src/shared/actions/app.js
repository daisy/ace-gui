export const SET_READY = 'SET_READY';
export const RUN_ACE = 'RUN_ACE';
export const OPEN_REPORT = "OPEN_REPORT";
export const CLOSE_REPORT = "CLOSE_REPORT";
export const ADD_MESSAGE = "ADD_MESSAGE";

export function setReady(flag) {
  return {
    type: SET_READY,
    payload: flag,
  };
}
export function runAce(filepath) {
  return {
    type: RUN_ACE,
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
export function addMessage(message) {
  return {
    type: ADD_MESSAGE,
    payload: message,
  };
}
