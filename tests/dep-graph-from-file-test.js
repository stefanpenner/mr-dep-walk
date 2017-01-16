'use strict';

const fixturify = require('fixturify');
const fs = require('fs-extra');
const ROOT = __dirname  + '/fixtures/';

const expect = require('chai').expect;
const depFilesFromFile = require('../lib/dep-files-from-file');

describe('.depFilesFromFile', function() {
  describe('ES5', function() {
    beforeEach(function(){
      fs.removeSync(ROOT);
      fixturify.writeSync(ROOT + 'es5', {
        'foo.js': ` define('foo', ['a', 'b/c'], function() { });`,
        'a.js': `define('a', ['exports', 'require'], function() { })`,
        'b': {
          'c.js': `define('c', ['../a', '../d'], function() { })`
        },
        'd.js': `define('d', ['foo'], function() { })`
      });
    });

    afterEach(function() {
      fs.removeSync(ROOT);
    });

    it('extracts', function() {
      expect(depFilesFromFile(ROOT + 'es5', { entry:'foo.js' })).to.eql([
        'a.js',
        'b/c.js',
        'd.js',
        'foo.js',
      ]);

      expect(depFilesFromFile(ROOT + 'es5', { entry: 'a.js' })).to.eql([]);

      expect(depFilesFromFile(ROOT + 'es5', { entry: 'b/c.js' })).to.eql([
        'a.js',
        'd.js',
        'foo.js',
        'b/c.js',
      ]);

      expect(depFilesFromFile(ROOT + 'es5', { entry: 'd.js' })).to.eql([
        'foo.js',
        'a.js',
        'b/c.js',
        'd.js',
      ]);
    });

    it('ignores external', function() {
      expect(depFilesFromFile(ROOT + 'es5', {
        entry: 'foo.js',
        external: ['b/c'],
      })).to.eql([
        'a.js'
      ]);
    });
  });

  describe('ES6', function() {
    beforeEach(function() {
      fs.removeSync(ROOT);
      fixturify.writeSync(ROOT + 'es6', {
        'foo.js': `
import x from 'a';
import y from 'b/c';`,
        'a.js': ``,
        'b': {
          'c.js': `
      import a from '../a';
      import d from '../d';
    `
        },
        'd.js': `import foo from 'foo';`
      });
    });

    afterEach(function() {
      fs.removeSync(ROOT);
    });

    it('extracts', function() {
      expect(depFilesFromFile(ROOT + 'es6', { entry: 'foo.js' })).to.eql([
        'a.js',
        'b/c.js',
        'd.js',
        'foo.js',
      ]);

      expect(depFilesFromFile(ROOT + 'es6', { entry: 'a.js' })).to.eql([]);

      expect(depFilesFromFile(ROOT + 'es6', { entry: 'b/c.js' })).to.eql([
        'a.js',
        'd.js',
        'foo.js',
        'b/c.js',
      ]);

      expect(depFilesFromFile(ROOT + 'es6', { entry: 'd.js' })).to.eql([
        'foo.js',
        'a.js',
        'b/c.js',
        'd.js',
      ]);
    });
  });
});
