const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
module.exports = {
  watch: true,

  target: 'electron-renderer',

  entry: './app/renderer/entry.js',

  devServer: {
    contentBase: './dist'
  },
  output: {
      path: __dirname + '/app/build',
      publicPath: 'build/',
      filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        test: /(\.js$|\.jsx$)/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
          plugins: ["@babel/plugin-proposal-class-properties", "@babel/plugin-proposal-object-rest-spread"]
        }
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
        loader:  'css-loader',
        options: {
          modules: true
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      },
    ]
  },

  plugins: [
    new ExtractTextPlugin({
      filename: 'bundle.css',
      disable: false,
      allChunks: true
    }),
    new UglifyJsPlugin({
      test: /\.js($|\?)/i,
      sourceMap: true,
      uglifyOptions: {
        compress: true
      }
    })
  ],

  resolve: {
    extensions: ['.js', '.json', '.jsx']
  }
}
