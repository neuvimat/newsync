// const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

// const preprocessor = {
//     DEBUG: true,
//     SERVER: true,
//     CLIENT: false
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
        //     // loader: `ifdef-loader?${ifdef_query}`,
        // },
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ]
  },
  target: 'node',
  mode: 'none',
  entry: {
    simulationNewSyncMain: './perftest/src/simulationNewSyncMain.js',
    simulationVanillaMain: './perftest/src/simulationVanillaMain.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './perftest/bin')
  },
  resolve: {
    extensions: ['.js', '.mjs'],
    alias: {
      '@Lib': path.resolve(__dirname, 'lib/'),
      '@BE': path.resolve(__dirname, 'src/be/'),
      '@FE': path.resolve(__dirname, 'src/fe/'),
      '@': path.resolve(__dirname, 'src/')
    }
  },
  node: {
    global: true,
    // Need this when working with express, otherwise the build fails
    __dirname: false,   // if you don't put this is, __dirname
    __filename: false,  // and __filename return blank or /
  },
  externals: [nodeExternals()],
  devtool: "inline-source-map",
};
