const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
  plugins: [
    new MiniCssExtractPlugin(),
    new BundleTracker({
      path: __dirname,
      filename: 'webpack-stats.json',
    }),
  ],
};
