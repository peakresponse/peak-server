const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  output: {
    publicPath: '/angular/app/',
  },
  plugins: [new BundleTracker({ filename: './projects/app/webpack-stats.json' })],
};
