const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const nodeExternals = require("webpack-node-externals");
const webpackConstants = require("./webpack.constants");

const envToMode = (env) => {
  if (env === "production") {
    return "production";
  }
  return "development";
};

const externals = nodeExternals();
console.log("WEBPACK externals (RENDERER):");
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
      extensions: [".js", ".jsx"],
      alias: {
        env: path.resolve(__dirname, `./config/env_${env}.json`)
      }
    },
    target: "electron-renderer",
    entry: "./src/renderer/app.js",
    name: "renderer process",
    output: {
      filename: "renderer-bundle.js",
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
        {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loaders: ["react-hot-loader/webpack"],
        },
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
        new MiniCssExtractPlugin({
            filename: "styles.css"
        }),
        webpackConstants.definePlugin
    ],
  };
  if (env_ === "development") {
    const httpPort = parseInt(webpackConstants.httpPort, 10);

    config.output.devtoolModuleFilenameTemplate = "[absolute-resource-path]";
    config.output.pathinfo = true;
    config.output.publicPath = webpackConstants.rendererUrl;
    config.devtool = "source-map";

    config.devServer = {
        contentBase: __dirname,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        hot: true,
        watchContentBase: true,
        watchOptions: {
            ignored: [/app/, /build/, /doc/, /kb/, /node_modules/]
        },
        httpPort,
    };

    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.module.rules.push({
        test: /\.css$/,
        use: [
            "css-hot-loader",
            MiniCssExtractPlugin.loader,
            {
                loader: "css-loader",
                options: {
                    importLoaders: 1,
                    modules: true,
                },
            },
        ],
    });
  }
  return config;
};
