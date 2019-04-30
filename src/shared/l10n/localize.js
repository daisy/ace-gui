const { newLocalizer } = require('@daisy/ace-localize');

// import * as enJson from "./locales/en.json";
// import * as frJson from "./locales/fr.json";
const enJson = require("./locales/en.json");
const frJson = require("./locales/fr.json");

export const localizer = newLocalizer({
    en: {
        name: "English",
        default: true,
        translation: enJson, // enJson.default || enJson,
    },
    fr: {
        name: "Français",
        translation: frJson, // frJson.default || frJson,
    },
});
