const { newLocalizer } = require('@daisy/ace-localize');

const enJson = require("./locales/en.json");
const frJson = require("./locales/fr.json");
const pt_BRJson = require("./locales/pt_BR.json");
const esJson = require("./locales/es.json");
const daJson = require("./locales/da.json");
const jaJson = require("./locales/ja.json");
const deJson = require("./locales/de.json");

export const localizer = newLocalizer({
    en: {
        name: "English",
        default: true,
        translation: enJson,
    },
    fr: {
        name: "Français (French)",
        translation: frJson,
    },
    pt_BR: {
        name: "Português Brasileiro (Portuguese - Brazil)",
        translation: pt_BRJson,
    },
    es: {
        name: "Español (Spanish)",
        translation: esJson,
    },
    da: {
        name: "Dansk (Danish)",
        translation: daJson,
    },
    ja: {
        name: "日本語 (Japanese)",
        translation: jaJson,
    },
    de: {
        name: "Deutsch (German)",
        translation: deJson,
    },
});
