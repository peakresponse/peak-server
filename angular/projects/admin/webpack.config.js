const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  output: {
    publicPath: '/angular/admin/',
  },
  plugins: [
    new BundleTracker({
      path: __dirname,
      filename: 'webpack-stats.json',
    }),
  ],
};
