export const SET_OUTDIR = 'SET_OUTDIR';
export const SET_OVERWRITE = 'SET_OVERWRITE';
export const SET_ORGANIZE = 'SET_ORGANIZE';
export const SHOW_PREFS = 'SHOW_PREFS';
export const SAVE_PREFS = 'SAVE_PREFS';
export const CLOSE_PREFS = 'CLOSE_PREFS';

export function setOutdir(outdir) {
  return {
    type: SET_OUTDIR,
    payload: outdir,
  };
}
export function setOverwrite(flag) {
  return {
    type: SET_OVERWRITE,
    payload: flag,
  };
}
export function setOrganize(flag) {
  return {
    type: SET_ORGANIZE,
    payload: flag,
  };
}
