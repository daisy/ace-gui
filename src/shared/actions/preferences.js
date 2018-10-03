import {SHOW_MODAL} from './modal';

export const SAVE_PREFS = 'SAVE_PREFS';
export const EDIT_PREFS = 'EDIT_PREFS';

export function savePreferences(preferences) {
  return {
    type: SAVE_PREFS,
    payload: preferences,
  };
}

export function showPreferences() {
  return {
    type: SHOW_MODAL,
    modalType: EDIT_PREFS,
  };
}
