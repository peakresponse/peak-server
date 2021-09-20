const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  output: {
    publicPath: '/angular/auth/',
  },
  plugins: [new BundleTracker({ filename: './projects/auth/webpack-stats.json' })],
};
