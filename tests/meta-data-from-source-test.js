'use strict';

const expect = require('chai').expect;
const metaDataFromSource = require('../lib/meta-data-from-source');
const defaultParser = require('../lib/default-parser');

describe('.metaDataFromSource', function() {
  describe('ES5', function() {
    const FOO = `define('foo', ['a', 'b/c'], function() { });`;
    const A = `define('a', ['exports', 'require'], function() { })`;
    const C = `define('c', ['../a', '../d'], function() { })`;
    const D = `define('d', ['foo'], function() { })`;

    it('extracts deps', function() {
      expect(metaDataFromSource(FOO)).to.eql({
        name: 'foo',
        imports: {
          a: ['default'],
          'b/c': ['default'],
        },
        exports: {},
      });

      expect(metaDataFromSource(A)).to.eql({
        name: 'a',
        imports: {
          imports: ['default'],
          exports: ['default'],
        },
        exports: {},
      });

      expect(metaDataFromSource(C)).to.eql({
        name: 'c',
        imports: {
          '../a': ['default'],
          '../d': ['default'],
        },
        exports: {},
      });

      expect(metaDataFromSource(D)).to.eql({
        name: 'd',
        imports: {
          foo: ['default'],
        },
        exports: {},
      });
    });
  });

  describe('ES6', function() {
    const FOO = `
import x from 'a';
import y from 'b/c';`;
    const A = ``;
    const C = `
      import a from '../a';
      import d from '../d';
    `;
    const D = `import foo from 'foo';`;

    it('extracts deps', function() {
      expect(metaDataFromSource(FOO)).to.eql({
        name: null,
        imports: {
          a: ['default'],
          'b/c': ['default'],
        },
        exports: {},
      });
      expect(metaDataFromSource(A)).to.eql({
        name: null,
        imports: {},
        exports: {},
      });
      expect(metaDataFromSource(C)).to.eql({
        name: null,
        imports: {
          '../a': ['default'],
          '../d': ['default'],
        },
        exports: {},
      });
      expect(metaDataFromSource(D)).to.eql({
        name: null,
        imports: {
          foo: ['default'],
        },
        exports: {},
      });
    });
  });

  describe('ES mixed', function() {
    it('define then es6', function() {
      expect(
        metaDataFromSource(`
define('foo', ['bar'], function() { });
import x from 'a';
import y from 'b/c';
      `)
      ).to.eql({
        name: 'foo',
        imports: {
          a: ['default'],
          'b/c': ['default'],
        },
        exports: {},
      });
    });

    it('es6 then define', function() {
      expect(
        metaDataFromSource(`
import x from 'a';
import y from 'b/c';
define('foo', ['bar'], function() { });
      `)
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

  describe('pluggable parse', function() {
    it('provide alternative parser', function() {
      let parseCount = 0;
      expect(
        metaDataFromSource(
          `
import x from 'a';
import y from 'b/c';
      `,
          {
            parse(source) {
              parseCount++;
              return defaultParser(source);
            },
          }
        )
      ).to.eql({
        name: null,
        imports: {
          a: ['default'],
          'b/c': ['default'],
        },
        exports: {},
      });

      expect(parseCount).to.eql(1);
    });
  });
});
