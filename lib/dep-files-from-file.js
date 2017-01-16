'use strict';
const fs = require('fs-extra');
const depsFromSource = require('./deps-from-source');
const path = require('path');
const amdNameResolver = require('amd-name-resolver');

module.exports = function depFilesFromFile(root, options, _files) {
  let files = _files || [];
  let file = options.entry;
  let deps = depsFromSource(fs.readFileSync(path.join(root, file) , 'UTF8'));

  for (let i = 0; i < deps.length; i++) {
    let dep = deps[i];
    let resolved = amdNameResolver.moduleResolve(dep, file);
    let dependency = resolved + '.js';

    if (Array.isArray(options.external) && options.external.indexOf(resolved) > -1) {
      continue;
    }

    if (files.indexOf(dependency) === -1) {
      files.push(dependency);
      depFilesFromFile(root, {
        entry: dependency,
        external: options.external
      }, files);
    }
  }

  return files;
};
