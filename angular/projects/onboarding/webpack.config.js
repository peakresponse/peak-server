const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  output: {
    publicPath: '/angular/onboarding/',
  },
  plugins: [new BundleTracker({ filename: './projects/onboarding/webpack-stats.json' })],
};
