'use strict';
const fs = require('fs-extra');
const depsFromSource = require('./deps-from-source');

module.exports = function depsFromFile(file) {
  return depsFromSource(fs.readFileSync(file, 'UTF8'));
};
