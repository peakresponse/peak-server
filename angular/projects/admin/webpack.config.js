const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  output: {
    publicPath: '/angular/admin/',
  },
  plugins: [new BundleTracker({ filename: './projects/admin/webpack-stats.json' })],
};
