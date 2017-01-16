'use strict';

const acorn = require('acorn');
// lifted from: https://github.com/ef4/ember-browserify/blob/master/lib/stubs.js (EF4 deserves credit);
function forEachNode(node, visit) {
  if (node && typeof node === 'object' && !node._eb_visited) {
    node._eb_visited = true;
    visit(node);
    var keys = Object.keys(node);
    for (var i=0; i < keys.length; i++) {
      forEachNode(node[keys[i]], visit);
    }
  }
}

module.exports = function depsFromSource(source) {
  // TODO: add a persistent cache
  try {
    return es5(source);
  } catch (e) {
    if (e.name === 'SyntaxError') {
      // assume it is ES6 syntax, and try again
      return es6(source);
    }
    // no idea what went wrong, rethrow
    throw e;
  }
};

function es5(src) {
  var imports = [];

  var ast = acorn.parse(src);

  forEachNode(ast, function(entry) {
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
          break;
        }
      }
    }
  });
  return imports;
}

function es6(src) {
  let imports = []

  let ast = acorn.parse(src, {
    ecmaVersion: 6,
    sourceType: 'module'
  });

  forEachNode(ast, function(entry) {
    if (entry.type === 'ImportDeclaration') {
      let value = entry.source.value;
      if (value === 'exports' || value === 'require') {
        return;
      }
      imports.push(value);
    }
  });

  return imports;
}
