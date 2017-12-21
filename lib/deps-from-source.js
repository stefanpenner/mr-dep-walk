'use strict';

const acorn = require('acorn');
const depsFromAST = require('./deps-from-ast');

module.exports = function depsFromSource(source) {
  return depsFromAST(
    acorn.parse(source, {
      ecmaVersion: 8,
      sourceType: 'module',
    })
  );
};
