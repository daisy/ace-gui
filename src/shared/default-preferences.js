/* eslint-disable no-param-reassign */
const tmp = require('tmp');

import {DEFAULT_LANGUAGE} from './l10n/localize';

export const defaultPreferences = {
  language: DEFAULT_LANGUAGE,
  reports: {
    dir: tmp.dirSync({ unsafeCleanup: true }).name,
    organize: true,
    overwrite: true,
  }
};
