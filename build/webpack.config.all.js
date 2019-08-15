const mainConfig = require("./webpack.config.main");
const rendererConfig = require("./webpack.config.renderer");

module.exports = (env) => {
    const mainConfig_ = mainConfig(env);
    const rendererConfig_ = rendererConfig(env);
    return [
      mainConfig_,
      rendererConfig_,
  ];  
};