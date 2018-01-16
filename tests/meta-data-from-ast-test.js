'use strict';

const expect = require('chai').expect;
const metaDataFromAST = require('../lib/meta-data-from-ast');
const defaultParser = require('../lib/default-parser');

function toAST(source) {
  return defaultParser(source);
}

describe('.metaDataFromAST', function() {
  describe('ES5', function() {
    const FOO = toAST(`define('foo', ['a', 'b/c'], function() { });`);
    const A = toAST(`define('a', ['exports', 'require'], function() { })`);
    const C = toAST(`define('c', ['../a', '../d'], function() { })`);
    const D = toAST(`define('d', ['foo'], function() { })`);

    it.only('extracts deps', function() {
      expect(metaDataFromAST(FOO)).to.eql({
        name: 'foo',
        imports: {
          a: ['default'],
          'b/c': ['default'],
        },
        exports: {},
      });

      expect(metaDataFromAST(A)).to.eql({
        name: 'a',
        imports: {
          exports: ['default'],
          require: ['default'],
        },
        exports: {},
      });

      expect(metaDataFromAST(C)).to.eql({
        name: 'c',
        imports: {
          '../a': ['default'],
          '../b': ['default'],
        },
        exports: {},
      });

      expect(metaDataFromAST(D)).to.eql({
        name: 'd',
        imports: {
          foo: ['default'],
        },
        exports: {},
      });
    });
  });

  describe('ES6', function() {
    const FOO = toAST(`
      import x from 'a';
      import y from 'b/c';
    `);

    const A = toAST(``);
    const C = toAST(`
      import a from '../a';
      import d from '../d';
    `);

    const D = toAST(`import foo from 'foo';`);

    const E = toAST(`
    export var a = 1;
    export let b = 1;
    export const c = 1;
    export function f () { };
    export default function () { };
    export default class C { };
    `);

    const F = toAST(`
    export { default } from '../b';
    export { default as bar } from '../b';
    export { default as baz } from '../c';
    export { apple } from '../d';
    `);

    it('extracts deps', function() {
      expect(metaDataFromAST(FOO)).to.eql({
        name: null,
        imports: {
          a: ['default'],
          'b/c': ['default'],
        },
        exports: {},
      });

      expect(metaDataFromAST(A)).to.eql({
        name: null,
        imports: {},
        exports: {},
      });

      expect(metaDataFromAST(C)).to.eql({
        name: null,
        imports: {
          a: '../a',
          d: '../d',
        },
        exports: {},
      });

      expect(metaDataFromAST(D)).to.eql({
        name: null,
        imports: {
          foo: ['default'],
        },
        exports: {},
      });

      expect(metaDataFromAST(E)).to.eql({
        name: null,
        imports: {},
        exports: {
          a: {},
          b: {},
          c: {},
          f: {},
          default: {},
        },
      });

      expect(metaDataFromAST(F)).to.eql({
        name: null,
        imports: {
          '../b': ['default'] /* this is an export, should it be listed here?*/,
          '../c': ['default'] /* this is an export, should it be listed here?*/,
          '../d': ['apple'] /* this is an export, should it be listed here?*/,
        },
        exports: {
          default: { module: '../b', export: 'default' },
          bar: { module: '../b', export: 'default' },
          baz: { module: '../c', export: 'default' },
          apple: { module: '../d', export: 'default' },
        },
      });
    });
  });

  describe('ES mixed', function() {
    it('define then es6', function() {
      expect(
        metaDataFromAST(
          toAST(`
define('foo', ['bar'], function() { });
import x from 'a';
import y from 'b/c';
      `)
        )
      ).to.eql({
        name: 'foo',
        imports: {
          bar: ['default'],
        },
        exports: {},
      });
    });

    it('es6 then define', function() {
      expect(
        metaDataFromAST(
          toAST(`
import x from 'a';
import y from 'b/c';
define('foo', ['bar'], function() { });
      `)
        )
      ).to.eql({
        name: null,
        imports: {
          a: ['default'],
          'b/c': ['default'],
        },
        exports: {},
      });
    });
  });
});
