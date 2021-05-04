const NodeCache = require('node-cache');

const cache = new NodeCache();

function get(key) {
  return cache.get(key);
}

function set(key, val, ttl) {
  cache.set(key, val, ttl);
}

module.exports = {
  get,
  set,
};
