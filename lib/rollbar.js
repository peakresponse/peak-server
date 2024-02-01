const Rollbar = require('rollbar');

const rollbar = new Rollbar(process.env.ROLLBAR_POST_SERVER_ITEM_ACCESS_TOKEN);

module.exports = rollbar;
