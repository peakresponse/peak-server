const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('@angular-devkit/build-angular/node_modules/mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.font\.js/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          'webfonts-loader',
        ],
      },
    ],
  },
  output: {
    publicPath: '/angular/design/',
  },
  plugins: [new BundleTracker({ filename: './projects/design/webpack-stats.json' })],
};
