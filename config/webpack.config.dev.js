const webpackMerge = require('webpack-merge');

const commonConfig = require('./webpack.config.common');
const helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {
  mode: 'development',

  devtool: 'cheap-module-eval-source-map',

  devServer: {
    host: '0.0.0.0',
    port: 8080,
    disableHostCheck: true,
    publicPath: `http${process.env.BASE_URL.startsWith('https://') ? 's' : ''}://${process.env.BASE_HOST}:8080/dist/`,
    historyApiFallback: true,
    stats: 'normal',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },

  output: {
    path: helpers.root('../dist/'),
    publicPath: `http${process.env.BASE_URL.startsWith('https://') ? 's' : ''}://${process.env.BASE_HOST}:8080/dist/`,
    filename: '[name].[hash].bundle.js',
    chunkFilename: '[id].[hash].chunk.js',
  },

  optimization: {
    noEmitOnErrors: true,
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loaders: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              configFileName: helpers.root('tsconfig.json'),
            },
          },
          'angular2-template-loader',
          'angular-router-loader',
        ],
        exclude: [/node_modules/],
      },
    ],
  },
});
