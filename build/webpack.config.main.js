const util = require('util');
const path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const webpackConstants = require("./webpack.constants");

const CopyWebpackPlugin = require("copy-webpack-plugin");

const nodeEnv = process.env.NODE_ENV || "development";
const isDev = nodeEnv === "development";

const envToMode = (env) => {
  if (env === "production") {
    return "production";
  }
  return "development";
};

module.exports = (env) => {

  const modulesDir = path.join(__dirname, "..", "node_modules");
  const externals = nodeExternals({ modulesDir });
  
  const config = {
    cache: false,
    mode: envToMode(nodeEnv),
    node: {
      __dirname: false,
      __filename: false
    },
    externals: [externals],
    resolve: {
      extensions: [".js"],
      alias: {
        env: path.resolve(__dirname, `./config/env_${nodeEnv}.json`)
      }
    },
    target: "electron-main",
    entry: "./src/main/main.js",
    name: "main process",
    output: {
      filename: "main-bundle.js",
      path: path.resolve(__dirname, "..", "app"),

      // https://github.com/webpack/webpack/issues/1114
      libraryTarget: "commonjs2",
    },
    module: {
      rules: [
        // {
        //   test: /\.js$/,
        //   exclude: /node_modules/,
        //   loader: 'babel-loader',
        //   options: {
        //     cacheDirectory: false,
        //     babelrc: false,
        //     // babelrc: path.join(__dirname, '..', 'babelrc'),
        //     sourceMaps: true,
        //     presets: [
        //       [
        //         "@babel/preset-env",
        //         { targets: { browsers: "last 2 Chrome versions", "node": "current" } }
        //       ],
        //       // '@babel/preset-env',
        //       // [
        //       //   "@babel/env",
        //       //   {
        //       //     "targets": {
        //       //       "browsers": "last 2 Chrome versions",
        //       //       "node": "current"
        //       //     }
        //       //   }
        //       // ]
        //       '@babel/preset-react',
        //     ],
        //     plugins: [
        //       "transform-class-properties",
        //       ["transform-object-rest-spread", { "useBuiltIns": true }],
        //       // "react-hot-loader/babel",
        //     ]
        //   }
        // },
      ]
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, "..", "src", "renderer", "assets", "logo.svg"),
                to: path.join("..", "app"),
            }
        ]),
        webpackConstants.definePlugin
    ],
  };
  if (isDev) {
    config.output.devtoolModuleFilenameTemplate = "[absolute-resource-path]";
    config.output.pathinfo = true;
    config.devtool = "source-map";
  } else {
    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^electron-devtools-installer$/ }));
    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^redux-devtools-extension$/ }));
  }

  console.log("-------------------- MAIN config:");
  console.log(util.inspect(config, { colors: true, depth: null, compact: false }));
  return config;
};
