const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  output: {
    publicPath: '/angular/design/',
  },
  plugins: [
    new BundleTracker({ filename: './projects/design/webpack-stats.json' }),
  ],
};
