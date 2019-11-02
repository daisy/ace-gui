const webpack = require("webpack");
const { version, build } = require("../package.json");

const httpPort = process.env.HTTP_PORT || "8090";

const nodeEnv = process.env.NODE_ENV || "development";
const isDev = nodeEnv === "development";

const isVisualStudioCodeLaunch = process.env.VSCODE_LAUNCH || "false";

const rendererUrl = isDev && !process.env.NO_WEBPACK_DEV_SERVER ?
    ("http://localhost:"+httpPort+"/") : "file://";

const isPackaging = process.env.PACKAGING || "0";

const nodeModuleRelativeUrl = (isPackaging === "1") ?
    "node_modules" : "../node_modules";

const data = {
    __APP_VERSION__: JSON.stringify(version),
    __APP_NAME__: JSON.stringify(build.productName),
    __NODE_ENV__: JSON.stringify(nodeEnv),
    __VSCODE_LAUNCH__: JSON.stringify(isVisualStudioCodeLaunch),
    __NODE_MODULE_RELATIVE_URL__: JSON.stringify(nodeModuleRelativeUrl),
    __PACKAGING__: JSON.stringify(isPackaging),
    __RENDERER_URL__: JSON.stringify(rendererUrl),
};

// we do not replace "process.env.NODE_ENV" at build-time,
// because we check actual runtime env vars
// when __PACKAGING__ === "0" && __NODE_ENV__ === "production"
if (false) {
    data["process.env.NODE_ENV"] = JSON.stringify(nodeEnv);
}

const definePlugin = new webpack.DefinePlugin(data);
module.exports = {
    definePlugin,
    httpPort,
    rendererUrl,
};
