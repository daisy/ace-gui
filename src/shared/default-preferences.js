/* eslint-disable no-param-reassign */
const tmp = require('tmp');

import { localizer } from './l10n/localize';
const { getDefaultLanguage } = localizer;

export const defaultPreferences = {
  language: getDefaultLanguage(),
  reports: {
    dir: tmp.dirSync({ unsafeCleanup: true }).name,
    organize: true,
    overwrite: true,
  }
};
