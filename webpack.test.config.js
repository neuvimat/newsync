// const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const path = require('path');
const webpack = require('webpack')

let glob = require("glob");

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
  entry: glob.sync("./test_src/*.js").reduce((prev, current)=>{
    const split = current.split('/')
    const filename = split[split.length-1]
    prev[filename] = current
    return prev
  }, {}),
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, './test/')
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
      '@': path.resolve(__dirname, 'src/fe/')
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
