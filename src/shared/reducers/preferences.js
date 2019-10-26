import {
  SAVE_PREFS,
} from '../actions/preferences';

import {defaultPreferences} from '../default-preferences';

const initialState = defaultPreferences;

export default function preferences(state = initialState, action) {
  state = JSON.parse(JSON.stringify(state));

  switch (action.type) {
    case SAVE_PREFS: {
      return {
        ...state,
        ...action.payload,
      };
    }
    default:
      return state;
  }
}
