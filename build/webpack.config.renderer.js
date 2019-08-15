const util = require('util');
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const nodeExternals = require("webpack-node-externals");
const webpackConstants = require("./webpack.constants");

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
      extensions: [".js", ".jsx"],
      alias: {
        env: path.resolve(__dirname, `./config/env_${nodeEnv}.json`)
      }
    },
    target: "electron-renderer",
    entry: "./src/renderer/app.js",
    name: "renderer process",
    output: {
      filename: "renderer-bundle.js",
      path: path.resolve(__dirname, "..", "app"),

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
            cacheDirectory: false,
            babelrc: false,
            // babelrc: path.join(__dirname, '..', 'babelrc'),
            sourceMaps: isDev,
            presets: [
              [
                "@babel/preset-env",
                { targets: { browsers: "last 2 Chrome versions", "node": "current" } }
              ],
              // '@babel/preset-env',
              // [
              //   "@babel/env",
              //   {
              //     "targets": {
              //       "browsers": "last 2 Chrome versions",
              //       "node": "current"
              //     }
              //   }
              // ]
              '@babel/preset-react',
            ],
            plugins: [
              "transform-class-properties",
              // ["transform-object-rest-spread", { "useBuiltIns": true }],
              // "react-hot-loader/babel",
            ]
          }
        },
        // {
        //     test: /\.jsx?$/,
        //     exclude: /node_modules/,
        //     loaders: ["react-hot-loader/webpack"],
        // },
        {
          test: /\.scss$/,
          loaders: [
            'style-loader',// inserts raw css into styles elements.
            'css-loader', // css-loader parses css files resolves url() expressions.
            'sass-loader' // sass-loader for sass compilation
          ]
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]'
          }
        }
      ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/renderer/index.ejs",
            filename: "index.html",
        }),
        // new MiniCssExtractPlugin({
        //     filename: "styles.css"
        // }),
        webpackConstants.definePlugin
    ],
  };
  if (isDev) {
    const httpPort = parseInt(webpackConstants.httpPort, 10);

    config.output.devtoolModuleFilenameTemplate = "[absolute-resource-path]";
    config.output.pathinfo = true;
    config.output.publicPath = webpackConstants.rendererUrl;
    config.devtool = "source-map";
    // config.devtool = "eval-source-map";
    // config.devtool = 'inline-source-map';

    config.devServer = {
        contentBase: __dirname,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        // hot: true,
        watchContentBase: true,
        watchOptions: {
            ignored: [/app/, /build/, /doc/, /kb/, /node_modules/]
        },
        port: httpPort,
        // inline: true
    };

    // config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.module.rules.push(
      // {
      //   test: /\.scss$/,
      //   use: [
      //       "css-hot-loader",
      //       MiniCssExtractPlugin.loader,
      //       {
      //           loader: "css-loader",
      //           options: {
      //               importLoaders: 1,
      //               modules: true,
      //           },
      //       },
      //       'sass-loader'
      //   ]
      // },
    //   {
    //     test: /\.css$/,
    //     use: [
    //         "css-hot-loader",
    //         MiniCssExtractPlugin.loader,
    //         {
    //             loader: "css-loader",
    //             options: {
    //                 importLoaders: 1,
    //                 modules: true,
    //             },
    //         },
    //     ],
    // }
    );
  }

  console.log("-------------------- RENDERER config:");
  console.log(util.inspect(config, { colors: true, depth: null, compact: false }));
  return config;
};
