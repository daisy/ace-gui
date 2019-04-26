import * as i18n from 'i18next';

// import * as enJson from "./locales/en.json";
// import * as frJson from "./locales/fr.json";
const enJson = require("./locales/en.json");
const frJson = require("./locales/fr.json");

export const LANGUAGES = {
    en: "English",
    fr: "Français",
};
export const LANGUAGE_KEYS = Object.keys(LANGUAGES);

export const DEFAULT_LANGUAGE = "en";

const RESOURCES = {
    en: {
        translation: enJson, // enJson.default || enJson,
    },
    fr: {
        translation: frJson, // frJson.default || frJson,
    },
};

const i18nextInstance = i18n.createInstance();
// https://www.i18next.com/overview/configuration-options
i18nextInstance.init({
    debug: false,
    resources: RESOURCES,
    // lng: undefined,
    fallbackLng: DEFAULT_LANGUAGE,
    // whitelist: LANGUAGE_KEYS,
    // nonExplicitWhitelist: true,
    // load: "all",
    // preload: LANGUAGE_KEYS,
    // lowerCaseLng: false,
});

var _currentLanguage = DEFAULT_LANGUAGE;

export function getCurrentLanguage() {
    return _currentLanguage;
};

export function setCurrentLanguage(language) {
    
    for (const lang of LANGUAGE_KEYS) {
        if (language === lang) {
            _currentLanguage = language;
            return;
        }
    }
    // fallback
    _currentLanguage = DEFAULT_LANGUAGE;
};

export function localize(msg, options) {
    const opts = options || {};

    if (i18nextInstance.language !== _currentLanguage) {
        i18nextInstance.changeLanguage(_currentLanguage);
    }

    return i18nextInstance.t(msg, opts);
};
