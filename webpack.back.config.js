// const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
// const cleanPlugin = require('clean-webpack-plugin');

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
            }
        ]
    },
    target: 'node',
    mode: 'none',
    entry: {
        be: './src/be/main.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './bin')
    },
    // plugins: [
        // new cleanPlugin(['public/javascripts/*']),
    // ],
    resolve: {
        extensions: ['.js', '.mjs'],
        alias: {
            Lib: path.resolve(__dirname, '/lib/'),
            BE: path.resolve(__dirname, '/src/be/'),
            FE: path.resolve(__dirname, '/src/fe/'),
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
