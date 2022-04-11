// const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const path = require('path');
const webpack = require('webpack')
// const cleanPlugin = require('clean-webpack-plugin');

// const preprocessor = {
//     DEBUG: true,
//     SERVER: false,
//     CLIENT: true
// };
//
// const ifdef_query = require('querystring').encode(preprocessor);

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        // use: {
        // loader: `ifdef-loader?${ifdef_query}`,
        // },
      }
    ]
  },
  entry: {
    Client: './src/fe/main.js',
    Playground: './src/fe/MainPlayground.js',
    Vis: './src/fe/MainVis.js',
    BrowserPerftest: './perftest/browserMain.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './dist/js/')
  },
  plugins: [
    // new cleanPlugin(['public/javascripts/*']),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  resolve: {
    alias: {
      '@Lib': path.resolve(__dirname, 'lib/'),
      '@BE': path.resolve(__dirname, 'src/be/'),
      '@FE': path.resolve(__dirname, 'src/fe/'),
    },
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "util": require.resolve("util"),
      "assert": require.resolve("assert")
    }
  },
  mode: 'development',
  devtool: "inline-source-map",
};
