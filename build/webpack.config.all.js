const util = require('util');

const mainConfig = require("./webpack.config.main");
const rendererConfig = require("./webpack.config.renderer");

module.exports = (env) => {
    const mainConfig_ = mainConfig(env);
    console.log("-------------------- MAIN config:");
    console.log(util.inspect(mainConfig_, { colors: true, depth: null, compact: false }));

    const rendererConfig_ = rendererConfig(env);
    console.log("-------------------- RENDERER config:");
    console.log(util.inspect(rendererConfig_, { colors: true, depth: null, compact: false }));

    return [
      mainConfig_,
      rendererConfig_,
  ];  
};