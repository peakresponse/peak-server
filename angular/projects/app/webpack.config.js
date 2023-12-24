const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  output: {
    publicPath: '/angular/app/',
  },
  plugins: [
    new BundleTracker({
      path: __dirname,
      filename: 'webpack-stats.json',
    }),
  ],
};
