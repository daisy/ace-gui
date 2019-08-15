const path = require("path");
const nodeExternals = require("webpack-node-externals");
const webpackConstants = require("./webpack.constants");

const envToMode = (env) => {
  if (env === "production") {
    return "production";
  }
  return "development";
};

const externals = nodeExternals();
console.log("WEBPACK externals (MAIN):");
console.log(JSON.stringify(externals, null, "  "));

module.exports = (env) => {
  const env_ = envToMode(env);

  const config = {
    mode: env_,
    node: {
      __dirname: false,
      __filename: false
    },
    externals: [externals],
    resolve: {
      extensions: [".js"],
      alias: {
        env: path.resolve(__dirname, `./config/env_${env_}.json`)
      }
    },
    target: "electron-main",
    entry: "./src/main/main.js",
    name: "main process",
    output: {
      filename: "main-bundle.js",
      path: path.resolve(__dirname, "../app"),

      // https://github.com/webpack/webpack/issues/1114
      libraryTarget: "commonjs2",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ["transform-class-properties"]
          }
        },
      ]
    },
    plugins: [
        webpackConstants.definePlugin
    ],
  };
  if (env_ === "development") {
    config.output.devtoolModuleFilenameTemplate = "[absolute-resource-path]";
    config.output.pathinfo = true;
    config.devtool = "source-map";
  }
  return config;
};
