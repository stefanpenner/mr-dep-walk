'use strict';

const acorn = require('acorn');
// lifted from: https://github.com/ef4/ember-browserify/blob/master/lib/stubs.js (EF4 deserves credit);
//
const STOP = {};
function forEachNode(node, visit) {
  if (node && typeof node === 'object' && !node._eb_visited) {
    node._eb_visited = true;
    let shouldStop = visit(node);
    if (STOP === shouldStop) {
      return STOP;
    }
    let keys = Object.keys(node);
    for (let i = 0; i < keys.length; i++) {
      let shouldStop = forEachNode(node[keys[i]], visit);
      if (STOP === shouldStop) {
        return STOP;
      }
    }
  }
}

module.exports = function depsFromSource(source) {
  // TODO: add a persistent cache
  let imports = [];

  let ast = acorn.parse(source, {
    ecmaVersion: 8,
    sourceType: 'module',
  });

  let hasImportDeclaration = false;

  forEachNode(ast, function(entry) {
    if (entry.type === 'ImportDeclaration') {
      hasImportDeclaration = true;
      let value = entry.source.value;
      if (value === 'exports' || value === 'require') {
        return;
      }
      imports.push(value);
    }

    if (hasImportDeclaration) {
      return;
    }

    if (entry.type === 'CallExpression' && entry.callee.name === 'define') {
      for (let i = 0; i < entry.arguments.length; i++) {
        let item = entry.arguments[i];
        if (item.type === 'ArrayExpression') {
          for (let j = 0; j < item.elements.length; j++) {
            let element = item.elements[j];
            let value = element.value;
            if (value !== 'exports' && value !== 'require') {
              imports.push(value);
            }
          }
          return STOP;
        }
      }
      return STOP;
    }
  });

  return imports;
};
