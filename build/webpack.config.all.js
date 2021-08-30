const mainConfig = require("./webpack.config.main");
const rendererConfig = require("./webpack.config.renderer");
const preloadConfig = require("./webpack.config.preload");

module.exports = (env) => {
    const mainConfig_ = mainConfig(env);
    const rendererConfig_ = rendererConfig(env);
    const preloadConfig_ = preloadConfig(env);
    return [
      mainConfig_,
      rendererConfig_,
      preloadConfig_,
  ];  
};