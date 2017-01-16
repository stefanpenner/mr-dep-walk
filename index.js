'use strict';
let HASH;
module.exports = {
  depsFromFile: require('./lib/deps-from-file'),
  depsFromSource: require('./lib/deps-from-source'),
  depFilesFromFile: require('./lib/dep-files-from-file'),
  get _hash() {
    return (HASH = HASH || require('hash-for-dep')('./'))
  }
};
